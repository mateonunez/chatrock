'use client';

import { useState } from 'react';
import { useSWRConfig } from 'swr';
import { useWindowSize } from 'usehooks-ts';
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom';
import { Overview } from '../overview';
import type { ModelId } from '@/lib/ai/models';
import { ChatHeader } from './chat.header';
import { ThinkingMessage } from '../message/thinking.message';
import { MultimodalInput } from '../multimodal.input';
import { PreviewMessage } from '../message/message';
import { generateUUID } from '@/lib/utils';

export type JSONValue =
  | null
  | string
  | number
  | boolean
  | {
      [value: string]: JSONValue;
    }
  | Array<JSONValue>;

export interface PureMessage {
  id: string;
  createdAt?: Date;
  content: string;
  role: 'system' | 'user' | 'assistant';
  data?: JSONValue;
  annotations?: Array<JSONValue>;
  toolInvocations?: Array<ToolInvocation>;
}

export type CoreToolMessage = {
  role: 'tool';
  content: Array<ToolResult<string, any, any>>;
};

export type ToolInvocation =
  | ({
      state: 'partial-call';
    } & ToolCall<string, any>)
  | ({
      state: 'call';
    } & ToolCall<string, any>)
  | ({
      state: 'result';
    } & ToolResult<string, any, any>);

export type ToolCall<T extends string, A> = {
  toolCallId: string;
  toolName: T;
  args: A;
};

export type ToolResult<T extends string, A, R> = {
  toolCallId: string;
  toolName: T;
  args: A;
  result: R;
  isError?: boolean;
};

export interface ChatProps {
  id: string;
  initialMessages: PureMessage[];
  selectedModelId: ModelId;
}

export function Chat({ id, initialMessages, selectedModelId }: ChatProps) {
  const { mutate } = useSWRConfig();
  const { width: windowWidth = 1920, height: windowHeight = 1080 } =
    useWindowSize();

  const [messages, setMessages] = useState<PureMessage[]>(initialMessages);
  const [input, setInput] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  // const [attachments, setAttachments] = useState<
  //   Array<{ url: string; name: string; contentType: string }>
  // >([]);

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  // TODO: votes
  // TODO: attachments

  const handleSubmit = async (
    event?: React.FormEvent,
    options: Record<string, any> = {},
  ) => {
    event?.preventDefault();
    setIsLoading(true);

    let content = input;
    if (!input && options.message) {
      setInput(options.message.content);
      content = options.message.content;
    }

    const message: PureMessage = {
      id: generateUUID(),
      createdAt: new Date(),
      role: 'user',
      content,
    };

    setMessages((messages) => [...messages, message]);
    setInput('');

    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        id,
        messages: [...messages, message],
        modelId: selectedModelId,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log(data);

    if (data) {
      append({
        id: generateUUID(),
        content: data.message.content[0].text,
        role: 'assistant',
      });
    }

    mutate('/api/history');
    stop();
  };

  const stop = () => {
    setIsLoading(false);
  };

  const append = (message: PureMessage) => {
    setMessages((messages) => [...messages, message]);
  };

  return (
    <>
      <div className="flex flex-col min-w-0 bg-background h-dvh">
        <ChatHeader selectedModelId={selectedModelId} />

        {/* Render messages */}
        <div
          ref={messagesContainerRef}
          className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4"
        >
          {messages.length === 0 && <Overview />}

          {messages.map((message, index) => (
            <PreviewMessage
              key={`message-${message.id}-${index}`}
              chatId={id}
              message={message}
              // block={block}
              // setBlock={setBlock}
              isLoading={isLoading && messages.length - 1 === index}
            />
          ))}

          {isLoading &&
            messages.length > 0 &&
            messages[messages.length - 1].role === 'user' && (
              <ThinkingMessage />
            )}

          <div
            ref={messagesEndRef}
            className="shrink-0 min-w-[24px] min-h-[24px]"
          />
        </div>

        {/* Form */}
        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          <MultimodalInput
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
            // attachments={attachments}
            // setAttachments={setAttachments}
            chatId={id}
            messages={messages}
            setMessages={setMessages}
          />
        </form>
      </div>
    </>
  );
}
