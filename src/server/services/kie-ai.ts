/**
 * MIKAFAROZE — Kie.ai AI Service
 * Image generation (GPT Image 2, Nano Banana) + LLM Copywriting
 *
 * Docs: https://docs.kie.ai
 * Base URL: https://api.kie.ai
 *
 * Pricing (as of 2025):
 *   GPT Image 2 (4K)  : $0.08/image
 *   GPT Image 2 (2K)  : $0.05/image
 *   GPT Image 2 (1K)  : $0.03/image
 *   Nano Banana 2     : $0.04/image
 *   GPT 5.5 Input    : $1.40/1M tokens  (vs OpenAI $5.00)
 *   Claude Sonnet 4.6 : $0.85/1M tokens  (vs OpenAI $3.00)
 */

import axios from 'axios';

// ── Config ───────────────────────────────────────────────────────────────────
const KIE_BASE_URL = 'https://api.kie.ai';
const KIE_API_KEY  = process.env.KIE_API_KEY || '';

const kieClient = axios.create({
  baseURL: KIE_BASE_URL,
  timeout: 60_000,
  headers: { 'Authorization': `Bearer ${KIE_API_KEY}` },
});

// ── Types ───────────────────────────────────────────────────────────────────
type ImageResolution = '1K' | '2K' | '4K';
type CopyModel = 'gpt-5.5' | 'claude-sonnet-4.6' | 'gpt-4o-mini';

interface ImageResult { imageUrl: string; jobId: string; creditsUsed: number; }
interface CopyResult  { copies: string[]; jobId: string; creditsUsed: number; }

// ── Cost Calculator ─────────────────────────────────────────────────────────
// Kie.ai credits: 1 credit ≈ $0.001 (varies by model)
// We track estimated cost in USD for transparency
function calcImageCost(model: string, resolution: ImageResolution): number {
  const prices: Record<string, Record<ImageResolution, number>> = {
    'gpt-image-2': { '1K': 0.03, '2K': 0.05, '4K': 0.08 },
    'nano-banana-2': { '1K': 0.02, '2K': 0.03, '4K': 0.04 },
    'seedream-v4': { '1K': 0.02, '2K': 0.03, '4K': 0.05 },
    'flux-2-pro': { '1K': 0.03, '2K': 0.04, '4K': 0.06 },
  };
  return prices[model]?.[resolution] ?? 0.05;
}

// ── Image Generation ────────────────────────────────────────────────────────
export async function generateImage(params: {
  brandName: string;
  industry: string;
  style: string;
  colorPreference?: string[];
  platform?: string;
  resolution?: ImageResolution;
  model?: 'gpt-image-2' | 'nano-banana-2' | 'seedream-v4' | 'flux-2-pro';
}): Promise<ImageResult> {
  if (!KIE_API_KEY) throw new Error('KIE_API_KEY not configured');

  const resolution = params.resolution ?? '2K';
  const model     = params.model ?? 'gpt-image-2';

  const prompt = buildImagePrompt(params);

  try {
    const response = await kieClient.post('/v1/images/generations', {
      model,
      prompt,
      n: 1,
      resolution,
      // Kie.ai returns URL or b64_json
      response_format: 'url',
    });

    const data = response.data as {
      data?: { url?: string; b64_json?: string }[];
      created?: number;
    };

    const imageUrl = data.data?.[0]?.url;
    if (!imageUrl) throw new Error('No image URL returned from Kie.ai');

    return {
      imageUrl,
      jobId: `kie-${Date.now()}`,
      creditsUsed: calcImageCost(model, resolution),
    };
  } catch (err) {
    const msg = axios.isAxiosError(err)
      ? err.response?.data?.error?.message || err.message
      : err instanceof Error ? err.message : 'Unknown error';
    throw new Error(`Kie.ai image generation failed: ${msg}`);
  }
}

