import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sparkles, Video, ImageIcon, FileVideo, Copy,
  Zap, Shield, Clock, CheckCircle, ArrowRight,
  Star, Users, TrendingUp
} from 'lucide-react';

const SERVICES = [
  {
    icon: ImageIcon,
    title: 'IMAGE',
    description: 'AI-generated social media graphics — posts, stories, banners. Profesional & branded untuk Instagram, TikTok, YouTube.',
    features: ['10–Unlimited posts/bulan', 'Multi-platform output', 'Brand-consistent design', '720p → 4K resolution'],
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
  },
  {
    icon: Video,
    title: 'VIDEO',
    description: 'AI short-form video content untuk TikTok, Reels & YouTube Shorts. Script ke visual dalam hitungan menit.',
    features: ['30s → 3 menit per video', 'Vertical/Horizontal/Square', 'AI script assistance', 'Subtitle & voiceover ready'],
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
  },
  {
    icon: FileVideo,
    title: 'SHORT FILM',
    description: 'Digital Company Profile & Product Knowledge Video. Solution lengkap untuk kehadiran digital perusahaan.',
    features: ['Company Profile 2–5 menit', 'Product Knowledge Video', 'Professional quality', 'Bisa digunakan di website & sosial media'],
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Copy,
    title: 'COPYWRITING',
    description: 'AI caption, headline, product description & social post. Copy yang engaging tanpa harus hire copywriter.',
    features: ['Caption & headline', 'Product descriptions', 'Multi-platform optimized', 'Sesuai brand voice'],
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
];

const PRICING_TIERS = [
  {
    name: 'STARTER',
    price: '299',
    period: 'bulan',
    description: 'Cocok untuk bisnis kecil yang baru mulai content marketing.',
    features: [
      '10 IMAGE posts/bulan',
      '2 VIDEO (30 detik)',
      '5 COPY pieces',
      '720p output',
      'Email support',
    ],
    cta: 'Mulai Gratis 7 Hari',
    highlight: false,
  },
  {
    name: 'PRO',
    price: '599',
    period: 'bulan',
    description: 'Paket favorit untuk bisnis yang serius dengan content marketing.',
    features: [
      '30 IMAGE posts/bulan',
      '8 VIDEO (60 detik)',
      '20 COPY pieces',
      '1080p output',
      'WhatsApp support',
      'Priority queue',
    ],
    cta: 'Mulai Sekarang',
    highlight: true,
  },
  {
    name: 'ENTERPRISE',
    price: '1.499',
    period: 'bulan',
    description: 'Full package untuk perusahaan yang butuh konten berkualitas tinggi.',
    features: [
      'Unlimited IMAGE',
      'Unlimited VIDEO (3 menit)',
      'Unlimited COPY',
      '4K output',
      '1× Company Profile Video',
      'Priority SLA + Dedicated support',
      'Custom branding',
    ],
    cta: 'Hubungi Sales',
    highlight: false,
  },
];

const TESTIMONIALS = [
  {
    name: 'Rina Wijaya',
    role: 'Owner Toko Fashion @rinaboutique',
    avatar: 'RW',
    text: 'Dulu harus hire desainer tiap minggu. Sekarang cukup 10 menit klik-klik, sudah dapat 10 gambar profesional. Hemat 70%!',
    rating: 5,
  },
  {
    name: 'Budi Santoso',
    role: 'Marketing Manager, PT Sehat Sentosa',
    avatar: 'BS',
    text: 'Company profile video yang biasanya butuh budget 10 juta, sekarang dihasilkan AI dalam hitungan jam. Incredible!',
    rating: 5,
  },
  {
    name: 'Sarah Chen',
    role: 'Founder EduTech Startup',
    avatar: 'SC',
    text: 'Konten TikTok & Instagram kami konsisten 5x seminggu sekarang. Alat ini benar-benar game changer.',
    rating: 5,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans">

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">MIKAFAROZE</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#services" className="hover:text-foreground transition-colors">Layanan</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Harga</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Testimoni</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">Masuk</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm" className="bg-gradient-to-r from-violet-600 to-blue-600 hover:opacity-90">
                Mulai Gratis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden py-24 md:py-32">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-blue-50 to-slate-100 dark:from-violet-950/30 dark:via-blue-950/20 dark:bg-slate-950" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-violet-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-0 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />

        <div className="relative container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm font-medium border-violet-200 text-violet-700 dark:border-violet-800 dark:text-violet-300">
            🚀 Powered by AI — Generate dalam hitungan menit
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6 max-w-4xl mx-auto">
            Konten Marketing Profesional
            <br />
            <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
              Tanpa Tim Kreator
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            IMAGE. VIDEO. SHORT FILM. COPY. — Semua dihasilkan AI sesuai brief brand Anda.
            <br />Cukup 10 menit dari brief ke konten siap publish.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/sign-up">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-blue-600 hover:opacity-90 text-white shadow-lg shadow-violet-200 dark:shadow-violet-900/30">
                Mulai Gratis 7 Hari <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="#services">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Lihat Layanan
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-center">
            {[
              { label: 'Active Users', value: '2,500+', icon: Users },
              { label: 'Konten Dihasilkan', value: '150,000+', icon: Sparkles },
              { label: 'Avg. Generation Time', value: '< 10 menit', icon: Clock },
              { label: 'Customer Satisfaction', value: '4.9/5', icon: Star },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label}>
                <div className="flex items-center justify-center gap-1.5 text-2xl md:text-3xl font-bold text-foreground">
                  <Icon className="w-5 h-5 text-violet-500" /> {value}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <Badge className="mb-3 bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
              LAYANAN KAMI
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Semua yang Anda butuhkan untuk konten marketing
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Empat solusi lengkap untuk kebutuhan digital marketing dan produksi video perusahaan.
              Semua terintegrasi dalam satu platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map(({ icon: Icon, title, description, features, color, bg }) => (
              <Card key={title} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                  </div>
                  <CardTitle className="text-lg font-bold">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{description}</p>
                  <ul className="space-y-1.5">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 md:py-28 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <Badge className="mb-3 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              CARA KERJA
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Dari brief ke konten siap publish
              <br />dalam 3 langkah mudah
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                title: 'Pilih Paket & Isi Brief',
                description: 'Pilih paketlangganan yang sesuai. Isi brief tentang brand — nama, industri, gaya, target audiens. AI akan bekerja sesuai konteks bisnis Anda.',
                icon: FileVideo,
                color: 'violet',
              },
              {
                step: '02',
                title: 'AI Generate Konten',
                description: 'Dalam hitungan menit, AI menghasilkan IMAGE, VIDEO, atau SHORT FILM sesuai brief Anda. Anda bisa request revision atau generate ulang.',
                icon: Zap,
                color: 'blue',
              },
              {
                step: '03',
                title: 'Download & Publish',
                description: 'Konten siap download dalam format yang sudah dioptimasi untuk masing-masing platform — Instagram, TikTok, YouTube, LinkedIn.',
                icon: TrendingUp,
                color: 'emerald',
              },
            ].map(({ step, title, description, icon: Icon, color }) => (
              <div key={step} className="relative text-center">
                <div className={`inline-flex w-14 h-14 rounded-2xl items-center justify-center mb-4 bg-${color}-100 dark:bg-${color}-900/30`}>
                  <Icon className={`w-7 h-7 text-${color}-600 dark:text-${color}-400`} />
                </div>
                <div className="text-5xl font-bold text-muted/20 mb-2">{step}</div>
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <Badge className="mb-3 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              HARGA TRANSPARAN
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Paket langganan fleksibel
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Mulai dari Rp 299k/bulan. Tidak ada biaya tersembunyi. Batal kapan saja.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PRICING_TIERS.map(({ name, price, period, description, features, cta, highlight }) => (
              <Card
                key={name}
                className={`relative ${highlight ? 'border-violet-500 shadow-xl shadow-violet-200/50 dark:shadow-violet-900/20 ring-2 ring-violet-500' : 'border-border shadow-md'}`}
              >
                {highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg">
                      PALING POPULER
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="text-sm font-bold text-muted-foreground tracking-wider mb-1">{name}</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">Rp {price}</span>
                    <span className="text-muted-foreground text-sm">/{period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/sign-up" className="block">
                    <Button
                      className={`w-full ${highlight ? 'bg-gradient-to-r from-violet-600 to-blue-600 hover:opacity-90 text-white shadow-lg' : ''}`}
                      variant={highlight ? 'default' : 'outline'}
                    >
                      {cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Semua paket termasuk <strong>7 hari free trial</strong>. Tidak perlu kartu kredit.
          </p>
        </div>
      </section>

      <Separator />

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="py-20 md:py-28 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <Badge className="mb-3 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              TESTIMONI
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Dipercaya oleh bisnis di seluruh Indonesia
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {TESTIMONIALS.map(({ name, role, avatar, text, rating }) => (
              <Card key={name} className="border-0 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed mb-4 italic">"{text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                      {avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{name}</div>
                      <div className="text-xs text-muted-foreground">{role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="relative rounded-3xl bg-gradient-to-r from-violet-600 to-blue-600 px-8 py-16 text-center text-white overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
            </div>
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Siap menghasilkan konten marketing profesional?
              </h2>
              <p className="text-white/80 max-w-xl mx-auto mb-8">
                Bergabung dengan 2,500+ bisnis Indonesia yang sudah menggunakan MIKAFAROZE untuk kebutuhan konten digital mereka.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/sign-up">
                  <Button size="lg" className="bg-white text-violet-700 hover:bg-white/90 shadow-xl font-semibold">
                    Mulai Gratis 7 Hari <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="#pricing">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    Lihat Paket Harga
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-base font-bold">MIKAFAROZE</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 MIKAFAROZE. All rights reserved. Platform AI Content Marketing untuk Bisnis Indonesia.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
