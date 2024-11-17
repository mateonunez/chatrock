import { toast } from 'sonner';
import { useCopyToClipboard } from 'usehooks-ts';
import { CopyIcon } from '../ui/icons';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import type { ChatrockMessage } from '@/types/chat.types';

export function MessageActions({
  message,
  isLoading,
}: {
  chatId: string;
  message: ChatrockMessage;
  isLoading: boolean;
}) {
  const [_, copyToClipboard] = useCopyToClipboard();

  if (isLoading) return null;
  if (message.role === 'user') return null;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-row gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="py-1 px-2 h-fit text-muted-foreground"
              variant="outline"
              onClick={async () => {
                if (message.content?.[0]?.text) {
                  await copyToClipboard(message.content[0].text);
                  toast.success('Copied to clipboard!');
                } else {
                  toast.error('Failed to copy to clipboard.');
                }
              }}
            >
              <CopyIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
