import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';

const REGION = process.env.AWS_REGION;
export const bedrockRuntimeClient = new BedrockRuntimeClient({
  region: REGION,
});
