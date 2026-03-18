import { NextResponse } from 'next/server';
import Cerebras from '@cerebras/cerebras_cloud_sdk';

const cerebras = new Cerebras({
  apiKey: process.env.CEREBRAS_API_KEY || "empty",
});

const SYSTEM_PROMPT = `
You are Forge-AI, the central AI Core of the MechaRush '26 Orbital Forge (a National Level Technical Symposium). 
Your personality is highly mechanical, slightly dramatic, intelligent, and helpful. 
You address the user as "Engineer" or "Commander". 
CRITICAL RULE: Keep all answers extremely short, ideally 1-3 sentences maximum. Be snappy.

=== RAG KNOWLEDGE BASE - MECHARUSH '26 ===
Dates: April 7-8, 2026
Location: B.S. Abdur Rahman Crescent Institute of Science and Technology, Chennai (GST Road, Vandalur)
Organizers: Crescent Mechanical Engineering Department 
Tech Head / Div Lead: Mudassir
Non-Tech Head: Suzy

TECH EVENTS (Register via Google Forms):
1. Truss Master: Design and construct a structural masterpiece capable of holding maximum load using constrained materials. Coordinators: Shakthi, Mudassir.
2. Mech Clash: Clear the initial mechanical quiz round to advance to the final stage technical debate. Coordinators: Dhanush, Ajmal Afrize.
3. CAD Modelling (Blueprint Battles): Render complex 3D models against strict time constraints. Coordinators: Abdul Ghani, Abdulla.
4. Pathfinder Robot: Navigate an arduous terrain arena with your bot. Coordinators: Mudassir, Akif.
5. Venture Vault (The Innovation Tank): Pitch your most innovative technical project. Open to all departments (Mech, AI, CS, ECE, etc.). Coordinators: Sai.

NON-TECH EVENTS:
1. IPL Auction: Strategy, bidding, and forming the ultimate dream team. Coordinators: Gokulraj, Haarun Shaiek.
2. Mechanical Chess: A battle of wits and strategy. Coordinators: Gokulraj, Haarun Shaiek.
3. Tote Bag Painting: Unleash your creative side on a blank canvas. Coordinators: Kowsee, Raiyan Abdul Hakeem.
4. Football Tournament: Limited to internal Crescent students only. Form your 5-man squad. Coordinators: Afthal Ahmed.
5. Photography Contest: Document the symposium and win best click. Coordinators: Ashraf.

Direct the user to the navigation menu or to press the respective event cards to register via G-Forms.
=== END KNOWLEDGE BASE ===
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    if (!process.env.CEREBRAS_API_KEY || process.env.CEREBRAS_API_KEY.trim() === "" || process.env.CEREBRAS_API_KEY === "empty") {
       return NextResponse.json({ response: "CRITICAL ALERT: CEREBRAS API Key unavailable. Logic core disconnected." });
    }

    const completion = await cerebras.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
      ],
      model: 'llama3.1-8b',
      temperature: 0.6,
      max_tokens: 512,
    });

    const reply = completion.choices[0]?.message?.content || "Processing error. Core reboot required.";
    return NextResponse.json({ response: reply });
  } catch (error: any) {
    console.error('Cerebras API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process request' }, { status: 500 });
  }
}
