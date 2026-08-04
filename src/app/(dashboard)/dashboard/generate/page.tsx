'use client';

import { useState, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ImageIcon, Video, FileVideo, ScrollText, Sparkles,
  Loader2, ArrowRight, CheckCircle, AlertCircle
} from 'lucide-react';

const SERVICE_TYPES = [
  { key: 'IMAGE', label: 'IMAGE', desc: 'AI social media graphics', icon: ImageIcon, color: 'text-pink-500 bg-pink-500/10', bgHover: 'hover:bg-pink-50' },
  { key: 'VIDEO', label: 'VIDEO', desc: 'AI short-form video', icon: Video, color: 'text-violet-500 bg-violet-500/10', bgHover: 'hover:bg-violet-50' },
  { key: 'SHORT_FILM', label: 'SHORT FILM', desc: 'Company profile & product video', icon: FileVideo, color: 'text-blue-500 bg-blue-500/10', bgHover: 'hover:bg-blue-50' },
  { key: 'COPY', label: 'COPYWRITING', desc: 'AI caption & headline', icon: ScrollText, color: 'text-emerald-500 bg-emerald-500/10', bgHover: 'hover:bg-emerald-50' },
];

const TONES = ['professional', 'friendly', 'playful', 'luxury', 'casual'] as const;
const IMAGE_STYLES = ['minimalist', 'bold', 'elegant', 'playful', 'modern', 'corporate'];
const PLATFORMS = ['instagram', 'tiktok', 'facebook', 'twitter'] as const;
const VIDEO_FORMATS = ['vertical', 'horizontal', 'square'] as const;
const COPY_TYPES = ['caption', 'headline', 'product_desc', 'social_post'] as const;

