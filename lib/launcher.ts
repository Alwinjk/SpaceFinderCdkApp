import { SpaceFinderCdkAppStack as SpaceStack } from './space_finder_cdk_app-stack';
import { App } from 'aws-cdk-lib';

const app = new App();
new SpaceStack(app, 'Space-finder', {
    stackName: 'SpaceFinder'
});