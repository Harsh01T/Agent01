import { NextRequest, NextResponse } from 'next/server';
import { getConversationHistory } from '@/services/dbService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 });
    }

    const history = await getConversationHistory(conversationId);

    return NextResponse.json({ messages: history }, { status: 200 });

  } catch (error) {
    console.error('History Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to load chat history' }, { status: 500 });
  }
}
