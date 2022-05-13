import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Code, Function as LambdaFunction, Runtime } from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { GenericTable } from './genericTable';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

export class SpaceFinderCdkAppStack extends Stack {

  private api = new RestApi(this, 'SpaceApi');
  private spacesTable = new GenericTable(this, {
    tableName: 'SpacesTables',
    primaryKey: 'spacesId',
    createLambdaPath: 'create', // if error causes change to Create
    readLambdaPath: 'read', // if error causes change to Read
    secondaryIndexes: ['location']

  })

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const helloLambda = new LambdaFunction(this, 'helloLambda', {
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset(join(__dirname, '..', 'services', 'hello')),
      handler: 'hello.main'
    });

    const helloLambdaNodeJs = new NodejsFunction(this, 'helloLambdaNodeJs', {
      entry: (join(__dirname, '..', 'services', 'hello', 'hello.js')),
      handler: 'main'
    });

    // new NodejsFunction(this, 'createLambdaFunction', {
    //   entry: (join(__dirname, '..', 'services', 'SpacesTables', 'create.js')),
    //   handler: 'handler'
    // });

    const s3ListPolicy = new PolicyStatement();
    s3ListPolicy.addActions('s3:ListAllMyBuckets');
    s3ListPolicy.addResources('*');
    helloLambdaNodeJs.addToRolePolicy(s3ListPolicy);

    // Hello Api lambda integration
    const helloApiLambdaIntegration = new LambdaIntegration(helloLambda);
    const helloLambdaResource = this.api.root.addResource('hello');
    helloLambdaResource.addMethod('GET', helloApiLambdaIntegration);

    // Spaces Api lambda integrations:
    const spaceResource = this.api.root.addResource('spaces');
    spaceResource.addMethod('POST', this.spacesTable.createLambdaIntegration)
    spaceResource.addMethod('GET', this.spacesTable.readLambdaIntegration);

  }
}
