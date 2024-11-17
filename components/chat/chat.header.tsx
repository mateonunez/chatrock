'use client';

import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { BetterTooltip } from '@/components/ui/tooltip';
import { SidebarToggle } from '../sidebar/toggle.sidebar';
import { useSidebar } from '../sidebar/sidebar';
import { ModelSelector } from '../model.selector';
import { PlusIcon } from '../ui/icons';
import type { ModelId } from '@/lib/ai/models';

export function ChatHeader({ selectedModelId }: { selectedModelId: ModelId }) {
  const router = useRouter();
  const { open } = useSidebar();
  const { width: windowWidth } = useWindowSize();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
      <SidebarToggle />
      {(!open || windowWidth < 768) && (
        <BetterTooltip content="New Chat">
          <Button
            variant="outline"
            className="order-2 md:order-1 md:px-2 px-2 md:h-fit ml-auto md:ml-0"
            onClick={() => {
              router.push('/');
              router.refresh();
            }}
          >
            <PlusIcon />
            <span className="md:sr-only">New Chat</span>
          </Button>
        </BetterTooltip>
      )}

      <ModelSelector
        selectedModelId={selectedModelId}
        className="order-1 md:order-2"
      />
    </header>
  );
}
