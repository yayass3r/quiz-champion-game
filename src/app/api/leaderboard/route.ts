import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const entries = await db.leaderboardEntry.findMany({
      orderBy: { score: 'desc' },
      take: 50,
      include: {
        user: {
          select: { id: true, name: true, avatar: true, level: true },
        },
      },
    });

    const leaderboard = entries.map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId,
      name: entry.user.name,
      avatar: entry.user.avatar,
      level: entry.user.level,
      score: entry.score,
    }));

    return NextResponse.json({ leaderboard });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
