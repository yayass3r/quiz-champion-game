import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/game - Save game session
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const body = await request.json();
    const { mode, category, score, correctCount, totalCount, xpEarned, coinsEarned, duration } = body;

    // Save game session
    const session = await db.gameSession.create({
      data: {
        userId,
        mode: mode || 'classic',
        category: category || '',
        score: score || 0,
        correctCount: correctCount || 0,
        totalCount: totalCount || 0,
        xpEarned: xpEarned || 0,
        coinsEarned: coinsEarned || 0,
        duration: duration || 0,
      },
    });

    // Update user stats
    const user = await db.user.findUnique({ where: { id: userId } });
    if (user) {
      const newXP = user.xp + (xpEarned || 0);
      const xpForLevel = user.level * 200;
      let newLevel = user.level;
      let remainingXP = newXP;

      // Handle level ups
      while (remainingXP >= newLevel * 200) {
        remainingXP -= newLevel * 200;
        newLevel++;
      }

      const isWon = correctCount >= Math.ceil((totalCount || 1) * 0.6);
      const newStreak = isWon ? user.currentStreak + 1 : 0;

      await db.user.update({
        where: { id: userId },
        data: {
          xp: newXP,
          level: newLevel,
          coins: user.coins + (coinsEarned || 0),
          totalScore: user.totalScore + (score || 0),
          gamesPlayed: user.gamesPlayed + 1,
          gamesWon: user.gamesWon + (isWon ? 1 : 0),
          currentStreak: newStreak,
          bestStreak: Math.max(user.bestStreak, newStreak),
        },
      });

      // Update leaderboard
      await db.leaderboardEntry.upsert({
        where: { userId },
        update: { score: user.totalScore + (score || 0) },
        create: { userId, score: score || 0 },
      });
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Game save error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
