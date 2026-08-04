// ============================================
// MIKAFAROZE — Fal.ai AI Service
// Image & Video generation via Fal.ai
// ============================================

import { fal } from '@fal-ai/client';

const FAL_WEBHOOK_URL = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/fal`
  : 'http://localhost:3000/api/webhooks/fal';

// ---- Image Generation ----
export async function generateImage(params: {
  brandName: string;
  industry: string;
  style: string;
  colorPreference?: string[];
  platform?: string;
}): Promise<{ imageUrl: string; jobId: string }> {
  const prompt = buildImagePrompt(params);

  const result = await fal.subscribe('fal-ai/flux/schnell', {
    input: {
      prompt,
      num_images: 1,
      image_size: 'portrait_16_9',
      guidance_scale: 3.5,
    },
    pollInterval: 2000,
  });

  const data = result.data as { images?: { url: string }[] };

  if (!data.images?.[0]?.url) {
    throw new Error('Image generation failed: no image returned');
  }

  return { imageUrl: data.images[0].url, jobId: result.requestId };
}

function buildImagePrompt(params: {
  brandName: string;
  industry: string;
  style: string;
  colorPreference?: string[];
  platform?: string;
}): string {
  const colors = params.colorPreference?.length
    ? `Color palette: ${params.colorPreference.join(', ')}.`
    : '';

  const platform = params.platform
    ? `Optimized for ${params.platform} format.`
    : '';

  return (
    `Professional social media post design for ${params.brandName}, ` +
    `a ${params.industry} business. ` +
    `Style: ${params.style}, modern, clean layout. ` +
    `${colors} ${platform} ` +
    `Include space for text overlay. High quality, branded aesthetic.`
  );
}

// ---- Video Generation ----
export async function generateVideo(params: {
  brandName: string;
  industry: string;
  duration: number; // seconds
  format: 'vertical' | 'horizontal' | 'square';
  script?: string;
}): Promise<{ videoUrl: string; jobId: string }> {
  const aspectRatio = params.format === 'vertical'
    ? '9:16'
    : params.format === 'square'
    ? '1:1'
    : '16:9';

  const prompt = params.script
    ? `[START] ${params.script} [END] — Professional short video for ${params.brandName} (${params.industry}), ${params.duration}s, ${aspectRatio} format`
    : `Professional short video for ${params.brandName}, ${params.industry} business, ${params.duration} seconds, ${aspectRatio} aspect ratio, engaging content`;

  const result = await fal.subscribe('fal-ai/kling-video/v1.2/text-to-video', {
    input: {
      prompt,
      duration: Math.min(params.duration, 5), // Kling max 5s per call
      aspect_ratio: aspectRatio,
    },
    pollInterval: 3000,
  });

  const data = result.data as { video?: { url: string } };

  if (!data.video?.url) {
    throw new Error('Video generation failed: no video returned');
  }

  return { videoUrl: data.video.url, jobId: result.requestId };
}

// ---- Short Film (Company Profile / Product Knowledge) ----
export async function generateShortFilm(params: {
  brandName: string;
  industry: string;
  filmType: 'company_profile' | 'product_knowledge';
  duration: number; // seconds
  keyMessages?: string[];
  includeVoiceover?: boolean;
}): Promise<{ videoUrl: string; jobId: string }> {
  const messages = params.keyMessages?.join(' → ') || `${params.brandName}, leading ${params.industry} company in Indonesia`;

  const prompt =
    params.filmType === 'company_profile'
      ? `Professional company profile video for ${params.brandName}. ` +
        `Industry: ${params.industry}. ` +
        `Key messages to convey: ${messages}. ` +
        `Duration: ${params.duration} seconds. ` +
        `Cinematic, corporate video style, aerial footage concept, Indonesian business context.`
      : `Product knowledge video for ${params.brandName}. ` +
        `Industry: ${params.industry}. ` +
        `Key product features: ${messages}. ` +
        `Duration: ${params.duration} seconds. ` +
        `Professional product showcase style, clear demonstration.`;

  const result = await fal.subscribe('fal-ai/kling-video/v1.2/text-to-video', {
    input: {
      prompt,
      duration: Math.min(params.duration, 5),
      aspect_ratio: '16:9',
    },
    pollInterval: 3000,
  });

  const data = result.data as { video?: { url: string } };

  if (!data.video?.url) {
    throw new Error('Short film generation failed: no video returned');
  }

  return { videoUrl: data.video.url, jobId: result.requestId };
}
