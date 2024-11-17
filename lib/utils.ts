import type { ChatrockMessage } from '@/types/chat.types';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { models } from './ai/models';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function fetcher(url: string): Promise<any> {
  const res = await fetch(url);

  if (!res.ok) {
    console.error(res.json(), res.statusText);
    throw new Error('An error occurred while fetching the data');
  }

  return res.json();
}

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

export function getMostRecentUserMessage(messages: Array<ChatrockMessage>) {
  const userMessages = messages.filter((message) => message.role === 'user');
  return userMessages.at(-1);
}

export function findModelById(id: string) {
  return models.find((model) => model.id === id);
}
