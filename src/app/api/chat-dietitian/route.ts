import { NextResponse } from 'next/server';
import { chatWithDietitian } from '@/ai/flows/chat-with-dietitian';
import { appendFile } from 'fs/promises';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = String(body?.message || '');
    const profile = body?.profile;
    if (!message.trim()) {
      return NextResponse.json({error: 'Message is required'}, {status: 400});
    }

  const output = await chatWithDietitian({message, profile});
  // output matches ChatOutput schema: { reply, suggestions?, actions?, metadata? }
  return NextResponse.json(output);
  } catch (e: any) {
    // log error to console and a local file for debugging in this dev environment
    console.error('chat-dietitian error', e);
    try {
      const errText = `[${new Date().toISOString()}] ${String(e?.stack || e)}\n`;
      await appendFile('.dev_chat_errors.log', errText, { encoding: 'utf8' });
    } catch (fsErr) {
      console.error('failed to write debug log', fsErr);
    }
    return NextResponse.json({error: 'Internal error'}, {status: 500});
  }
}
