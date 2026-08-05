'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ImageIcon, Video, FileVideo, ScrollText,
  TrendingUp, Clock, CheckCircle, AlertCircle, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

const SERVICE_ICONS = {
  IMAGE: ImageIcon,
  VIDEO: Video,
  SHORT_FILM: FileVideo,
  COPY: ScrollText,
};

const SERVICE_COLORS = {
  IMAGE: 'text-pink-500 bg-pink-500/10',
  VIDEO: 'text-violet-500 bg-violet-500/10',
  SHORT_FILM: 'text-blue-500 bg-blue-500/10',
  COPY: 'text-emerald-500 bg-emerald-500/10',
};

const MOCK_STATS = {
  imageUsed: 7,
  imageLimit: 30,
  videoUsed: 3,
  videoLimit: 8,
  copyUsed: 12,
  copyLimit: 20,
};

const MOCK_RECENT_ORDERS = [
  { id: '1', serviceType: 'IMAGE', status: 'COMPLETED', createdAt: '2 jam lalu', brief: { brandName: 'Rina Boutique' } },
  { id: '2', serviceType: 'VIDEO', status: 'PROCESSING', createdAt: '5 jam lalu', brief: { brandName: 'Kopi Nusantara' } },
  { id: '3', serviceType: 'COPY', status: 'COMPLETED', createdAt: '1 hari lalu', brief: { brandName: 'EduSpace' } },
  { id: '4', serviceType: 'SHORT_FILM', status: 'PENDING', createdAt: '1 hari lalu', brief: { brandName: 'PT Sehat Sentosa' } },
];

const STATUS_STYLES = {
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  PROCESSING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  FAILED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  CANCELLED: 'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400',
};

export default function DashboardPage() {
  const [userName, setUserName] = useState<string>('there');

  useEffect(() => {
    const stored = localStorage.getItem('mik_user');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        setUserName(u.name || 'there');
      } catch {}
    }
  }, []);

  return (
    <div className="p-8 space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Selamat datang, {userName} 👋</h1>
          <p className="text-muted-foreground mt-1">
            Berikut ringkasan aktivitas dan penggunaan paket Anda.
          </p>
        </div>
        <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 text-sm px-3 py-1">
          Pro Plan — Aktif
        </Badge>
      </div>

      {/* Subscription Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* IMAGE usage */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${SERVICE_COLORS.IMAGE}`}>
                <ImageIcon className="w-4.5 h-4.5" />
              </div>
              <span className="text-xs text-muted-foreground">per bulan</span>
            </div>
            <CardTitle className="text-base font-semibold mt-3">IMAGE Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{MOCK_STATS.imageUsed}<span className="text-lg text-muted-foreground">/{MOCK_STATS.imageLimit}</span></div>
            <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-pink-500 rounded-full" style={{ width: `${(MOCK_STATS.imageUsed / MOCK_STATS.imageLimit) * 100}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{MOCK_STATS.imageLimit - MOCK_STATS.imageUsed} remaining this month</p>
          </CardContent>
        </Card>

        {/* VIDEO usage */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${SERVICE_COLORS.VIDEO}`}>
                <Video className="w-4.5 h-4.5" />
              </div>
              <span className="text-xs text-muted-foreground">per bulan</span>
            </div>
            <CardTitle className="text-base font-semibold mt-3">VIDEO Clips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{MOCK_STATS.videoUsed}<span className="text-lg text-muted-foreground">/{MOCK_STATS.videoLimit}</span></div>
            <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-violet-500 rounded-full" style={{ width: `${(MOCK_STATS.videoUsed / MOCK_STATS.videoLimit) * 100}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{MOCK_STATS.videoLimit - MOCK_STATS.videoUsed} remaining this month</p>
          </CardContent>
        </Card>

        {/* COPY usage */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${SERVICE_COLORS.COPY}`}>
                <ScrollText className="w-4.5 h-4.5" />
              </div>
              <span className="text-xs text-muted-foreground">per bulan</span>
            </div>
            <CardTitle className="text-base font-semibold mt-3">COPY Pieces</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{MOCK_STATS.copyUsed}<span className="text-lg text-muted-foreground">/{MOCK_STATS.copyLimit}</span></div>
            <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(MOCK_STATS.copyUsed / MOCK_STATS.copyLimit) * 100}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{MOCK_STATS.copyLimit - MOCK_STATS.copyUsed} remaining this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Generate IMAGE', desc: 'Social media graphics AI', icon: ImageIcon, href: '/dashboard/generate?type=IMAGE', color: 'bg-pink-500/10 text-pink-600 hover:bg-pink-500/20' },
          { label: 'Generate VIDEO', desc: 'Short-form video AI', icon: Video, href: '/dashboard/generate?type=VIDEO', color: 'bg-violet-500/10 text-violet-600 hover:bg-violet-500/20' },
          { label: 'Short Film', desc: 'Company profile & product', icon: FileVideo, href: '/dashboard/generate?type=SHORT_FILM', color: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20' },
          { label: 'Copywriting', desc: 'Caption & headline AI', icon: ScrollText, href: '/dashboard/generate?type=COPY', color: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20' },
        ].map(({ label, desc, icon: Icon, href, color }) => (
          <Link key={label} href={href}>
            <Card className={`cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${color}`}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-background/80`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">{label}</div>
                  <div className="text-xs opacity-70 mt-0.5">{desc}</div>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto opacity-50" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
            <Link href="/dashboard/orders" className="text-sm text-primary font-medium hover:underline">
              Lihat semua
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {MOCK_RECENT_ORDERS.map((order) => {
              const Icon = SERVICE_ICONS[order.serviceType as keyof typeof SERVICE_ICONS];
              const color = SERVICE_COLORS[order.serviceType as keyof typeof SERVICE_COLORS];
              return (
                <Link key={order.id} href={`/dashboard/orders/${order.id}`}>
                  <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{order.brief.brandName}</div>
                      <div className="text-xs text-muted-foreground">{order.serviceType} · {order.createdAt}</div>
                    </div>
                    <Badge className={`text-xs shrink-0 ${STATUS_STYLES[order.status as keyof typeof STATUS_STYLES]}`}>
                      {order.status === 'COMPLETED' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {order.status === 'PROCESSING' && <Clock className="w-3 h-3 mr-1" />}
                      {order.status === 'PENDING' && <AlertCircle className="w-3 h-3 mr-1" />}
                      {order.status}
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
