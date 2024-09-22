import * as cdk from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Architecture, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export class TempCdkStackStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // new Bucket(this, 'myFirstBucket', {
    //   versioned: true,
    //   bucketName: 'ecs-dev-myfirstbucket',
    //   encryption: BucketEncryption.KMS_MANAGED,
    //   bucketKeyEnabled: true,
    //   blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    //   enforceSSL: true,
    //   removalPolicy: cdk.RemovalPolicy.DESTROY, // Use only for non-production environments
    //   autoDeleteObjects: true, // Use only for non-production environments

    // });





    const myFirstLambda = new NodejsFunction(this, 'myFirstLambda', {
      entry: 'lambdas/index.ts',
      handler: 'handler',
      runtime: Runtime.NODEJS_18_X,
      architecture: Architecture.ARM_64,
      memorySize: 128,
      timeout: cdk.Duration.seconds(30),
      environment: {
        NODE_OPTIONS: '--enable-source-maps',
        NODE_ENV: 'production',
      },
      bundling: {
        minify: true,
        sourceMap: true,
        target: 'es2020',
        externalModules: ['aws-sdk'],
      },
      tracing: Tracing.ACTIVE,
      logRetention: RetentionDays.ONE_WEEK,
      currentVersionOptions: {
        removalPolicy: cdk.RemovalPolicy.RETAIN,
        retryAttempts: 1,
      }})

      const translatePolicy = new PolicyStatement({
        actions: ['translate:TranslateText'],
        resources: ['*'],
      }); 
      
      const translateLambda = new NodejsFunction(this, 'translateLambda', {
        entry: 'lambdas/Translate/index.ts',
        handler: 'handler',
        runtime: Runtime.NODEJS_18_X,
        architecture: Architecture.ARM_64,
        memorySize: 128,
        timeout: cdk.Duration.seconds(30),
        initialPolicy: [translatePolicy],
        environment: {
          NODE_OPTIONS: '--enable-source-maps',
          NODE_ENV: 'dev',
        },
        bundling: {
          minify: false,
          sourceMap: true,
          target: 'es2020',
          externalModules: ['aws-sdk/*'],
        },
        tracing: Tracing.ACTIVE,
        logRetention: RetentionDays.ONE_WEEK,
        })
  



      const api = new RestApi(this, 'myFirstApi', {})

      api.root.addMethod('POST', new LambdaIntegration(translateLambda))

  }
}
