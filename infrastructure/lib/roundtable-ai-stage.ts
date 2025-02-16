import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Stage, StageProps } from 'aws-cdk-lib';
import { RoundtableAiStack } from './roundtable-ai-stack';

export class RoundtableAiStage extends Stage {
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    // Instantiate your application stack inside the stage
    new RoundtableAiStack(this, 'RoundtableAiStack');
  }
}