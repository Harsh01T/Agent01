import pool from '@/lib/db';
import { Role } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';

interface DBMessage {
  sender: Role;
  text: string;
}

export async function ensureConversation(conversationId: string) {
  await pool.execute(
    'INSERT IGNORE INTO conversations (id) VALUES (?)',
    [conversationId]
  );
}

export async function createConversation(): Promise<string> {
  const newId = uuidv4();
  await pool.execute(
    'INSERT INTO conversations (id) VALUES (?)',
    [newId]
  );
  return newId;
}

export async function getConversationHistory(conversationId: string): Promise<DBMessage[]> {
  const [rows] = await pool.execute(
    'SELECT sender, text FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC',
    [conversationId]
  );
  return rows as DBMessage[];
}

export async function saveMessage(conversationId: string, sender: Role, text: string): Promise<void> {
  const messageId = uuidv4();
  await pool.execute(
    'INSERT INTO messages (id, conversation_id, sender, text) VALUES (?, ?, ?, ?)',
    [messageId, conversationId, sender, text]
  );
}
