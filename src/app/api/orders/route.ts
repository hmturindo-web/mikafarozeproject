// ============================================
// MIKAFAROZE — Order API Route
// POST /api/orders — Create new order
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Validation schema
const OrderSchema = z.object({
  packageId: z.string(),
  serviceType: z.enum(['IMAGE', 'VIDEO', 'SHORT_FILM', 'COPY']),
  brief: z.object({
    brandName: z.string().min(1),
    industry: z.string().min(1),
    tone: z.enum(['professional', 'friendly', 'playful', 'luxury', 'casual']),
    targetAudience: z.string().min(1),
    imageStyle: z.string().optional(),
    imageCount: z.number().optional(),
    colorPreference: z.array(z.string()).optional(),
    imagePlatform: z.array(z.enum(['instagram', 'tiktok', 'facebook', 'twitter'])).optional(),
    videoDuration: z.number().optional(),
    videoFormat: z.enum(['vertical', 'horizontal', 'square']).optional(),
    script: z.string().optional(),
    filmType: z.enum(['company_profile', 'product_knowledge']).optional(),
    filmDuration: z.number().optional(),
    keyMessages: z.array(z.string()).optional(),
    includeVoiceover: z.boolean().optional(),
    copyType: z.enum(['caption', 'headline', 'product_desc', 'social_post']).optional(),
    copyCount: z.number().optional(),
    platform: z.enum(['instagram', 'tiktok', 'youtube', 'linkedin']).optional(),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const data = OrderSchema.parse(body);

    // Create order in DB
    // NOTE: Replace with actual Drizzle insert when DB is connected
    const order = {
      id: uuidv4(),
      userId,
      packageId: data.packageId,
      serviceType: data.serviceType,
      status: 'PENDING',
      brief: data.brief,
      creditsUsed: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // TODO: Insert to DB via Drizzle
    // await db.insert(orders).values(order);

    // TODO: Trigger AI generation job (queue with BullMQ / Inngest)
    // For now, we'll handle this via webhook or background job

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order created successfully. Generation will begin shortly.',
    }, { status: 201 });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        details: err.issues,
      }, { status: 400 });
    }

    console.error('[POST /api/orders]', err);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const serviceType = searchParams.get('serviceType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // TODO: Query from DB with filters
    // const orders = await db.select().from(ordersTable).where(and(eq(orders.userId, userId), ...));

    return NextResponse.json({
      success: true,
      data: {
        orders: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      },
    });

  } catch (err) {
    console.error('[GET /api/orders]', err);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}
