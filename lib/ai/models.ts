export type ModelId =
  | 'amazon.titan-text-express-v1'
  | 'anthropic.claude-3-5-sonnet-20241022-v2:0'
  | 'anthropic.claude-3-5-haiku-20241022-v1:0'
  | 'meta.llama3-8b-instruct-v1:0'
  | 'mistral.mistral-7b-instruct-v0:2'
  | 'mistral.mixtral-8x7b-instruct-v0:1';

export type Model = {
  id: ModelId;
  label: string;
  apiIdentifier: string;
  description: string;
};

// https://sdk.vercel.ai/providers/ai-sdk-providers/amazon-bedrock#model-capabilities
// https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference.html#conversation-inference-supported-models-features
export const models: Array<Model> = [
  {
    id: 'amazon.titan-text-express-v1',
    label: 'Amazon Titan Text Express v1',
    apiIdentifier: 'amazon.titan-text-express-v1',
    description:
      'An express version of the Titan text model optimized for faster response times in content generation.',
  },
  {
    id: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    label: 'Anthropic Claude 3.5 Sonnet (2024-10-22 v2.0)',
    apiIdentifier: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    description:
      'An advanced conversational AI model optimized for multi-turn dialogues with enhanced reasoning capabilities.',
  },
  {
    id: 'anthropic.claude-3-5-haiku-20241022-v1:0',
    label: 'Anthropic Claude 3.5 Haiku (2024-10-22 v1.0)',
    apiIdentifier: 'anthropic.claude-3-5-haiku-20241022-v1:0',
    description:
      'A streamlined version of Claude 3.5, offering faster responses suitable for concise conversational tasks.',
  },
  {
    id: 'meta.llama3-8b-instruct-v1:0',
    label: 'Meta Llama 3 8B Instruct v1.0',
    apiIdentifier: 'meta.llama3-8b-instruct-v1:0',
    description:
      'An 8-billion parameter model designed for instruction-following tasks, delivering precise and accurate outputs.',
  },
  {
    id: 'mistral.mistral-7b-instruct-v0:2',
    label: 'Mistral 7B Instruct v0.2',
    apiIdentifier: 'mistral.mistral-7b-instruct-v0:2',
    description:
      'A 7-billion parameter model focused on instruction-based tasks, offering efficient and reliable performance.',
  },
  {
    id: 'mistral.mixtral-8x7b-instruct-v0:1',
    label: 'Mistral Mixtral 8x7B Instruct v0.1',
    apiIdentifier: 'mistral.mixtral-8x7b-instruct-v0:1',
    description: 'An ensemble model combining multiple 7B models to enhance instruction-following capabilities.',
  },
] as const;

export const DEFAULT_MODEL_NAME: ModelId = 'amazon.titan-text-express-v1';
