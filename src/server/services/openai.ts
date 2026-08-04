// ============================================
// MIKAFAROZE — OpenAI Copywriting Service
// ============================================

import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type CopyType = 'caption' | 'headline' | 'product_desc' | 'social_post';
type Platform = 'instagram' | 'tiktok' | 'youtube' | 'linkedin';
type Tone = 'professional' | 'friendly' | 'playful' | 'luxury' | 'casual';

interface GenerateCopyParams {
  brandName: string;
  industry: string;
  productService?: string;
  targetAudience: string;
  tone: Tone;
  copyType: CopyType;
  platform: Platform;
  count: number;
}

const SYSTEM_PROMPT = `You are an expert Indonesian social media copywriter with 10+ years of experience. You write compelling, platform-native content that drives engagement. Always write in Indonesian unless explicitly asked otherwise. Focus on clarity, urgency (without being spammy), and authentic brand voice.`;

function buildCopyPrompt(params: GenerateCopyParams): string {
  const platformLabel = params.platform.charAt(0).toUpperCase() + params.platform.slice(1);
  const count = params.count;

  const copyTypeInstructions: Record<CopyType, string> = {
    caption: `Write ${count} Instagram/Facebook captions. Each should be engaging, use emojis sparingly, include a clear CTA, and fit the ${params.tone} tone for ${params.industry} industry.`,
    headline: `Write ${count} catchy headlines/taglines for ${params.brandName}. They should be memorable, ${params.tone} in tone, and work across platforms.`,
    product_desc: `Write ${count} product descriptions for ${params.brandName} (${params.industry}). Each should highlight unique value propositions and be compelling for target audience: ${params.targetAudience}.`,
    social_post: `Write ${count} social media posts optimized for ${platformLabel}. Make them native to the platform, engaging, and aligned with ${params.tone} tone. Target audience: ${params.targetAudience}.`,
  };

  return `Brand: ${params.brandName}
Industry: ${params.industry}
Product/Service: ${params.productService || 'general products and services'}
Target Audience: ${params.targetAudience}
Tone: ${params.tone}

${copyTypeInstructions[params.copyType]}

Format your response as a numbered list, one entry per line. Separate each entry with "---".`;
}

export async function generateCopy(params: GenerateCopyParams): Promise<{ copies: string[]; jobId: string }> {
  const prompt = buildCopyPrompt(params);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    temperature: 0.8,
    max_tokens: 2048,
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error('Copy generation failed: no content returned');
  }

  const copies = content
    .split('---')
    .map((s) => s.trim())
    .filter(Boolean);

  return { copies, jobId: response.id };
}
