import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { Document, Message } from '@/lib/db/schema';
import type {
  CoreToolMessage,
  PureMessage as BasePureMessage,
  ToolInvocation,
  Role,
} from '@/components/chat/chat';

interface PureMessage extends BasePureMessage {
  chatId: string;
  createdAt: Date;
}
import type { JSONValue } from '@/components/chat/chat';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ApplicationError extends Error {
  info: string;
  status: number;
}

export const fetcher = async (url: string) => {
  const res = await fetch(url);

  if (!res.ok) {
    const error = new Error(
      'An error occurred while fetching the data.',
    ) as ApplicationError;

    error.info = await res.json();
    error.status = res.status;

    throw error;
  }

  return res.json();
};

export function getLocalStorage(key: string) {
  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem(key) || '[]');
  }
  return [];
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function addToolMessageToChat({
  toolMessage,
  messages,
}: {
  toolMessage: CoreToolMessage;
  messages: Array<PureMessage>;
}): Array<PureMessage> {
  return messages.map((message) => {
    if (message.toolInvocations) {
      return {
        ...message,
        toolInvocations: message.toolInvocations.map((toolInvocation) => {
          const toolResult =
            toolInvocation &&
            toolMessage.content.find(
              (tool) => tool.toolCallId === toolInvocation.toolCallId,
            );

          if (toolResult) {
            return {
              ...toolInvocation,
              state: 'result',
              result: toolResult.result,
            };
          }

          return toolInvocation;
        }),
      };
    }

    return message;
  });
}

export function getMostRecentUserMessage(messages: Array<PureMessage>) {
  const userMessages = messages.filter((message) => message.role === 'user');
  return userMessages.at(-1);
}

export function getDocumentTimestampByIndex(
  documents: Array<Document>,
  index: number,
) {
  if (!documents) return new Date();
  if (index > documents.length) return new Date();

  return documents[index].createdAt;
}

type MessageWithAnnotations = Omit<PureMessage, 'chatId' | 'createdAt'> & {
  annotations?: JSONValue[];
};

export function getMessageIdFromAnnotations(message: MessageWithAnnotations) {
  if (!message.annotations) return message.id;

  const [annotation] = message.annotations as JSONValue[];
  if (!annotation) return message.id;

  return (annotation as { messageIdFromServer: string }).messageIdFromServer;
}

export function convertToUIMessages(messages: Array<Message>): Array<Message> {
  return messages.reduce((chatMessages: Array<PureMessage>, message) => {
    if (message.role === 'tool') {
      return addToolMessageToChat({
        toolMessage: message as CoreToolMessage,
        messages: chatMessages,
      });
    }

    let textContent = '';
    const toolInvocations: Array<ToolInvocation> = [];

    if (typeof message.content === 'string') {
      textContent = message.content;
    } else if (Array.isArray(message.content)) {
      for (const content of message.content) {
        if (content.type === 'text') {
          textContent += content.text;
        } else if (content.type === 'tool-call') {
          toolInvocations.push({
            state: 'call',
            toolCallId: content.toolCallId,
            toolName: content.toolName,
            args: content.args,
          });
        }
      }
    }

    chatMessages.push({
      id: message.id,
      role: message.role as Role,
      content: String(textContent) ?? '',
      toolInvocations,
      chatId: '',
      createdAt: new Date(),
    });

    return chatMessages;
  }, []);
}
