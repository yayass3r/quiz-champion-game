import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/ads - Get ad configs (public)
export async function GET() {
  try {
    const adConfigs = await db.adConfig.findMany();
    return NextResponse.json({ ads: adConfigs });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