function buildImagePrompt(params: {
  brandName: string;
  industry: string;
  style: string;
  colorPreference?: string[];
  platform?: string;
}): string {
  const colors   = params.colorPreference?.length ? `Color palette: ${params.colorPreference.join(', ')}.` : '';
  const platform = params.platform ? `Optimized for ${params.platform} format.` : '';

  return (
    `Professional social media post design for ${params.brandName}, ` +
    `a ${params.industry} business. ` +
    `Style: ${params.style}, modern, clean layout. ` +
    `${colors} ${platform} ` +
    `Include space for text overlay. High quality, branded aesthetic.`
  );
}

// ── Copywriting (LLM) ───────────────────────────────────────────────────────
export async function generateCopy(params: {
  brandName: string;
  industry: string;
  productService?: string;
  targetAudience: string;
  tone: 'professional' | 'friendly' | 'playful' | 'luxury' | 'casual';
  copyType: 'caption' | 'headline' | 'product_desc' | 'social_post';
  platform: 'instagram' | 'tiktok' | 'youtube' | 'linkedin';
  count: number;
  model?: CopyModel;
}): Promise<CopyResult> {
  if (!KIE_API_KEY) throw new Error('KIE_API_KEY not configured');

  const model   = params.model ?? 'gpt-5.5';
  const prompt  = buildCopyPrompt(params);

  try {
    const response = await kieClient.post('/v1/chat/completions', {
      model,
      messages: [
        {
          role: 'system',
          content: `You are an expert Indonesian social media copywriter with 10+ years experience. ` +
            `Write compelling, platform-native content that drives engagement. ` +
            `Always write in Indonesian unless explicitly asked otherwise. ` +
            `Focus on clarity, urgency (without being spammy), and authentic brand voice.`,
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 2048,
    });

    const data = response.data as {
      id?: string;
      choices?: { message?: { content?: string } }[];
      usage?: { total_tokens?: number };
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('No content returned from Kie.ai LLM');

    const copies = content
      .split('---')
      .map((s) => s.trim())
      .filter(Boolean);

    // Estimate cost: $1.40/1M tokens input for gpt-5.5, ~500 tokens input = $0.0007
    const tokens    = data.usage?.total_tokens ?? 500;
    const costPerM  = { 'gpt-5.5': 1.40, 'claude-sonnet-4.6': 0.85, 'gpt-4o-mini': 0.15 };
    const costUSD   = (tokens / 1_000_000) * (costPerM[model] ?? 1.40);

    return { copies, jobId: data.id ?? `kie-${Date.now()}`, creditsUsed: costUSD };
  } catch (err) {
    const msg = axios.isAxiosError(err)
      ? err.response?.data?.error?.message || err.message
      : err instanceof Error ? err.message : 'Unknown error';
    throw new Error(`Kie.ai copy generation failed: ${msg}`);
  }
}

function buildCopyPrompt(params: {
  brandName: string;
  industry: string;
  productService?: string;
  targetAudience: string;
  tone: string;
  copyType: string;
  platform: string;
  count: number;
}): string {
  const count = params.count;

  const instructions: Record<string, string> = {
    caption:      `Write ${count} Instagram/Facebook captions. Engaging, emojis sparingly, clear CTA, ${params.tone} tone for ${params.industry} industry.`,
    headline:     `Write ${count} catchy headlines/taglines for ${params.brandName}. Memorable, ${params.tone} tone, work across platforms.`,
    product_desc: `Write ${count} product descriptions for ${params.brandName} (${params.industry}). Highlight unique value propositions, compelling for: ${params.targetAudience}.`,
    social_post:  `Write ${count} social media posts optimized for ${params.platform}. Native platform style, engaging, ${params.tone} tone. Target: ${params.targetAudience}.`,
  };

  return `Brand: ${params.brandName}
Industry: ${params.industry}
Product/Service: ${params.productService || 'general products and services'}
Target Audience: ${params.targetAudience}
Tone: ${params.tone}

${instructions[params.copyType] ?? instructions.caption}

Format your response as a numbered list, one entry per line. Separate each entry with "---".`;
}
