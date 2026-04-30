import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin - Get admin dashboard data
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح - مطلوب صلاحية المسؤول' }, { status: 403 });
    }

    const totalUsers = await db.user.count();
    const totalGames = await db.gameSession.count();
    const totalPurchases = await db.purchase.count();
    const activePackages = await db.package.count({ where: { isActive: true } });
    const totalRevenue = await db.purchase.aggregate({
      where: { status: 'completed' },
      _sum: { amount: true },
    });

    const recentUsers = await db.user.findMany({
      orderBy: { createdAt: 'desc' }, take: 10,
      select: { id: true, name: true, email: true, avatar: true, level: true, coins: true, gamesPlayed: true, role: true, createdAt: true },
    });

    const packages = await db.package.findMany({ orderBy: { order: 'asc' } });
    const adConfigs = await db.adConfig.findMany();
    const settings = await db.appSetting.findMany();

    return NextResponse.json({
      stats: { totalUsers, totalGames, totalPurchases, activePackages, totalRevenue: totalRevenue._sum.amount || 0 },
      recentUsers,
      packages,
      adConfigs,
      settings,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
