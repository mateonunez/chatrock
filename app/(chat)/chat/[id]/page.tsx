import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { DEFAULT_MODEL_NAME, models } from '@/lib/ai/models';
import { getChatById, getMessagesByChatId } from '@/lib/db/queries';
import { auth } from '@/app/(auth)/auth.handler';
import { Chat as PreviewChat } from '@/components/chat/chat';
import type { ChatrockMessage, ChatrockRole } from '@/types/chat.types';

export default async function SingleChatPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const { id } = params;
  const chat = await getChatById({ chatId: id });

  if (!chat) {
    notFound();
  }

  const session = await auth();

  if (!session || !session.user) {
    return notFound();
  }

  if (session.user.id !== chat.userId) {
    return notFound();
  }

  const messagesFromDb = await getMessagesByChatId({
    chatId: id,
  });
  const convertedMessages: ChatrockMessage[] = messagesFromDb.map((message) => ({
    role: message.role as ChatrockRole,
    content: [{ text: message.content as string }],
  }));

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('model-id')?.value;
  const selectedModelId = models.find((model) => model.id === modelIdFromCookie)?.id || DEFAULT_MODEL_NAME;

  return <PreviewChat id={chat.id} initialMessages={convertedMessages} selectedModelId={selectedModelId} />;
}
