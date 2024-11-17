import type {
  Message,
  ConversationRole as Role,
  ConverseCommand,
  ConverseCommandInput,
  ConverseCommandOutput,
  ConverseStreamCommand,
  ConverseStreamCommandInput,
  ConverseStreamCommandOutput,
} from '@aws-sdk/client-bedrock-runtime';

export type JSONValue =
  | null
  | string
  | number
  | boolean
  | {
      [value: string]: JSONValue;
    }
  | Array<JSONValue>;

export type ChatrockMessage = Message;
export type ChatrockRole = Role;
export type ChatrocCommand = ConverseCommand;
export type ChatrocCommandInput = ConverseCommandInput;
export type ChatrocCommandOutput = ConverseCommandOutput;
export type ChatrocCommandStream = ConverseStreamCommand;
export type ChatrocCommandStreamInput = ConverseStreamCommandInput;
export type ChatrocCommandStreamOutput = ConverseStreamCommandOutput;
