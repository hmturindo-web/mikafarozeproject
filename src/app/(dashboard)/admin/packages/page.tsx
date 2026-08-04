'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Package, Plus, Pencil, ToggleLeft, ToggleRight,
  ImageIcon, Video, FileVideo, ScrollText, CheckCircle
} from 'lucide-react';

// ──────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────
type ServiceType = 'IMAGE' | 'VIDEO' | 'SHORT_FILM' | 'COPY';
type Category = 'DIGITAL_MARKETING' | 'SHORT_FILM';

interface PackageMeta {
  imageLimit?: number;
  videoLimit?: number;
  videoDuration?: number;
  copyLimit?: number;
  shortFilmLimit?: number;
  resolution?: '720p' | '1080p' | '4K';
  includeWatermark?: boolean;
  prioritySupport?: boolean;
  customBranding?: boolean;
}

interface ServicePackage {
  id: string;
  name: string;
  description: string;
  serviceType: ServiceType;
  category: Category;
  price: number;
  isActive: boolean;
  sortOrder: number;
  metadata: PackageMeta;
}

// ──────────────────────────────────────────
// SEED DATA — Initial packages
// ──────────────────────────────────────────
const SEED_PACKAGES: ServicePackage[] = [
  // IMAGE
  {
    id: 'pkg-img-starter', name: 'IMAGE Starter', description: 'Paket dasar untuk social media graphics', serviceType: 'IMAGE', category: 'DIGITAL_MARKETING', price: 99000, isActive: true, sortOrder: 1, metadata: { imageLimit: 10, resolution: '720p', includeWatermark: true },
  },
  {
    id: 'pkg-img-pro', name: 'IMAGE Pro', description: 'Paket lengkap untuk content creator aktif', serviceType: 'IMAGE', category: 'DIGITAL_MARKETING', price: 199000, isActive: true, sortOrder: 2, metadata: { imageLimit: 50, resolution: '1080p', includeWatermark: false },
  },
  {
    id: 'pkg-img-enterprise', name: 'IMAGE Enterprise', description: 'Unlimited posts dengan 4K output', serviceType: 'IMAGE', category: 'DIGITAL_MARKETING', price: 499000, isActive: true, sortOrder: 3, metadata: { imageLimit: -1, resolution: '4K', includeWatermark: false, customBranding: true },
  },
  // VIDEO
  {
    id: 'pkg-vid-starter', name: 'VIDEO Starter', description: 'Short video untuk TikTok & Reels', serviceType: 'VIDEO', category: 'DIGITAL_MARKETING', price: 149000, isActive: true, sortOrder: 4, metadata: { videoLimit: 2, videoDuration: 30, resolution: '720p', includeWatermark: true },
  },
  {
    id: 'pkg-vid-pro', name: 'VIDEO Pro', description: 'Lebih banyak video dengan durasi lebih panjang', serviceType: 'VIDEO', category: 'DIGITAL_MARKETING', price: 349000, isActive: true, sortOrder: 5, metadata: { videoLimit: 10, videoDuration: 60, resolution: '1080p', includeWatermark: false },
  },
  {
    id: 'pkg-vid-enterprise', name: 'VIDEO Enterprise', description: 'Unlimited video 3 menit, 4K', serviceType: 'VIDEO', category: 'DIGITAL_MARKETING', price: 799000, isActive: true, sortOrder: 6, metadata: { videoLimit: -1, videoDuration: 180, resolution: '4K', includeWatermark: false, customBranding: true, prioritySupport: true },
  },
  // SHORT_FILM
  {
    id: 'pkg-film-starter', name: 'SHORT FILM Starter', description: 'Product Knowledge Video dasar', serviceType: 'SHORT_FILM', category: 'SHORT_FILM', price: 399000, isActive: true, sortOrder: 7, metadata: { shortFilmLimit: 1, resolution: '1080p', includeWatermark: true },
  },
  {
    id: 'pkg-film-pro', name: 'SHORT FILM Pro', description: 'Company Profile + Product Knowledge', serviceType: 'SHORT_FILM', category: 'SHORT_FILM', price: 899000, isActive: true, sortOrder: 8, metadata: { shortFilmLimit: 2, resolution: '4K', includeWatermark: false, prioritySupport: true },
  },
  {
    id: 'pkg-film-enterprise', name: 'SHORT FILM Enterprise', description: 'Unlimited short film dengan custom branding', serviceType: 'SHORT_FILM', category: 'SHORT_FILM', price: 1999000, isActive: true, sortOrder: 9, metadata: { shortFilmLimit: -1, resolution: '4K', includeWatermark: false, customBranding: true, prioritySupport: true },
  },
  // COPY
  {
    id: 'pkg-copy-starter', name: 'COPY Starter', description: 'Caption & headline untuk sosial media', serviceType: 'COPY', category: 'DIGITAL_MARKETING', price: 49000, isActive: true, sortOrder: 10, metadata: { copyLimit: 10 },
  },
  {
    id: 'pkg-copy-pro', name: 'COPY Pro', description: 'Lebih banyak copy untuk lebih banyak platform', serviceType: 'COPY', category: 'DIGITAL_MARKETING', price: 149000, isActive: true, sortOrder: 11, metadata: { copyLimit: 50, prioritySupport: true },
  },
  {
    id: 'pkg-copy-enterprise', name: 'COPY Enterprise', description: 'Unlimited copywriting untuk tim marketing', serviceType: 'COPY', category: 'DIGITAL_MARKETING', price: 299000, isActive: true, sortOrder: 12, metadata: { copyLimit: -1, prioritySupport: true, customBranding: true },
  },
];

