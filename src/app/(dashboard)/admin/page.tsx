'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users, CreditCard, ShoppingCart, TrendingUp,
  ImageIcon, Video, FileVideo, ScrollText, ArrowUpRight,
  ArrowDownRight, DollarSign
} from 'lucide-react';

const STATS = [
  {
    title: 'Total Users',
    value: '2,547',
    change: '+12%',
    up: true,
    icon: Users,
    color: 'text-blue-600 bg-blue-500/10',
  },
  {
    title: 'Active Subscriptions',
    value: '1,832',
    change: '+8%',
    up: true,
    icon: CreditCard,
    color: 'text-emerald-600 bg-emerald-500/10',
  },
  {
    title: 'Orders This Month',
    value: '4,219',
    change: '+23%',
    up: true,
    icon: ShoppingCart,
    color: 'text-violet-600 bg-violet-500/10',
  },
  {
    title: 'Revenue This Month',
    value: 'Rp 847jt',
    change: '+18%',
    up: true,
    icon: DollarSign,
    color: 'text-amber-600 bg-amber-500/10',
  },
];

const SERVICE_STATS = [
  { label: 'IMAGE', icon: ImageIcon, count: 1840, color: 'bg-pink-500', width: 80 },
  { label: 'VIDEO', icon: Video, count: 932, color: 'bg-violet-500', width: 55 },
  { label: 'SHORT FILM', icon: FileVideo, count: 340, color: 'bg-blue-500', width: 28 },
  { label: 'COPY', icon: ScrollText, count: 1107, color: 'bg-emerald-500', width: 65 },
];

const TOP_PACKAGES = [
  { name: 'IMAGE Pro', service: 'IMAGE', count: 842 },
  { name: 'VIDEO Pro', service: 'VIDEO', count: 621 },
  { name: 'COPY Pro', service: 'COPY', count: 580 },
  { name: 'Short Film Pro', service: 'SHORT_FILM', count: 214 },
];

const MOCK_RECENT_ORDERS = [
  { id: 'ORD-001', user: 'Rina Boutique', service: 'IMAGE', status: 'COMPLETED', createdAt: '5 menit lalu', amount: 199000 },
  { id: 'ORD-002', user: 'Kopi Nusantara', service: 'VIDEO', status: 'PROCESSING', createdAt: '12 menit lalu', amount: 349000 },
  { id: 'ORD-003', user: 'EduSpace Indonesia', service: 'COPY', status: 'COMPLETED', createdAt: '28 menit lalu', amount: 149000 },
  { id: 'ORD-004', user: 'PT Sehat Sentosa', service: 'SHORT_FILM', status: 'PENDING', createdAt: '1 jam lalu', amount: 899000 },
];

const STATUS_COLORS = {
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30',
  PROCESSING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30',
  COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30',
  FAILED: 'bg-red-100 text-red-700 dark:bg-red-900/30',
};

export default function AdminDashboardPage() {
  const totalOrders = SERVICE_STATS.reduce((s, x) => s + x.count, 0);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview seluruh platform MIKAFAROZE.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {STATS.map(({ title, value, change, up, icon: Icon, color }) => (
          <Card key={title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${up ? 'text-emerald-600' : 'text-red-600'}`}>
                  {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {change}
                </div>
              </div>
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{title}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Service Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {SERVICE_STATS.map(({ label, icon: Icon, count, color, width }) => {
              const pct = Math.round((count / totalOrders) * 100);
              return (
                <div key={label} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium flex items-center gap-2">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    {label}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Progress value={pct} className="h-2.5 flex-1" />
                      <span className="text-sm font-semibold w-12 text-right">{count.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground w-10">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full mt-1.5 overflow-hidden">
                      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${width}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Top Packages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Top Packages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {TOP_PACKAGES.map(({ name, service, count }, i) => (
              <div key={name} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{name}</div>
                  <Badge variant="outline" className="text-[10px] mt-0.5">{service}</Badge>
                </div>
                <div className="text-sm font-semibold">{count.toLocaleString()}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Recent Orders</CardTitle>
            <Badge className="bg-emerald-100 text-emerald-700">+42 today</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">User</th>
                  <th className="pb-3 font-medium">Service</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {MOCK_RECENT_ORDERS.map((o) => (
                  <tr key={o.id} className="py-3">
                    <td className="py-3 font-mono text-xs">{o.id}</td>
                    <td className="py-3 font-medium">{o.user}</td>
                    <td className="py-3"><Badge variant="outline" className="text-xs">{o.service}</Badge></td>
                    <td className="py-3"><Badge className={`text-xs ${STATUS_COLORS[o.status as keyof typeof STATUS_COLORS]}`}>{o.status}</Badge></td>
                    <td className="py-3 font-semibold">Rp {o.amount.toLocaleString('id-ID')}</td>
                    <td className="py-3 text-muted-foreground">{o.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
