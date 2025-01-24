import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export class VeylaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, {
      ...props,
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION || 'us-east-2'
      }
    });

    // Create VPC
    const vpc = new ec2.Vpc(this, 'VeylaVPC', {
      maxAzs: 2,
      natGateways: 1,
    });

    // Create ECS Cluster
    const cluster = new ecs.Cluster(this, 'VeylaCluster', {
      vpc,
      containerInsights: true,
    });

    // Verify certificate ARN
    if (!process.env.ACM_CERTIFICATE_ARN) {
      throw new Error('ACM_CERTIFICATE_ARN environment variable is required');
    }
    console.log('Using certificate ARN:', process.env.ACM_CERTIFICATE_ARN);

    // Use existing ACM certificate
    const certificate = acm.Certificate.fromCertificateArn(this, 'DashboardCertificate', process.env.ACM_CERTIFICATE_ARN!);

    // Create security group for ALB
    const albSg = new ec2.SecurityGroup(this, 'AlbSecurityGroup', {
      vpc,
      description: 'Security group for ALB',
    });
    albSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP traffic');
    albSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'Allow HTTPS traffic');

    // Create ALB
    const alb = new elbv2.ApplicationLoadBalancer(this, 'VeylaALB', {
      vpc,
      internetFacing: true,
      securityGroup: albSg,
    });

    // Create target group
    const targetGroup = new elbv2.ApplicationTargetGroup(this, 'DashboardTarget', {
      vpc,
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [],
      healthCheck: {
        path: '/api/health',
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
        healthyHttpCodes: '200',
      },
      deregistrationDelay: cdk.Duration.seconds(30),
    });

    // Create HTTPS Listener
    const httpsListener = alb.addListener('HttpsListener', {
      port: 443,
      protocol: elbv2.ApplicationProtocol.HTTPS,
      certificates: [elbv2.ListenerCertificate.fromArn(process.env.ACM_CERTIFICATE_ARN)],
      defaultTargetGroups: [targetGroup],
    });

    // Create HTTP Listener that redirects to HTTPS
    alb.addListener('HttpListener', {
      port: 80,
      protocol: elbv2.ApplicationProtocol.HTTP,
      defaultAction: elbv2.ListenerAction.redirect({
        protocol: 'HTTPS',
        port: '443',
        permanent: true,
      }),
    });

    // Create S3 bucket for landing page
    const landingBucket = new s3.Bucket(this, 'LandingBucket', {
      bucketName: 'veylaai.com',
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false
      }),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Create ECS Task Definition
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'DashboardTask', {
      memoryLimitMiB: 2048,  // 2GB for better performance
      cpu: 1024,    // 1 vCPU
    });

    // Create log group with retention
    const logGroup = new logs.LogGroup(this, 'DashboardLogGroup', {
      logGroupName: '/ecs/veyla-dashboard',
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create SSM parameters for sensitive values
    const supabaseUrlParam = process.env.NEXT_PUBLIC_SUPABASE_URL ? new ssm.StringParameter(this, 'SupabaseUrl', {
      parameterName: '/veyla/dashboard/NEXT_PUBLIC_SUPABASE_URL',
      stringValue: process.env.NEXT_PUBLIC_SUPABASE_URL,
    }) : undefined;

    const supabaseAnonKeyParam = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? new ssm.StringParameter(this, 'SupabaseAnonKey', {
      parameterName: '/veyla/dashboard/NEXT_PUBLIC_SUPABASE_ANON_KEY',
      stringValue: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    }) : undefined;

    // Add container to task definition
    const container = taskDefinition.addContainer('DashboardContainer', {
      image: ecs.ContainerImage.fromAsset('../packages/dashboard', {
        buildArgs: {
          BUILDPLATFORM: 'linux/amd64',
          TARGETPLATFORM: 'linux/amd64'
        }
      }),
      memoryLimitMiB: 2048,
      cpu: 1024,
      environment: {
        NODE_ENV: 'production',
        PORT: '3000',
        HOSTNAME: '0.0.0.0',  // Required for Next.js
        NEXT_TELEMETRY_DISABLED: '1',
        NEXT_PUBLIC_APP_URL: 'https://app.veylaai.com',
        DOMAIN_NAME: 'veylaai.com',
        DEBUG: '*',  // Enable all debug logs
        ...(process.env.NEXT_PUBLIC_SUPABASE_URL && { NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL }),
        ...(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && { NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY })
      },
      healthCheck: {
        command: ['CMD-SHELL', 'curl -f http://localhost:3000/api/health || exit 1'],
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        retries: 3,
        startPeriod: cdk.Duration.seconds(60),
      },
      logging: ecs.LogDrivers.awsLogs({
        logGroup,
        streamPrefix: 'dashboard',
      }),
    });

    container.addPortMappings({
      containerPort: 3000,
      protocol: ecs.Protocol.TCP,
    });

    // Create Security Group for ECS Service
    const serviceSg = new ec2.SecurityGroup(this, 'ServiceSecurityGroup', {
      vpc,
      description: 'Security group for Dashboard Service',
    });

    // Allow inbound from ALB
    serviceSg.connections.allowFrom(
      albSg,
      ec2.Port.tcp(3000),
      'Allow inbound from ALB'
    );

    // Create ECS Service
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
      assignPublicIp: false,  // Use private subnets
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
    });

    // Add target group to ALB
    targetGroup.addTarget(service);

    // Configure target group attributes
    const cfnTargetGroup = targetGroup.node.defaultChild as elbv2.CfnTargetGroup;
    cfnTargetGroup.targetGroupAttributes = [
      { key: 'deregistration_delay.timeout_seconds', value: '30' },
      { key: 'stickiness.enabled', value: 'false' },
      { key: 'load_balancing.algorithm.type', value: 'round_robin' }
    ];

    // Update HTTPS listener
    httpsListener.addTargetGroups('DashboardTargetGroup', {
      targetGroups: [targetGroup],
      conditions: [
        elbv2.ListenerCondition.hostHeaders(['app.veylaai.com']),
      ],
      priority: 1,
    });

    // Add default action to HTTPS listener if not exists
    if (!httpsListener.node.tryFindChild('DefaultAction')) {
      httpsListener.addAction('DefaultAction', {
        action: elbv2.ListenerAction.fixedResponse(404, {
          contentType: 'text/plain',
          messageBody: 'Not Found',
        }),
      });
    }

    // Grant read access to task
    taskDefinition.taskRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        actions: ['ssm:GetParameter'],
        resources: [
          `arn:aws:ssm:${this.region}:${this.account}:parameter/veyla/dashboard/*`,
        ],
      })
    );

    // Output the ALB DNS name
    new cdk.CfnOutput(this, 'LoadBalancerDNS', {
      value: alb.loadBalancerDnsName,
    });
  }
}
