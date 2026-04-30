import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const adminId = request.headers.get('x-user-id');
    const admin = await db.user.findUnique({ where: { id: adminId || '' } });
    if (!admin || admin.role !== 'admin') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

    const users = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, avatar: true, level: true, coins: true, gems: true, gamesPlayed: true, gamesWon: true, totalScore: true, role: true, provider: true, createdAt: true, lastLoginAt: true },
    });
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const adminId = request.headers.get('x-user-id');
    const admin = await db.user.findUnique({ where: { id: adminId || '' } });
    if (!admin || admin.role !== 'admin') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

    const { targetUserId, role, coins, gems } = await request.json();
    const updateData: any = {};
    if (role) updateData.role = role;
    if (coins !== undefined) updateData.coins = coins;
    if (gems !== undefined) updateData.gems = gems;

    const updated = await db.user.update({ where: { id: targetUserId }, data: updateData });
    return NextResponse.json({ user: updated });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminId = request.headers.get('x-user-id');
    const admin = await db.user.findUnique({ where: { id: adminId || '' } });
    if (!admin || admin.role !== 'admin') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

    const { targetUserId } = await request.json();
    await db.user.delete({ where: { id: targetUserId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