const SERVICE_CONFIG: Record<ServiceType, { label: string; icon: typeof ImageIcon; color: string }> = {
  IMAGE: { label: 'IMAGE', icon: ImageIcon, color: 'text-pink-500 bg-pink-500/10' },
  VIDEO: { label: 'VIDEO', icon: Video, color: 'text-violet-500 bg-violet-500/10' },
  SHORT_FILM: { label: 'SHORT FILM', icon: FileVideo, color: 'text-blue-500 bg-blue-500/10' },
  COPY: { label: 'COPYWRITING', icon: ScrollText, color: 'text-emerald-500 bg-emerald-500/10' },
};

const ALL_SERVICE_TYPES: ServiceType[] = ['IMAGE', 'VIDEO', 'SHORT_FILM', 'COPY'];

// ──────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────
function fmtPrice(price: number) {
  if (price === 0) return 'Free';
  if (price < 0) return 'Unlimited';
  return `Rp ${price.toLocaleString('id-ID')}`;
}

function fmtLimit(val?: number) {
  if (val === undefined || val === null) return '—';
  if (val === -1) return '∞ Unlimited';
  return String(val);
}

function PackageRow({
  pkg, onEdit, onToggle,
}: {
  pkg: ServicePackage;
  onEdit: () => void;
  onToggle: () => void;
}) {
  const cfg = SERVICE_CONFIG[pkg.serviceType];
  const Icon = cfg.icon;

  return (
    <TableRow className={pkg.isActive ? '' : 'opacity-50'}>
      <TableCell>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.color}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-sm">{pkg.name}</div>
            <div className="text-xs text-muted-foreground">{pkg.description}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs">{pkg.serviceType}</Badge>
      </TableCell>
      <TableCell className="text-sm font-semibold">{fmtPrice(pkg.price)}</TableCell>
      <TableCell>
        <div className="text-sm space-y-0.5">
          {pkg.serviceType === 'IMAGE' && (
            <>
              <div className="flex gap-2"><span className="text-muted-foreground">Limit:</span> <span>{fmtLimit(pkg.metadata.imageLimit)}/bln</span></div>
              <div className="flex gap-2"><span className="text-muted-foreground">Res:</span> <span>{pkg.metadata.resolution}</span></div>
            </>
          )}
          {pkg.serviceType === 'VIDEO' && (
            <>
              <div className="flex gap-2"><span className="text-muted-foreground">Limit:</span> <span>{fmtLimit(pkg.metadata.videoLimit)}/bln</span></div>
              <div className="flex gap-2"><span className="text-muted-foreground">Durasi:</span> <span>{pkg.metadata.videoDuration}s</span></div>
              <div className="flex gap-2"><span className="text-muted-foreground">Res:</span> <span>{pkg.metadata.resolution}</span></div>
            </>
          )}
          {pkg.serviceType === 'SHORT_FILM' && (
            <>
              <div className="flex gap-2"><span className="text-muted-foreground">Limit:</span> <span>{fmtLimit(pkg.metadata.shortFilmLimit)}/bln</span></div>
              <div className="flex gap-2"><span className="text-muted-foreground">Res:</span> <span>{pkg.metadata.resolution}</span></div>
            </>
          )}
          {pkg.serviceType === 'COPY' && (
            <div className="flex gap-2"><span className="text-muted-foreground">Limit:</span> <span>{fmtLimit(pkg.metadata.copyLimit)}/bln</span></div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex gap-1 flex-wrap">
          {!pkg.metadata.includeWatermark && <Badge className="text-xs bg-emerald-100 text-emerald-700">No Watermark</Badge>}
          {pkg.metadata.prioritySupport && <Badge className="text-xs bg-blue-100 text-blue-700">Priority</Badge>}
          {pkg.metadata.customBranding && <Badge className="text-xs bg-violet-100 text-violet-700">Custom Brand</Badge>}
        </div>
      </TableCell>
      <TableCell>
        <Badge className={`text-xs ${pkg.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
          {pkg.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggle}>
            {pkg.isActive
              ? <ToggleRight className="w-5 h-5 text-emerald-500" />
              : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ──────────────────────────────────────────
// EDIT FORM DIALOG
// ──────────────────────────────────────────
function PackageEditDialog({
  pkg, open, onClose, onSave,
}: {
  pkg: ServicePackage | null;
  open: boolean;
  onClose: () => void;
  onSave: (pkg: ServicePackage) => void;
}) {
  const [form, setForm] = useState<ServicePackage>(pkg!);

  // Sync when pkg changes
  if (pkg && form.id !== pkg.id) setForm(pkg);

  if (!pkg) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Paket Layanan</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Basic */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nama Paket</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Service Type</Label>
              <Input value={form.serviceType} disabled className="bg-muted" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Harga (IDR)</Label>
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label>Sort Order</Label>
              <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
            </div>
          </div>

          <div className="border-t pt-4">
            <Label className="mb-3 block">Metadata Paket</Label>
            <div className="grid grid-cols-2 gap-4">
              {form.serviceType === 'IMAGE' && <>
                <div className="space-y-1.5"><Label>Image Limit/bulan (-1=unlimited)</Label><Input type="number" value={form.metadata.imageLimit ?? 0} onChange={(e) => setForm({ ...form, metadata: { ...form.metadata, imageLimit: Number(e.target.value) } })} /></div>
                <div className="space-y-1.5"><Label>Resolution</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.metadata.resolution} onChange={(e) => setForm({ ...form, metadata: { ...form.metadata, resolution: e.target.value as '720p' | '1080p' | '4K' } })}>
                    <option value="720p">720p</option><option value="1080p">1080p</option><option value="4K">4K</option>
                  </select>
                </div>
              </>}
              {form.serviceType === 'VIDEO' && <>
                <div className="space-y-1.5"><Label>Video Limit/bulan (-1=unlimited)</Label><Input type="number" value={form.metadata.videoLimit ?? 0} onChange={(e) => setForm({ ...form, metadata: { ...form.metadata, videoLimit: Number(e.target.value) } })} /></div>
                <div className="space-y-1.5"><Label>Max Duration (detik)</Label><Input type="number" value={form.metadata.videoDuration ?? 30} onChange={(e) => setForm({ ...form, metadata: { ...form.metadata, videoDuration: Number(e.target.value) } })} /></div>
                <div className="space-y-1.5"><Label>Resolution</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.metadata.resolution} onChange={(e) => setForm({ ...form, metadata: { ...form.metadata, resolution: e.target.value as '720p' | '1080p' | '4K' } })}>
                    <option value="720p">720p</option><option value="1080p">1080p</option><option value="4K">4K</option>
                  </select>
                </div>
              </>}
              {form.serviceType === 'SHORT_FILM' && <>
                <div className="space-y-1.5"><Label>Short Film Limit/bulan (-1=unlimited)</Label><Input type="number" value={form.metadata.shortFilmLimit ?? 0} onChange={(e) => setForm({ ...form, metadata: { ...form.metadata, shortFilmLimit: Number(e.target.value) } })} /></div>
                <div className="space-y-1.5"><Label>Resolution</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.metadata.resolution} onChange={(e) => setForm({ ...form, metadata: { ...form.metadata, resolution: e.target.value as '720p' | '1080p' | '4K' } })}>
                    <option value="720p">720p</option><option value="1080p">1080p</option><option value="4K">4K</option>
                  </select>
                </div>
              </>}
              {form.serviceType === 'COPY' && <>
                <div className="space-y-1.5"><Label>Copy Limit/bulan (-1=unlimited)</Label><Input type="number" value={form.metadata.copyLimit ?? 0} onChange={(e) => setForm({ ...form, metadata: { ...form.metadata, copyLimit: Number(e.target.value) } })} /></div>
              </>}

              <div className="space-y-2 pt-4">
                <Label className="text-sm font-medium">Flags</Label>
                <div className="space-y-2">
                  {[
                    { key: 'includeWatermark', label: 'Include Watermark' },
                    { key: 'prioritySupport', label: 'Priority Support' },
                    { key: 'customBranding', label: 'Custom Branding' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(form.metadata[key as keyof PackageMeta])}
                        onChange={(e) => setForm({ ...form, metadata: { ...form.metadata, [key]: e.target.checked } })}
                        className="rounded border-muted-foreground"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={() => { onSave(form); onClose(); }} className="bg-gradient-to-r from-violet-600 to-blue-600 hover:opacity-90">
            <CheckCircle className="w-4 h-4 mr-2" /> Simpan Perubahan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ──────────────────────────────────────────
// MAIN PAGE
// ──────────────────────────────────────────
export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<ServicePackage[]>(SEED_PACKAGES);
  const [editPkg, setEditPkg] = useState<ServicePackage | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const activeCount = packages.filter((p) => p.isActive).length;

  function handleSave(updated: ServicePackage) {
    setPackages((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  function handleToggle(pkg: ServicePackage) {
    setPackages((prev) =>
      prev.map((p) => (p.id === pkg.id ? { ...p, isActive: !p.isActive } : p))
    );
  }

  function openEdit(pkg: ServicePackage) {
    setEditPkg(pkg);
    setDialogOpen(true);
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Service Packages</h1>
          <p className="text-muted-foreground mt-1">
            Kelola paket layanan AI — {activeCount} aktif dari {packages.length} total.
          </p>
        </div>
        <Button className="bg-gradient-to-r from-violet-600 to-blue-600 hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" /> Tambah Paket
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ALL_SERVICE_TYPES.map((type) => {
          const cfg = SERVICE_CONFIG[type];
          const Icon = cfg.icon;
          const count = packages.filter((p) => p.serviceType === type && p.isActive).length;
          return (
            <Card key={type}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{cfg.label}</div>
                  <div className="text-xl font-bold">{count} <span className="text-sm font-normal text-muted-foreground">paket</span></div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Packages by Service Type */}
      <Tabs defaultValue="IMAGE" className="space-y-5">
        <TabsList className="grid w-full grid-cols-4">
          {ALL_SERVICE_TYPES.map((type) => {
            const cfg = SERVICE_CONFIG[type];
            const Icon = cfg.icon;
            const count = packages.filter((p) => p.serviceType === type).length;
            return (
              <TabsTrigger key={type} value={type} className="gap-2">
                <Icon className="w-4 h-4" /> {cfg.label} <Badge variant="secondary" className="ml-1 text-xs">{count}</Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {ALL_SERVICE_TYPES.map((type) => {
          const typePkgs = packages.filter((p) => p.serviceType === type);
          const totalRevenue = typePkgs.reduce((s, p) => s + p.price, 0);
          return (
            <TabsContent key={type} value={type} className="space-y-4">
              {/* Summary row */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Total Paket:</span>
                  <span className="font-semibold">{typePkgs.length}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Aktif:</span>
                  <span className="font-semibold text-emerald-600">{typePkgs.filter((p) => p.isActive).length}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Revenue est./paket:</span>
                  <span className="font-semibold">Rp {totalRevenue.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Table */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Paket</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Harga</TableHead>
                        <TableHead>Specifications</TableHead>
                        <TableHead>Flags</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-28">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {typePkgs
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((pkg) => (
                          <PackageRow
                            key={pkg.id}
                            pkg={pkg}
                            onEdit={() => openEdit(pkg)}
                            onToggle={() => handleToggle(pkg)}
                          />
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Edit Dialog */}
      <PackageEditDialog
        pkg={editPkg}
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditPkg(null); }}
        onSave={handleSave}
      />
    </div>
  );
}
