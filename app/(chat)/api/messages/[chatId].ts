import { getMessagesByChatId } from '@/lib/db/queries';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { chatId } = req.query;

  if (req.method === 'GET') {
    try {
      const messages = await getMessagesByChatId({ chatId: chatId as string });
      res.status(200).json(messages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
