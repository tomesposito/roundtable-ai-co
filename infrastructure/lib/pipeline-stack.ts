import * as cdk from 'aws-cdk-lib';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { RoundtableAiStage } from './roundtable-ai-stage';

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Define the source from your GitHub repository
    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'RoundtableAiPipeline',
      synth: new ShellStep('Synth', {
        // Replace 'your-org/your-repo' with your GitHub organization and repository name.
        input: CodePipelineSource.gitHub('your-org/your-repo', 'main', {
          authentication: cdk.SecretValue.secretsManager('github-token'),
        }),
        commands: [
          'npm ci',
          'npm run build',
          'npx cdk synth'
        ],
      }),
    });

    // Add the application stage to the pipeline with a pre-step for end-to-end testing
    pipeline.addStage(new RoundtableAiStage(this, 'RoundtableAiAppStage'), {
      pre: [
        new ShellStep('RunEndToEndTests', {
          commands: [
            // This command should run your E2E tests (e.g., Cypress tests)
            'npm run test:e2e'
          ],
        }),
      ],
    });
  }
}