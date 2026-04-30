import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        team: true,
        achievements: { include: { achievement: true } },
        gameSessions: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    const totalAchievements = await db.achievement.count();
    const unlockedCount = user.achievements.length;
    const leaderboardEntry = await db.leaderboardEntry.findUnique({ where: { userId: user.id } });
    const rank = leaderboardEntry
      ? (await db.leaderboardEntry.count({ where: { score: { gt: leaderboardEntry.score } } })) + 1
      : 0;

    return NextResponse.json({
      id: user.id, email: user.email, name: user.name, avatar: user.avatar,
      level: user.level, xp: user.xp, coins: user.coins, gems: user.gems,
      totalScore: user.totalScore, gamesPlayed: user.gamesPlayed, gamesWon: user.gamesWon,
      currentStreak: user.currentStreak, bestStreak: user.bestStreak, role: user.role,
      team: user.team, rank,
      achievements: { unlocked: unlockedCount, total: totalAchievements,
        list: user.achievements.map(a => ({ key: a.achievement.key, name: a.achievement.name, icon: a.achievement.icon, unlockedAt: a.unlockedAt })) },
      recentGames: user.gameSessions, dailyCompleted: user.dailyCompleted,
      lastDailyDate: user.lastDailyDate, joinedAt: user.createdAt, lastLogin: user.lastLoginAt,
    });
  } catch (error) {
    console.error('Profile error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const body = await request.json();
    const user = await db.user.update({
      where: { id: userId },
      data: { ...(body.name && { name: body.name }), ...(body.avatar && { avatar: body.avatar }) },
    });

    return NextResponse.json({ id: user.id, name: user.name, avatar: user.avatar });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
