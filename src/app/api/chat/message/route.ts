// src/app/api/chat/message/route.ts
import { NextResponse } from 'next/server';
import { ChatRequestSchema } from '@/lib/validations';
import { createConversation, getConversationHistory, saveMessage } from '@/services/dbService';
import { generateReply } from '@/services/llm';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validationResult = ChatRequestSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map(err => err.message).join(', ');
      return NextResponse.json({ error: `Validation Error: ${errorMessages}` }, { status: 400 });
    }

    const { message, sessionId } = validationResult.data;
    let currentSessionId = sessionId;

    if (!currentSessionId) {
      currentSessionId = await createConversation();
    }

    const conversationHistory = await getConversationHistory(currentSessionId);
    await saveMessage(currentSessionId, 'user', message);

    const aiReply = await generateReply(conversationHistory, message);

    await saveMessage(currentSessionId, 'ai', aiReply);

    return NextResponse.json({
      reply: aiReply,
      sessionId: currentSessionId,
    });

  } catch (error: any) {
    console.error("API ROUTE ERROR:", error);
    
    const status = error.status || 500;
    const errorMessage = error.status === 429 
      ? "We're experiencing high volume. Please wait a moment." 
      : "An unexpected error occurred on the server.";

    return NextResponse.json({ error: errorMessage }, { status });
  }
}
