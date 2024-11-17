import { models } from '@/lib/ai/models';
import { auth } from '@/app/(auth)/auth.handler';
import { generateUUID, getMostRecentUserMessage } from '@/lib/utils';
import {
  getChatById,
  saveChat,
  type SaveChatParams,
  saveMessages,
} from '@/lib/db/queries';
import {
  ConverseCommand,
  type ConverseCommandOutput,
  type Message,
} from '@aws-sdk/client-bedrock-runtime';
import { bedrockRuntimeClient } from '@/lib/ai/bedrock.client';
import { generateTitleFromUserMessage } from '../../chat.actions';

export async function POST(request: Request) {
  const { id, messages, modelId } = await request.json();

  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const model = models.find((model) => model.id === modelId);
  if (!model) {
    return new Response('Model not found', { status: 404 });
  }

  const userMessage = getMostRecentUserMessage(messages);
  if (!userMessage) {
    return new Response('User message not found', { status: 404 });
  }

  const chat = await getChatById({ chatId: id });
  if (!chat) {
    const title = await generateTitleFromUserMessage({ message: userMessage });
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
      },
    ],
  });

  /*
    AWS Bedrock here
  */

  const message = userMessage as unknown as Message;
  const command: ConverseCommand = new ConverseCommand({
    modelId: model.apiIdentifier,
    messages: messages.map((message: Message) => ({
      role: message.role,
      content: [{ text: message.content }],
    })),
  });

  // const result = {
  //   id: "aitxt-Qe6d7UjQMSIDw7C7BCSrsIhn",
  //   timestamp: "2024-11-16T16:20:27.558Z",
  //   modelId: "amazon.titan-text-express-v1",
  //   messages: [
  //     {
  //       role: "assistant",
  //       content: [
  //         {
  //           type: "text",
  //           text: "Amazon S3, a storage service offered by Amazon Web Services (AWS), is a part of the Amazon Web Services suite. It provides an object store that allows users to upload, store, and retrieve data objects. S3 is a highly scalable, reliable, and cost-effective storage solution that is widely used by individuals, businesses, and organizations for a variety of purposes, such as hosting websites, storing backup data, and distributing content.\n\nTo deploy S3, you can follow these general steps:\n\n1. Sign up for an AWS account: If you don't have an AWS account, you'll need",
  //         },
  //       ],
  //     },
  //   ],
  // };

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
