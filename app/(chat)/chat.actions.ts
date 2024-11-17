'use server';

import { bedrockRuntimeClient } from '@/lib/ai/bedrock.client';
import { findModelById } from '@/lib/utils';
import type { ChatrockMessage } from '@/types/chat.types';
import { ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { cookies } from 'next/headers';

export async function saveModelId(model: string) {
  const cookieStore = await cookies();
  cookieStore.set('model-id', model);
}

// TODO: refactor
export async function generateTitleFromUserMessage({
  message,
}: {
  message: ChatrockMessage;
}): Promise<string> {
  const cookieStore = await cookies();
  const modelId = cookieStore.get('model-id')?.value as string;
  const model = findModelById(modelId);

  let title = `Chat at ${new Date().toLocaleString()}`;
  if (model) {
    const command: ConverseCommand = new ConverseCommand({
      modelId: model.apiIdentifier,
      messages: [
        {
          role: 'user',
          content: [
            {
              text: `\n
              // - you will generate a short title based on the first message a user begins a conversation with
              // - ensure it is not more than 80 characters long
              // - the title should be a summary of the user's message
              // - do not use quotes or colons:
              // - do not use the user's name
              //
              // Example:
              // User: I need help with my order
              // Title: Order help request
              // Message: ${message.content?.[0]?.text || 'No message content'}`,
            },
          ],
        },
      ],
    });

    const result = await bedrockRuntimeClient.send(command);
    title = result.output?.message?.content?.[0]?.text || `Chat at ${new Date().toLocaleString()}`;
  }

  return title;
}
