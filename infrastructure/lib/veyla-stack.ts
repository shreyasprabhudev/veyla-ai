import * as cdk from 'aws-cdk-lib'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as targets from 'aws-cdk-lib/aws-route53-targets'
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

    // AC
    if (!process.env.ACM_CERTIFICATE_ARN) {
      throw new Error('ACM_CERTIFICATE_ARN env var required')
    }
    const certificate = acm.Certificate.fromCertificateArn(
      this,
      'DashboardCertificate',
      process.env.ACM_CERTIFICATE_ARN!
    )

    // ALB
    const albSg = new ec2.SecurityGroup(this, 'AlbSecurityGroup', {
      vpc,
      description: 'ALB Security Group'
    })
    albSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'HTTP inbound')
    albSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'HTTPS inbound')

    const alb = new elbv2.ApplicationLoadBalancer(this, 'VeylaALB', {
      vpc,
      internetFacing: true,
      securityGroup: albSg,
    })

    // HTTP → HTTPS
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
      certificates: [certificate],
    })

    // Target Group
    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'DashboardTargetGroup', {
      vpc,
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      healthCheck: {
        path: '/api/health',
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
      },
    })

    httpsListener.addTargetGroups('TargetDashboard', {
      targetGroups: [targetGroup],
    })

    // DNS
    const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: props?.domainName ?? 'veylaai.com',
    })

    new route53.ARecord(this, 'DashboardARecord', {
      zone: hostedZone,
      recordName: 'app.veylaai.com',
      target: route53.RecordTarget.fromAlias(new targets.LoadBalancerTarget(alb)),
      ttl: cdk.Duration.minutes(5),
    })

    // ECS Task Definition
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'DashboardTaskDef', {
      cpu: 1024, // 1 vCPU
      memoryLimitMiB: 2048, // 2GB
    })

    // Log group
    const logGroup = new logs.LogGroup(this, 'DashboardLogGroup', {
      logGroupName: '/ecs/veyla-dashboard',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: logs.RetentionDays.ONE_WEEK,
    })

    // (Optional) Store env in SSM or just pass them below
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
        PORT: '3000',
        NEXT_PUBLIC_APP_URL: 'https://app.veylaai.com',
        NEXT_PUBLIC_SUPABASE_URL: supabaseUrlParam ?? '',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKeyParam ?? '',
      },
      logging: ecs.LogDrivers.awsLogs({
        logGroup,
        streamPrefix: 'dashboard',
      }),
      healthCheck: {
        command: ['CMD-SHELL', 'curl -f http://localhost:3000/api/health || exit 1'],
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        retries: 3,
      },
    })

    container.addPortMappings({
      containerPort: 3000,
      protocol: ecs.Protocol.TCP,
    })

    // Security group for ECS Service
    const serviceSg = new ec2.SecurityGroup(this, 'DashboardServiceSG', {
      vpc,
      description: 'Security group for ECS service',
    })
    serviceSg.connections.allowFrom(albSg, ec2.Port.tcp(3000), 'Allow ALB to access app')

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

    new cdk.CfnOutput(this, 'LoadBalancerDNS', {
      value: alb.loadBalancerDnsName,
      description: 'Public DNS of the ALB',
    })
  }
}
