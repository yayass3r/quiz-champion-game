import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Admin: Manage ad configs
export async function POST(request: NextRequest) {
  try {
    const adminId = request.headers.get('x-user-id');
    const admin = await db.user.findUnique({ where: { id: adminId || '' } });
    if (!admin || admin.role !== 'admin') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

    const body = await request.json();
    const adConfig = await db.adConfig.create({
      data: {
        adType: body.adType,
        isEnabled: body.isEnabled || false,
        frequency: body.frequency || 3,
        adUnitId: body.adUnitId || '',
        position: body.position || 'bottom',
      },
    });
    return NextResponse.json({ adConfig }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const adminId = request.headers.get('x-user-id');
    const admin = await db.user.findUnique({ where: { id: adminId || '' } });
    if (!admin || admin.role !== 'admin') return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

    const body = await request.json();
    const adConfig = await db.adConfig.update({
      where: { id: body.id },
      data: {
        ...(body.isEnabled !== undefined && { isEnabled: body.isEnabled }),
        ...(body.frequency !== undefined && { frequency: body.frequency }),
        ...(body.adUnitId !== undefined && { adUnitId: body.adUnitId }),
        ...(body.position !== undefined && { position: body.position }),
      },
    });
    return NextResponse.json({ adConfig });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
