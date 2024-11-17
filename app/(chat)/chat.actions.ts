'use server';

import type { PureMessage } from '@/components/chat/chat';
import { bedrockRuntimeClient } from '@/lib/ai/bedrock.client';
import { models } from '@/lib/ai/models';
import { ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { cookies } from 'next/headers';

export async function saveModelId(model: string) {
  const cookieStore = await cookies();
  cookieStore.set('model-id', model);
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: PureMessage;
}): Promise<string> {
  const cookieStore = await cookies();
  const modelId = cookieStore.get('model-id')?.value;
  const model = models.find((model) => model.id === modelId);

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
              // - do not use quotes or colons: ${JSON.stringify(message)}`,
            },
          ],
        },
      ],
    });

    const result = await bedrockRuntimeClient.send(command);
    title =
      result.output?.message?.content?.[0]?.text ||
      `Chat at ${new Date().toLocaleString()}`;
  }

  return title;
}
