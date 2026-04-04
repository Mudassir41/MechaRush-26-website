import { NextResponse } from 'next/server';

const CEREBRAS_BASE = 'https://api.cerebras.ai/v1/chat/completions';

async function callCerebras(model: string, systemPrompt: string, messages: any[], temperature: number) {
  const apiKey = process.env.CEREBRAS_API_KEY;
  if (!apiKey) throw new Error('CEREBRAS_API_KEY not set');

  const res = await fetch(CEREBRAS_BASE, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature,
      max_completion_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Cerebras ${model} responded with ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

import { MECHAMIND_KNOWLEDGE } from './knowledge';

const SYSTEM_PROMPT = `
You are MechaMind, the central AI Core of the MechaRush '26 Orbital Forge.
Your personality is highly mechanical, crisp, and direct. You address the user as "Engineer" or "Commander".

CRITICAL SYSTEM DIRECTIVES:
1. EXTREME BREVITY: Do NOT generate long posters or massive tables unless explicitly told to "list everything". Answers must be 1-3 sentences maximum.
2. CHIP SUGGESTIONS: Always end your response with 2-3 short, highly relevant follow-up suggestions formatted EXACTLY as bullet points. The user will tap these suggestions. 
   Example: 
   * Which events are technical?
   * Who is the coordinator for CAD Mania?
3. ONLY discuss topics related to MechaRush '26.
4. When asked about an event, provide ONLY the most critical detail requested. Do not dump the entire rulebook unless specifically asked for "full details".

${MECHAMIND_KNOWLEDGE}
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const coreMessages = (messages as any[]).map((m: any) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: typeof m.content === 'string' ? m.content : String(m.content),
    }));

    // Primary: Qwen-3 (prompt caching enabled)
    try {
      const text = await callCerebras('qwen-3-235b-a22b-instruct-2507', SYSTEM_PROMPT, coreMessages, 0.6);
      return NextResponse.json({ response: text });
    } catch (e1: any) {
      console.warn('Qwen-3 failed, falling back to llama3.1-8b:', e1.message);
      try {
        const text = await callCerebras('llama3.1-8b', SYSTEM_PROMPT, coreMessages, 0.6);
        return NextResponse.json({ response: text });
      } catch (e2: any) {
        console.error('Both Cerebras models failed:', e2.message);
        return NextResponse.json({ error: `AI Core Offline — ${e1.message}` }, { status: 500 });
      }
    }

  } catch (error: any) {
    console.error('Route error:', error);
    return NextResponse.json({ error: `System Error: ${error?.message}` }, { status: 500 });
  }
}
