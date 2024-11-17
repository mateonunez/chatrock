'server-only';

import { genSaltSync, hashSync } from 'bcrypt-ts';
import { and, asc, desc, eq, gt } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import {
  user,
  chat,
  type User,
  document,
  type Suggestion,
  suggestion,
  type Message,
  message,
  vote,
} from './schema';

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
    return await db.insert(user).values({ email, password: hash });
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
  id: string;
}

export async function deleteChatById({ id }: DeleteChatByIdParams) {
  try {
    await db.delete(vote).where(eq(vote.chatId, id));
    await db.delete(message).where(eq(message.chatId, id));

    return await db.delete(chat).where(eq(chat.id, id));
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
    return await db
      .select()
      .from(chat)
      .where(eq(chat.userId, userId))
      .orderBy(desc(chat.createdAt));
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
    const [selectedChat] = await db
      .select()
      .from(chat)
      .where(eq(chat.id, chatId));
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

export async function getMessagesByChatId({
  chatId,
}: GetMessagesByChatIdParams) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, chatId))
      .orderBy(asc(message.createdAt));
  } catch (error) {
    console.error('Failed to get messages by chat id from database', error);
    throw error;
  }
}

export interface VoteMessageParams {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: VoteMessageParams) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));

    if (existingVote) {
      return await db
        .update(vote)
        .set({ isUpvoted: type === 'up' })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
    }

    return await db.insert(vote).values({
      chatId,
      messageId,
      isUpvoted: type === 'up',
    });
  } catch (error) {
    console.error('Failed to process vote message in database', error);
    throw error;
  }
}

export interface GetVotesByChatIdParams {
  chatId: string;
}

export async function getVotesByChatId({ chatId }: GetVotesByChatIdParams) {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, chatId));
  } catch (error) {
    console.error('Failed to get votes by chat chatId from database', error);
    throw error;
  }
}

export interface SaveDocumentParams {
  id: string;
  title: string;
  content: string;
  userId: string;
}

export async function saveDocument({
  id,
  title,
  content,
  userId,
}: SaveDocumentParams) {
  try {
    return await db.insert(document).values({
      id,
      title,
      content,
      userId,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Failed to save document in database', error);
    throw error;
  }
}

export interface GetDocumentsByIdParams {
  documentId: string;
}

export async function getDocumentsById({ documentId }: GetDocumentsByIdParams) {
  try {
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.id, documentId))
      .orderBy(asc(document.createdAt));

    return documents;
  } catch (error) {
    console.error('Failed to get documents by id from database', error);
    throw error;
  }
}

export async function getDocumentById({ documentId }: GetDocumentsByIdParams) {
  try {
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, documentId))
      .orderBy(desc(document.createdAt));

    return selectedDocument;
  } catch (error) {
    console.error('Failed to get document by id from database', error);
    throw error;
  }
}

export interface DeleteDocumentsByIdAfterTimestampParams {
  id: string;
  timestamp: Date;
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: DeleteDocumentsByIdAfterTimestampParams) {
  try {
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp),
        ),
      );

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)));
  } catch (error) {
    console.error(
      'Failed to delete documents by id after timestamp from database',
      error,
    );
    throw error;
  }
}

export interface SaveSuggestionsParams {
  suggestions: Array<Suggestion>;
}

export async function saveSuggestions({ suggestions }: SaveSuggestionsParams) {
  try {
    return await db.insert(suggestion).values(suggestions);
  } catch (error) {
    console.error('Failed to save suggestions in database', error);
    throw error;
  }
}

export interface GetSuggestionsByDocumentIdParams {
  documentId: string;
}

export async function getSuggestionsByDocumentId({
  documentId,
}: GetSuggestionsByDocumentIdParams) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(and(eq(suggestion.documentId, documentId)));
  } catch (error) {
    console.error(
      'Failed to get suggestions by document id from database',
      error,
    );
    throw error;
  }
}
