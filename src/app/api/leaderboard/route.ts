import { createClient } from 'redis';
import { NextResponse } from 'next/server';

const LEADERBOARD_KEY = 'arcade_leaderboard_v1';

// Setup Redis Client connecting to REDIS_URL
const getClient = async () => {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  const client = createClient({ url });
  client.on('error', (err) => console.error('Redis Client Error', err));
  await client.connect();
  return client;
};

export async function GET() {
  let client;
  try {
    // If Redis is not configured, return an empty array safely without mock data
    if (!process.env.REDIS_URL) {
      return NextResponse.json([]);
    }

    client = await getClient();
    if (!client) {
      return NextResponse.json([]);
    }

    // Fetch top 100 scores
    // Node Redis v4 zRangeWithScores returns array of { value: string, score: number }
    const rawScores = await client.zRangeWithScores(LEADERBOARD_KEY, 0, 99, { REV: true });
    
    let formattedScores: any[] = [];
    
    if (rawScores && Array.isArray(rawScores)) {
      formattedScores = rawScores.map((item, i) => ({
        id: `${i}`,
        name: typeof item.value === 'string' ? item.value : JSON.stringify(item.value),
        score: Number(item.score) || 0,
        rank: i + 1,
        date: new Date().toISOString()
      }));
    }

    return NextResponse.json(formattedScores);
  } catch (error) {
    console.error("Leaderboard GET Error:", error);
    return NextResponse.json([], { status: 500 });
  } finally {
    if (client) {
      await client.disconnect();
    }
  }
}

export async function POST(req: Request) {
  let client;
  try {
    const { name, score } = await req.json();

    if (!name || typeof score !== 'number') {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    if (!process.env.REDIS_URL) {
      return NextResponse.json({ error: 'KV Database not connected' }, { status: 500 });
    }

    client = await getClient();
    if (!client) {
      return NextResponse.json({ error: 'Failed to connect to Redis' }, { status: 500 });
    }

    const existingScore = await client.zScore(LEADERBOARD_KEY, name);
    
    if (existingScore === null || score > existingScore) {
      await client.zAdd(LEADERBOARD_KEY, [{ score, value: name }]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Leaderboard POST Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    if (client) {
      await client.disconnect();
    }
  }
}
