/**
 * MIKAFAROZE — Database Seed Script (raw SQL)
 * Seeds 12 service packages into Supabase PostgreSQL
 *
 * Run: npx tsx scripts/seed.ts
 */

import postgres from 'postgres';

const sql = postgres('postgresql://postgres:ZKAcSbgM7TyIJN8m@db.abaluqlwslhafelhrmuz.supabase.co:5432/postgres');

const now = new Date().toISOString();

const packages = [
  // ── IMAGE ──
  [
    'img-starter', 'IMAGE Starter',
    'AI-generated social media graphics — 10 posts per bulan. Cocok untuk UMKM yang butuh konten rutin tapi budget terbatas.',
    'IMAGE', 'DIGITAL_MARKETING', 299000, true, 1,
    JSON.stringify({ monthly_limit: 10, resolution: '720p', style_options: ['minimalist', 'modern'], platform: ['instagram', 'facebook'], revisions: 0, delivery: 'instant', ai_model: 'flux-schnell' }),
  ],
  [
    'img-pro', 'IMAGE Pro',
    'AI-generated social media graphics — 30 posts per bulan dengan style lengkap dan output 1080p.',
    'IMAGE', 'DIGITAL_MARKETING', 599000, true, 2,
    JSON.stringify({ monthly_limit: 30, resolution: '1080p', style_options: ['minimalist', 'bold', 'elegant', 'playful', 'modern', 'corporate'], platform: ['instagram', 'facebook', 'tiktok', 'twitter'], revisions: 2, delivery: 'instant', ai_model: 'flux-schnell' }),
  ],
  [
    'img-enterprise', 'IMAGE Enterprise',
    'AI-generated social media graphics — unlimited dengan output 4K dan seluruh style.',
    'IMAGE', 'DIGITAL_MARKETING', 1499000, true, 3,
    JSON.stringify({ monthly_limit: 9999, resolution: '4K', style_options: ['minimalist', 'bold', 'elegant', 'playful', 'modern', 'corporate', 'custom'], platform: ['instagram', 'facebook', 'tiktok', 'twitter', 'linkedin', 'youtube'], revisions: 9999, delivery: 'instant', ai_model: 'flux-pro' }),
  ],
  // ── VIDEO ──
  [
    'vid-starter', 'VIDEO Starter',
    'AI short-form video — 2 video per bulan, durasi 30 detik, 720p.',
    'VIDEO', 'DIGITAL_MARKETING', 499000, true, 4,
    JSON.stringify({ monthly_limit: 2, duration_sec: 30, resolution: '720p', format: ['vertical', 'square'], platform: ['tiktok', 'instagram', 'youtube_shorts'], revisions: 0, delivery: 'instant', ai_model: 'kling-video' }),
  ],
  [
    'vid-pro', 'VIDEO Pro',
    'AI short-form video — 8 video per bulan, durasi 60 detik, 1080p.',
    'VIDEO', 'DIGITAL_MARKETING', 999000, true, 5,
    JSON.stringify({ monthly_limit: 8, duration_sec: 60, resolution: '1080p', format: ['vertical', 'horizontal', 'square'], platform: ['tiktok', 'instagram', 'facebook', 'youtube_shorts'], revisions: 2, delivery: 'instant', ai_model: 'kling-video' }),
  ],
  [
    'vid-enterprise', 'VIDEO Enterprise',
    'AI short-form video — unlimited, durasi hingga 180 detik, 4K.',
    'VIDEO', 'DIGITAL_MARKETING', 2499000, true, 6,
    JSON.stringify({ monthly_limit: 9999, duration_sec: 180, resolution: '4K', format: ['vertical', 'horizontal', 'square'], platform: ['tiktok', 'instagram', 'facebook', 'twitter', 'youtube_shorts', 'linkedin'], revisions: 9999, delivery: 'instant', ai_model: 'kling-video-pro' }),
  ],
  // ── COPYWRITING ──
  [
    'cpy-starter', 'COPY Starter',
    'AI copywriting — 5 pieces per bulan. Caption atau headline untuk social media.',
    'COPY', 'DIGITAL_MARKETING', 199000, true, 7,
    JSON.stringify({ monthly_limit: 5, copy_types: ['caption', 'headline'], tone_options: ['professional', 'friendly', 'playful'], platform: ['instagram', 'facebook'], revisions: 0, delivery: 'instant', ai_model: 'gpt-4o-mini' }),
  ],
  [
    'cpy-pro', 'COPY Pro',
    'AI copywriting — 20 pieces per bulan dengan semua format. Lengkap untuk content marketing aktif.',
    'COPY', 'DIGITAL_MARKETING', 399000, true, 8,
    JSON.stringify({ monthly_limit: 20, copy_types: ['caption', 'headline', 'product_desc', 'social_post', 'email_body'], tone_options: ['professional', 'friendly', 'playful', 'luxury', 'casual'], platform: ['instagram', 'facebook', 'tiktok', 'twitter', 'linkedin', 'youtube'], revisions: 3, delivery: 'instant', ai_model: 'gpt-4o' }),
  ],
  [
    'cpy-enterprise', 'COPY Enterprise',
    'AI copywriting — unlimited pieces, semua format dan tone. Full-scale content marketing tanpa batas.',
    'COPY', 'DIGITAL_MARKETING', 799000, true, 9,
    JSON.stringify({ monthly_limit: 9999, copy_types: ['caption', 'headline', 'product_desc', 'social_post', 'email_body', 'landing_page', 'ad_copy'], tone_options: ['professional', 'friendly', 'playful', 'luxury', 'casual', 'custom'], platform: ['instagram', 'facebook', 'tiktok', 'twitter', 'linkedin', 'youtube', 'website'], revisions: 9999, delivery: 'instant', ai_model: 'gpt-4o' }),
  ],
  // ── SHORT FILM ──
  [
    'sf-pro', 'SHORT FILM Pro',
    'AI-generated Company Profile video — 1 video per bulan, durasi hingga 2 menit, 1080p.',
    'SHORT_FILM', 'SHORT_FILM', 1499000, true, 10,
    JSON.stringify({ monthly_limit: 1, duration_sec: 120, resolution: '1080p', film_types: ['company_profile'], voiceover: true, music: true, revisions: 2, delivery: '3_days', ai_model: 'minimax-video' }),
  ],
  [
    'sf-enterprise', 'SHORT FILM Enterprise',
    'AI-generated Company Profile + Product Knowledge — 2 video per bulan, durasi hingga 5 menit, 4K.',
    'SHORT_FILM', 'SHORT_FILM', 2999000, true, 11,
    JSON.stringify({ monthly_limit: 2, duration_sec: 300, resolution: '4K', film_types: ['company_profile', 'product_knowledge'], voiceover: true, music: true, subtitles: true, revisions: 5, delivery: '5_days', ai_model: 'minimax-video-pro' }),
  ],
];

async function seed() {
  console.log('🌱 Seeding MIKAFAROZE service packages...\n');

  // Clear existing
  await sql`DELETE FROM service_packages`;
  console.log('  ✓ Cleared existing packages');

  // Insert each package
  for (const [id, name, description, service_type, category, price, is_active, sort_order, metadata] of packages) {
    await sql`
      INSERT INTO service_packages (id, name, description, service_type, category, price, is_active, sort_order, metadata, created_at, updated_at)
      VALUES (
        ${id}, ${name}, ${description}, ${service_type}::service_type,
        ${category}::service_category, ${price}, ${is_active}, ${sort_order},
        ${metadata}::jsonb, ${now}, ${now}
      )
    `;
    console.log(`  ✓ ${id} (${name})`);
  }

  console.log(`\n✅ Seeded ${packages.length} packages successfully.`);
  await sql.end();
}

seed().catch((err) => {
  console.error('\n❌ Seed failed:', err.message || err);
  process.exit(1);
});
