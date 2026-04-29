import { NextRequest, NextResponse } from 'next/server';

// Appwrite API proxy for game data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    const API_KEY = process.env.APPWRITE_API_KEY;
    const PROJECT_ID = 'quiz-champion';
    const DB_ID = 'quiz-champion-db';
    const BASE_URL = 'https://cloud.appwrite.io/v1';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Appwrite-Project': PROJECT_ID,
      'X-Appwrite-Key': API_KEY || '',
    };

    switch (action) {
      case 'saveGameSession': {
        const res = await fetch(`${BASE_URL}/databases/${DB_ID}/collections/game_sessions/documents`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            documentId: 'unique()',
            data: {
              playerId: data.playerId,
              mode: data.mode,
              score: data.score,
              correctCount: data.correctCount,
              totalCount: data.totalCount,
            },
          }),
        });
        const result = await res.json();
        return NextResponse.json(result);
      }

      case 'updatePlayer': {
        const res = await fetch(`${BASE_URL}/databases/${DB_ID}/collections/players/documents/${data.playerId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            data: {
              level: data.level,
              xp: data.xp,
              coins: data.coins,
              totalScore: data.totalScore,
              gamesPlayed: data.gamesPlayed,
              bestStreak: data.bestStreak,
            },
          }),
        });
        const result = await res.json();
        return NextResponse.json(result);
      }

      case 'getLeaderboard': {
        const res = await fetch(`${BASE_URL}/databases/${DB_ID}/collections/players/documents?queries[]=${encodeURIComponent(JSON.stringify({ method: 'orderDesc', attribute: 'totalScore' }))}&queries[]=${encodeURIComponent(JSON.stringify({ method: 'limit', values: [20] }))}`, {
          headers,
        });
        const result = await res.json();
        return NextResponse.json(result);
      }

      case 'getTeams': {
        const res = await fetch(`${BASE_URL}/databases/${DB_ID}/collections/teams/documents`, {
          headers,
        });
        const result = await res.json();
        return NextResponse.json(result);
      }

      case 'createTeam': {
        const res = await fetch(`${BASE_URL}/databases/${DB_ID}/collections/teams/documents`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            documentId: 'unique()',
            data: {
              name: data.name,
              logo: data.logo,
              members: 1,
              score: 0,
            },
          }),
        });
        const result = await res.json();
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
