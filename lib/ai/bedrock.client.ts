import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import { fromEnv } from '@aws-sdk/credential-providers';

const REGION = process.env.AWS_REGION;

if (!REGION) {
  throw new Error('Missing required AWS_REGION environment variable');
}

export const bedrockRuntimeClient = new BedrockRuntimeClient({
  region: REGION,
  credentials: fromEnv(),
});
