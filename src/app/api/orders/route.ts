// ============================================
// MIKAFAROZE — Order API Route
// POST /api/orders — Create order + trigger AI generation
// GET  /api/orders — List user's orders
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { verifyJWT } from '@/server/services/auth';

// AI Services
import { generateImage as kieGenerateImage } from '@/server/services/kie-ai';
import { generateCopy as kieGenerateCopy } from '@/server/services/kie-ai';
import { generateVideo as falGenerateVideo } from '@/server/services/fal-ai';
import { generateShortFilm as falGenerateShortFilm } from '@/server/services/fal-ai';

// ── Validation schema ─────────────────────────────────────────────────────────
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

// ── AI Generation Router ─────────────────────────────────────────────────────
async function runAIGeneration(serviceType: string, brief: Record<string, unknown>) {
  switch (serviceType) {
    case 'IMAGE': {
      const result = await kieGenerateImage({
        brandName:       brief.brandName as string,
        industry:        brief.industry as string,
        style:           (brief.imageStyle as string) || 'modern',
        colorPreference: brief.colorPreference as string[] | undefined,
        platform:        (brief.imagePlatform as string[] | undefined)?.join(', '),
      });
      return {
        outputUrl: result.imageUrl,
        jobId: result.jobId,
        creditsUsed: result.creditsUsed,
        outputType: 'image',
      };
    }

    case 'VIDEO': {
      const result = await falGenerateVideo({
        brandName: brief.brandName as string,
        industry:  brief.industry as string,
        duration:  (brief.videoDuration as number) || 30,
        format:    (brief.videoFormat as 'vertical' | 'horizontal' | 'square') || 'vertical',
        script:    brief.script as string | undefined,
      });
      return {
        outputUrl: result.videoUrl,
        jobId: result.jobId,
        creditsUsed: 0, // Fal.ai billed separately
        outputType: 'video',
      };
    }

    case 'SHORT_FILM': {
      const result = await falGenerateShortFilm({
        brandName: brief.brandName as string,
        industry:  brief.industry as string,
        filmType:  (brief.filmType as 'company_profile' | 'product_knowledge') || 'company_profile',
        duration:  (brief.filmDuration as number) || 120,
        keyMessages: brief.keyMessages as string[] | undefined,
        includeVoiceover: brief.includeVoiceover as boolean | undefined,
      });
      return {
        outputUrl: result.videoUrl,
        jobId: result.jobId,
        creditsUsed: 0,
        outputType: 'video',
      };
    }

    case 'COPY': {
      const result = await kieGenerateCopy({
        brandName:     brief.brandName as string,
        industry:      brief.industry as string,
        productService: brief.productService as string | undefined,
        targetAudience: brief.targetAudience as string,
        tone:          (brief.tone as 'professional' | 'friendly' | 'playful' | 'luxury' | 'casual'),
        copyType:      (brief.copyType as 'caption' | 'headline' | 'product_desc' | 'social_post') || 'caption',
        platform:      (brief.platform as 'instagram' | 'tiktok' | 'youtube' | 'linkedin') || 'instagram',
        count:         (brief.copyCount as number) || 3,
      });
      return {
        outputUrl: null,
        jobId: result.jobId,
        creditsUsed: result.creditsUsed,
        outputType: 'copy',
        copies: result.copies,
      };
    }

    default:
      throw new Error(`Unknown service type: ${serviceType}`);
  }
}

// ── POST: Create order + run AI generation ────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // Auth: extract Bearer token from header
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }
    const userId = payload.userId;

    const body = await req.json();
    const data = OrderSchema.parse(body);

    // Run AI generation
    let generationResult;
    try {
      generationResult = await runAIGeneration(data.serviceType, data.brief as Record<string, unknown>);
    } catch (genErr) {
      const message = genErr instanceof Error ? genErr.message : 'AI generation failed';
      console.error(`[AI Generation ${data.serviceType}]`, message);
      return NextResponse.json({ success: false, error: message }, { status: 422 });
    }

    // Build order record
    const order = {
      id: uuidv4(),
      userId,
      packageId: data.packageId,
      serviceType: data.serviceType,
      status: 'COMPLETED',
      brief: data.brief,
      outputUrl: generationResult.outputUrl,
      copies: generationResult.copies ?? null,
      creditsUsed: generationResult.creditsUsed,
      jobId: generationResult.jobId,
      outputType: generationResult.outputType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // TODO: Insert to DB via Drizzle
    // await db.insert(orders).values(order);

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order created and AI generation completed.',
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

// ── GET: List user's orders ──────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyJWT(token);
    if (!payload) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    const userId = payload.userId;

    const { searchParams } = new URL(req.url);
    const page  = parseInt(searchParams.get('page')  || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // TODO: Query from DB
    // const orders = await db.select().from(ordersTable)
    //   .where(eq(orders.userId, userId))
    //   .orderBy(desc(orders.createdAt))
    //   .limit(limit).offset((page - 1) * limit);

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
