'use client';

import { useState } from 'react';
import { useSWRConfig } from 'swr';
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom';
import { Overview } from '../overview';
import type { ModelId } from '@/lib/ai/models';
import { ChatHeader } from './chat.header';
import { ThinkingMessage } from '../message/thinking.message';
import { MultimodalInput } from '../multimodal.input';
import { PreviewMessage } from '../message/message';
import { generateUUID } from '@/lib/utils';
import type { Message } from '@/lib/db/schema';
import type { ChatrockMessage, ChatrockRole } from '@/types/chat.types';

export interface ChatProps {
  id: string;
  initialMessages: ChatrockMessage[];
  selectedModelId: ModelId;
}

export function Chat({ id, initialMessages, selectedModelId }: ChatProps) {
  const { mutate } = useSWRConfig();

  const [messages, setMessages] = useState<ChatrockMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();

  const handleSubmit = async (event?: React.FormEvent, options: Record<string, any> = {}) => {
    event?.preventDefault();
    setIsLoading(true);

    let content = input;
    if (!input && options.message) {
      setInput(options.message.content[0].text);
      content = options.message.content[0].text;
    }

    const message: ChatrockMessage = {
      role: 'user' as ChatrockRole,
      content: [{ text: content }],
    };

    console.log('Message from the user:', message);

    setMessages((messages) => [...messages, message]);
    setInput('');

    const messagePayload: Message = {
      id: generateUUID(),
      chatId: id,
      content: content,
      role: 'user',
      createdAt: new Date(),
    };

    console.log('messagePayload:', messagePayload);

    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        id,
        messages: [...messages, messagePayload],
        modelId: selectedModelId,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data) {
      const messageToAppend: ChatrockMessage = {
        role: 'assistant',
        content: [{ text: data.message.content[0].text }],
      };
      console.log('Message from the assistant to append:', messageToAppend);
      append(messageToAppend);
    }

    mutate('/api/history');
    stop();
  };

  const stop = () => {
    setIsLoading(false);
  };

  const append = (message: ChatrockMessage) => {
    setMessages((messages) => [...messages, message]);
  };

  return (
    <>
      <div className="flex flex-col min-w-0 bg-background h-dvh">
        <ChatHeader selectedModelId={selectedModelId} />

        <div ref={messagesContainerRef} className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4">
          {messages.length === 0 && <Overview />}

          {messages.map((message, index) => (
            <PreviewMessage
              key={`message-${index}-${message.role}`}
              chatId={id}
              message={message}
              isLoading={isLoading && messages.length - 1 === index}
            />
          ))}

          {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && <ThinkingMessage />}

          <div ref={messagesEndRef} className="shrink-0 min-w-[24px] min-h-[24px]" />
        </div>

        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          <MultimodalInput
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
            chatId={id}
            messages={messages}
            setMessages={setMessages}
          />
        </form>
      </div>
    </>
  );
}
