import * as cdk from 'aws-cdk-lib'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import * as logs from 'aws-cdk-lib/aws-logs'
import * as ssm from 'aws-cdk-lib/aws-ssm'
import * as iam from 'aws-cdk-lib/aws-iam'
import { Construct } from 'constructs'

interface VeylaStackProps extends cdk.StackProps {
  domainName?: string
  certificateArn?: string
}

export class VeylaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: VeylaStackProps) {
    super(scope, id, props)

    // VPC
    const vpc = new ec2.Vpc(this, 'VeylaVPC', {
      maxAzs: 2,
      natGateways: 1,
    })

    // ECS Cluster
    const cluster = new ecs.Cluster(this, 'VeylaCluster', {
      vpc,
      containerInsights: true,
    })

    // ALB Security Group
    const albSg = new ec2.SecurityGroup(this, 'AlbSecurityGroup', {
      vpc,
      description: 'ALB Security Group'
    })
    albSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'HTTP inbound')
    albSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'HTTPS inbound')

    // Application Load Balancer
    const alb = new elbv2.ApplicationLoadBalancer(this, 'VeylaALB', {
      vpc,
      internetFacing: true,
      securityGroup: albSg,
    })

    // HTTP Listener (redirect to HTTPS)
    alb.addListener('HttpListener', {
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      defaultAction: elbv2.ListenerAction.redirect({
        protocol: 'HTTPS',
        port: '443',
        permanent: true,
      }),
    })

    // HTTPS Listener
    const httpsListener = alb.addListener('HttpsListener', {
      port: 443,
      protocol: elbv2.ApplicationProtocol.HTTPS,
      certificates: [
        // Use the default ACM certificate that's already validated in Cloudflare
        elbv2.ListenerCertificate.fromArn(process.env.ACM_CERTIFICATE_ARN!)
      ],
      defaultAction: elbv2.ListenerAction.fixedResponse(404, {
        contentType: 'text/plain',
        messageBody: 'Not Found'
      })
    })

    // Target Group
    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'DashboardTargetGroup', {
      vpc,
      port: 3001,
      protocol: elbv2.ApplicationProtocol.HTTP,
      healthCheck: {
        path: '/dashboard/api/health',
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
      },
      targetType: ecs.TargetType.IP,
    })

    // Forward all traffic to the target group since Cloudflare handles routing
    httpsListener.addAction('DashboardAction', {
      priority: 1,
      conditions: [
        elbv2.ListenerCondition.pathPatterns(['/*']),
      ],
      action: elbv2.ListenerAction.forward([targetGroup])
    })

    // Log group
    const logGroup = new logs.LogGroup(this, 'DashboardLogGroup', {
      logGroupName: '/ecs/veyla-dashboard',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: logs.RetentionDays.ONE_WEEK,
    })

    // Task Definition
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'DashboardTaskDef', {
      cpu: 1024,
      memoryLimitMiB: 2048,
    })

    // Get environment variables
    const supabaseUrlParam = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKeyParam = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Container
    const container = taskDefinition.addContainer('DashboardContainer', {
      image: ecs.ContainerImage.fromAsset('../packages/dashboard', {
        buildArgs: {
          NEXT_PUBLIC_SUPABASE_URL: supabaseUrlParam ?? '',
          NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKeyParam ?? '',
          NEXT_PUBLIC_APP_URL: 'https://app.veylaai.com',
        },
      }),
      environment: {
        NODE_ENV: 'production',
        PORT: '3001',
        NEXT_PUBLIC_APP_URL: 'https://app.veylaai.com',
        NEXT_PUBLIC_SUPABASE_URL: supabaseUrlParam ?? '',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKeyParam ?? '',
      },
      logging: ecs.LogDrivers.awsLogs({
        logGroup,
        streamPrefix: 'dashboard',
      }),
      healthCheck: {
        command: ['CMD-SHELL', 'curl -f http://localhost:3001/dashboard/api/health || exit 1'],
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        retries: 3,
      },
    })

    container.addPortMappings({
      containerPort: 3001,
      protocol: ecs.Protocol.TCP,
    })

    // Security group for ECS Service
    const serviceSg = new ec2.SecurityGroup(this, 'DashboardServiceSG', {
      vpc,
      description: 'Security group for ECS service',
    })
    serviceSg.connections.allowFrom(albSg, ec2.Port.tcp(3001), 'Allow ALB to access app')

    // ECS Service with FARGATE_SPOT
    const service = new ecs.FargateService(this, 'DashboardService', {
      cluster,
      taskDefinition,
      desiredCount: 1,
      capacityProviderStrategies: [
        {
          capacityProvider: 'FARGATE_SPOT',
          weight: 1,
        },
      ],
      securityGroups: [serviceSg],
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      assignPublicIp: false,
    })

    // Attach to target group
    targetGroup.addTarget(service)

    // Permission to read from SSM if needed
    taskDefinition.taskRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        actions: ['ssm:GetParameter'],
        resources: [
          `arn:aws:ssm:${this.region}:${this.account}:parameter/veyla/*`
        ],
      })
    )

    // Output the ALB DNS name
    new cdk.CfnOutput(this, 'LoadBalancerDNS', {
      value: alb.loadBalancerDnsName,
      description: 'Public DNS of the ALB',
    })
  }
}
