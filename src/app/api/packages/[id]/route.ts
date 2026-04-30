import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminId = request.headers.get('x-user-id');
    const admin = await db.user.findUnique({ where: { id: adminId || '' } });
    if (!admin || admin.role !== 'admin') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    const pkg = await db.package.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.icon !== undefined && { icon: body.icon }),
        ...(body.coins !== undefined && { coins: body.coins }),
        ...(body.gems !== undefined && { gems: body.gems }),
        ...(body.price !== undefined && { price: body.price }),
        ...(body.color !== undefined && { color: body.color }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.order !== undefined && { order: body.order }),
      },
    });
    return NextResponse.json({ package: pkg });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const adminId = request.headers.get('x-user-id');
    const admin = await db.user.findUnique({ where: { id: adminId || '' } });
    if (!admin || admin.role !== 'admin') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

    const { id } = await params;
    await db.package.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