// ─── Inner page (receives initialType as prop) ───
function GeneratePageContent({ initialType }: { initialType: 'IMAGE' | 'VIDEO' | 'SHORT_FILM' | 'COPY' }) {
  const [selectedType, setSelectedType] = useState(initialType);
  const [step, setStep] = useState<'type' | 'brief' | 'generating' | 'done'>('type');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ url?: string; jobId?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Brief form state
  const [brief, setBrief] = useState({
    brandName: '',
    industry: '',
    tone: 'professional' as const,
    targetAudience: '',
    // IMAGE
    imageStyle: 'modern',
    imageCount: 1,
    colorPreference: [] as string[],
    imagePlatform: [] as string[],
    // VIDEO
    videoDuration: 30,
    videoFormat: 'vertical' as 'vertical' | 'horizontal' | 'square',
    script: '',
    // SHORT_FILM
    filmType: 'company_profile' as 'company_profile' | 'product_knowledge',
    filmDuration: 120,
    keyMessages: '',
    includeVoiceover: false,
    // COPY
    copyType: 'caption' as 'caption' | 'headline' | 'product_desc' | 'social_post',
    copyCount: 3,
    platform: 'instagram' as 'instagram' | 'tiktok' | 'youtube' | 'linkedin',
  });

  async function handleGenerate() {
    setStep('generating');
    setGenerating(true);
    setProgress(0);
    setError(null);

    // Simulate generation progress
    const intervals = [10, 25, 45, 60, 75, 88, 95, 100];
    let i = 0;
    const tick = () => {
      if (i < intervals.length) {
        setProgress(intervals[i++]);
        setTimeout(tick, 800 + Math.random() * 1500);
      }
    };
    tick();

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: `pkg-${selectedType.toLowerCase()}-pro`, serviceType: selectedType, brief }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Generation failed');

      setResult({ jobId: data.data?.id });
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStep('brief');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-violet-500" />
          Generate Konten AI
        </h1>
        <p className="text-muted-foreground mt-1">Pilih jenis layanan dan isi brief untuk generate konten.</p>
      </div>

      {/* ── STEP 1: Select Type ── */}
      {step === 'type' && (
        <div className="space-y-5">
          <div>
            <Label className="text-base font-semibold mb-3 block">Pilih Jenis Layanan</Label>
            <div className="grid grid-cols-2 gap-4">
              {SERVICE_TYPES.map(({ key, label, desc, icon: Icon, color, bgHover }) => (
                <Card
                  key={key}
                  className={`cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 border-2 ${selectedType === key ? 'border-primary shadow-md' : 'border-transparent'} ${bgHover}`}
                  onClick={() => setSelectedType(key as typeof selectedType)}
                >
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">{label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
                    </div>
                    {selectedType === key && (
                      <CheckCircle className="w-4 h-4 text-primary ml-auto shrink-0" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setStep('brief')} className="bg-gradient-to-r from-violet-600 to-blue-600 hover:opacity-90">
              Lanjut ke Brief <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 2: Brief Form ── */}
      {step === 'brief' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Badge className={`${SERVICE_TYPES.find((s) => s.key === selectedType)?.color}`}>
                {selectedType}
              </Badge>
              Brief Form
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Common fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Brand Name *</Label>
                <Input placeholder="Nama brand/perusahaan" value={brief.brandName} onChange={(e) => setBrief({ ...brief, brandName: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Industry *</Label>
                <Input placeholder="e.g. Fashion, F&B, Tech" value={brief.industry} onChange={(e) => setBrief({ ...brief, industry: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Tone</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={brief.tone}
                  onChange={(e) => setBrief({ ...brief, tone: e.target.value as typeof brief.tone })}
                >
                  {TONES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Target Audience *</Label>
                <Input placeholder="e.g. Remaja 18-25, UMKM" value={brief.targetAudience} onChange={(e) => setBrief({ ...brief, targetAudience: e.target.value })} />
              </div>
            </div>

            {/* IMAGE fields */}
            {selectedType === 'IMAGE' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Style</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={brief.imageStyle}
                      onChange={(e) => setBrief({ ...brief, imageStyle: e.target.value })}
                    >
                      {IMAGE_STYLES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Jumlah Output</Label>
                    <Input type="number" min={1} max={10} value={brief.imageCount} onChange={(e) => setBrief({ ...brief, imageCount: Number(e.target.value) })} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Platform</Label>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORMS.map((p) => (
                      <label key={p} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={brief.imagePlatform.includes(p)}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...brief.imagePlatform, p]
                              : brief.imagePlatform.filter((x) => x !== p);
                            setBrief({ ...brief, imagePlatform: next });
                          }}
                          className="rounded border-muted-foreground"
                        />
                        <span className="text-sm capitalize">{p}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* VIDEO fields */}
            {selectedType === 'VIDEO' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Durasi (detik)</Label>
                    <Input type="number" min={5} max={180} value={brief.videoDuration} onChange={(e) => setBrief({ ...brief, videoDuration: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Format</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={brief.videoFormat}
                      onChange={(e) => setBrief({ ...brief, videoFormat: e.target.value as typeof brief.videoFormat })}
                    >
                      {VIDEO_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Script (optional)</Label>
                  <textarea
                    className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Tulis script atau ide视频内容..."
                    value={brief.script}
                    onChange={(e) => setBrief({ ...brief, script: e.target.value })}
                  />
                </div>
              </>
            )}

            {/* SHORT_FILM fields */}
            {selectedType === 'SHORT_FILM' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Jenis Film</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={brief.filmType}
                      onChange={(e) => setBrief({ ...brief, filmType: e.target.value as typeof brief.filmType })}
                    >
                      <option value="company_profile">Company Profile</option>
                      <option value="product_knowledge">Product Knowledge</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Durasi (detik)</Label>
                    <Input type="number" min={30} max={600} value={brief.filmDuration} onChange={(e) => setBrief({ ...brief, filmDuration: Number(e.target.value) })} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Key Messages (pisahkan dengan enter)</Label>
                  <textarea
                    className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Pesan utama yang ingin disampaikan..."
                    value={brief.keyMessages}
                    onChange={(e) => setBrief({ ...brief, keyMessages: e.target.value })}
                  />
                </div>
              </>
            )}

            {/* COPY fields */}
            {selectedType === 'COPY' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Copy Type</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={brief.copyType}
                      onChange={(e) => setBrief({ ...brief, copyType: e.target.value as typeof brief.copyType })}
                    >
                      {COPY_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Platform</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={brief.platform}
                      onChange={(e) => setBrief({ ...brief, platform: e.target.value as typeof brief.platform })}
                    >
                      {['instagram', 'tiktok', 'youtube', 'linkedin'].map((p) => (
                        <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Jumlah Copy</Label>
                  <Input type="number" min={1} max={20} value={brief.copyCount} onChange={(e) => setBrief({ ...brief, copyCount: Number(e.target.value) })} />
                </div>
              </>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep('type')}>Kembali</Button>
              <Button
                onClick={handleGenerate}
                className="flex-1 bg-gradient-to-r from-violet-600 to-blue-600 hover:opacity-90"
                disabled={!brief.brandName || !brief.industry || !brief.targetAudience}
              >
                <Sparkles className="w-4 h-4 mr-2" /> Generate Sekarang
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── STEP 3: Generating ── */}
      {step === 'generating' && (
        <Card className="text-center py-12">
          <CardContent className="space-y-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 flex items-center justify-center mx-auto animate-pulse">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">AI sedang generate konten...</h3>
              <p className="text-muted-foreground text-sm">
                {selectedType === 'IMAGE' && 'Membuat desain social media graphics untuk brand Anda'}
                {selectedType === 'VIDEO' && 'Membuat short-form video dengan AI'}
                {selectedType === 'SHORT_FILM' && 'Membuat company profile / product knowledge video'}
                {selectedType === 'COPY' && 'Menulis caption dan headline yang engaging'}
              </p>
            </div>
            <div className="max-w-xs mx-auto space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground">{progress}% selesai</p>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-600 justify-center text-sm">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── STEP 4: Done ── */}
      {step === 'done' && (
        <Card className="text-center py-10">
          <CardContent className="space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Konten berhasil di-generate!</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Hasil sudah tersedia di dashboard Anda. {result?.jobId && `Job ID: ${result.jobId.slice(0, 8)}...`}
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => { setStep('type'); setResult(null); }}>
                Generate Lagi
              </Button>
              <a href="/dashboard/orders">
                <Button className="bg-gradient-to-r from-violet-600 to-blue-600 hover:opacity-90">
                  Lihat di Dashboard
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Wrapper with Suspense (useSearchParams needs it) ───
export default function GeneratePage() {
  return (
    <Suspense fallback={<div className="p-8"><div className="h-64 skeleton rounded-xl" /></div>}>
      <GeneratePageContent initialType="IMAGE" />
    </Suspense>
  );
}
