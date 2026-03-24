import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const LEADERBOARD_KEY = 'arcade_leaderboard_v1';

export async function GET() {
  try {
    // If KV is not configured, return mock data to prevent crashes in local dev
    if (!process.env.KV_REST_API_URL) {
      return NextResponse.json([
        { id: '1', name: 'Axiom', score: 24500, rank: 1, date: new Date().toISOString() },
        { id: '2', name: 'Cipher', score: 18200, rank: 2, date: new Date().toISOString() },
        { id: '3', name: 'Null', score: 14450, rank: 3, date: new Date().toISOString() },
      ]);
    }

    // Fetch top 100 scores
    // @vercel/kv zrange with rev: true and withScores: true typically returns Array<{score, member}> 
    // or flat array [member, score, member, score]. We handle both.
    const rawScores = await kv.zrange(LEADERBOARD_KEY, 0, 99, { rev: true, withScores: true });
    
    let formattedScores: any[] = [];
    
    if (Array.isArray(rawScores)) {
      if (rawScores.length > 0 && typeof rawScores[0] === 'object' && rawScores[0] !== null) {
        // Format: [{ member: string, score: number }]
        formattedScores = rawScores.map((item: any, i) => ({
          id: `${i}`,
          name: typeof item.member === 'string' ? item.member : JSON.stringify(item.member),
          score: Number(item.score) || 0,
          rank: i + 1,
          date: new Date().toISOString() // We don't store date in sorted set by default, just returning now
        }));
      } else {
        // Format: [member, score, member, score]
        for (let i = 0; i < rawScores.length; i += 2) {
          formattedScores.push({
            id: `${i/2}`,
            name: String(rawScores[i]),
            score: Number(rawScores[i+1]) || 0,
            rank: (i / 2) + 1,
            date: new Date().toISOString()
          });
        }
      }
    }

    return NextResponse.json(formattedScores);
  } catch (error) {
    console.error("Leaderboard GET Error:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, score } = await req.json();

    if (!name || typeof score !== 'number') {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    if (!process.env.KV_REST_API_URL) {
      return NextResponse.json({ success: true, mock: true });
    }

    // Add to sorted set
    // In actual production, appending a random ID or timestamp to the member string 
    // ensures players with the same name don't overwrite each other if they play multiple times.
    // However, classical leaderboards updating highest score per name is also fine. Let's do highest per name.
    
    const existingScore = await kv.zscore(LEADERBOARD_KEY, name);
    
    if (existingScore === null || score > existingScore) {
      await kv.zadd(LEADERBOARD_KEY, { score, member: name });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Leaderboard POST Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
