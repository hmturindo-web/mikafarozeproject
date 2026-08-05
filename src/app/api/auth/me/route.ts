import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/server/services/auth';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });

    return NextResponse.json({
      success: true,
      user: { id: payload.userId, email: payload.email, role: payload.role },
    });
  } catch (err) {
    console.error('[GET /api/auth/me]', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
