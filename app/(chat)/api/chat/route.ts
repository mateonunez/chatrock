import { auth } from '@/app/(auth)/auth.handler';
import { findModelById, generateUUID, getMostRecentUserMessage } from '@/lib/utils';
import { getChatById, saveChat, type SaveChatParams, saveMessages } from '@/lib/db/queries';
import { ConverseCommand, type ConverseCommandOutput, type Message } from '@aws-sdk/client-bedrock-runtime';
import { bedrockRuntimeClient } from '@/lib/ai/bedrock.client';
import type { ChatrockMessage } from '@/types/chat.types';

export async function POST(request: Request) {
  const { id, messages, modelId } = await request.json();

  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const model = findModelById(modelId);
  if (!model) {
    return new Response('Model not found', { status: 404 });
  }

  const userMessage = getMostRecentUserMessage(messages);
  if (!userMessage) {
    return new Response('User message not found', { status: 404 });
  }

  const chat = await getChatById({ chatId: id });
  if (!chat) {
    // const title = await generateTitleFromUserMessage({ message: userMessage });
    const title = `Chat at ${new Date().toLocaleString()}`;
    const payload: SaveChatParams = {
      id,
      title,
      userId: session.user.id,
    };
    await saveChat(payload);
  }

  await saveMessages({
    messages: [
      {
        ...userMessage,
        id: generateUUID(),
        createdAt: new Date(),
        chatId: id,
        role: userMessage.role || 'unknown',
      },
    ],
  });

  const message = userMessage as unknown as Message;
  const command: ConverseCommand = new ConverseCommand({
    modelId: model.apiIdentifier,
    messages: [
      {
        role: message.role,
        content: [{ text: message.content }],
      } as ChatrockMessage,
    ],
  });

  let result: ConverseCommandOutput;
  try {
    result = await bedrockRuntimeClient.send(command);
    console.log(result);

    if (!result.output || !result.output.message) {
      throw new Error('No messages in response');
    }

    const messageId = generateUUID();
    const messageToSave = {
      id: messageId,
      chatId: id,
      role: result.output.message.role || 'unknown',
      content: result.output.message.content?.[0]?.text || 'No content',
      createdAt: new Date(),
    };

    await saveMessages({ messages: [messageToSave] });
  } catch (error) {
    console.error('Failed to save messages in database');
    throw error;
  }

  return Response.json({
    message: result.output.message,
  });
}
