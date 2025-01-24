#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { VeylaStack } from '../lib/veyla-stack';

const app = new cdk.App();

new VeylaStack(app, 'VeylaStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-west-2'
  }
});
