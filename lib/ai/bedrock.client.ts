import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';

const REGION = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

if (!REGION || !accessKeyId || !secretAccessKey) {
  throw new Error('Missing required AWS environment variables');
}

export const bedrockRuntimeClient = new BedrockRuntimeClient({
  region: REGION,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});
