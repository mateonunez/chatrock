'server-only';

import { genSaltSync, hashSync } from 'bcrypt-ts';
import { asc, desc, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { user, chat, type User, type Message, message } from './schema';

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(`${process.env.POSTGRES_URL!}`);
const db = drizzle(client);

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    console.error('Failed to get user from database');
    throw error;
  }
}

export async function createUser(email: string, password: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  try {
    return await db.insert(user).values({ email, password: hash, createdAt: new Date() });
  } catch (error) {
    console.error('Failed to create user in database');
    throw error;
  }
}

export interface SaveChatParams {
  id: string;
  userId: string;
  title: string;
}

export async function saveChat({ id, userId, title }: SaveChatParams) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
    });
  } catch (error) {
    console.error('Failed to save chat in database');
    throw error;
  }
}

export interface DeleteChatByIdParams {
  chatId: string;
}

export async function deleteChatById({ chatId }: DeleteChatByIdParams) {
  try {
    await db.delete(message).where(eq(message.chatId, chatId));

    return await db.delete(chat).where(eq(chat.id, chatId));
  } catch (error) {
    console.error('Failed to delete chat by id from database');
    throw error;
  }
}

export interface GetChatsByUserIdParams {
  userId: string;
}

export async function getChatsByUserId({ userId }: GetChatsByUserIdParams) {
  try {
    return await db.select().from(chat).where(eq(chat.userId, userId)).orderBy(desc(chat.createdAt));
  } catch (error) {
    console.error('Failed to get chats by user from database');
    throw error;
  }
}

export interface GetChatByIdParams {
  chatId: string;
}

export async function getChatById({ chatId }: GetChatByIdParams) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, chatId));
    return selectedChat;
  } catch (error) {
    console.error('Failed to get chat by id from database');
    throw error;
  }
}

export interface SaveChatMessagesParams {
  messages: Array<Message>;
}

export async function saveMessages({ messages }: SaveChatMessagesParams) {
  try {
    return await db.insert(message).values(messages);
  } catch (error) {
    console.error('Failed to save messages in database', error);
    throw error;
  }
}

export interface GetMessagesByChatIdParams {
  chatId: string;
}

export async function getMessagesByChatId({ chatId }: GetMessagesByChatIdParams) {
  try {
    return await db.select().from(message).where(eq(message.chatId, chatId)).orderBy(asc(message.createdAt));
  } catch (error) {
    console.error('Failed to get messages by chat id from database', error);
    throw error;
  }
}
