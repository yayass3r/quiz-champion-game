import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const packages = await db.package.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json({ packages });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

// Admin: Create or update package
export async function POST(request: NextRequest) {
  try {
    const adminId = request.headers.get('x-user-id');
    const admin = await db.user.findUnique({ where: { id: adminId || '' } });
    if (!admin || admin.role !== 'admin') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

    const body = await request.json();
    const pkg = await db.package.create({
      data: {
        name: body.name,
        description: body.description || '',
        icon: body.icon || '📦',
        coins: body.coins || 0,
        gems: body.gems || 0,
        price: body.price || 0,
        currency: body.currency || 'SAR',
        color: body.color || 'from-yellow-500 to-amber-600',
        isActive: body.isActive !== undefined ? body.isActive : true,
        order: body.order || 0,
      },
    });
    return NextResponse.json({ package: pkg }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
