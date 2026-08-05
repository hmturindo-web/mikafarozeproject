// ============================================
// MIKAFAROZE — Core TypeScript Types
// ============================================

// ---- Enums ----
export type ServiceType = 'IMAGE' | 'VIDEO' | 'SHORT_FILM' | 'COPY';
export type ServiceCategory = 'DIGITAL_MARKETING' | 'SHORT_FILM';
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type SubscriptionTier = 'STARTER' | 'PRO' | 'ENTERPRISE';
export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'TRIALING';
export type UserRole = 'USER' | 'ADMIN';

// ---- Service Package (Admin-managed) ----
export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  serviceType: ServiceType;
  category: ServiceCategory;
  price: number; // in IDR
  priceId?: string; // Stripe Price ID
  isActive: boolean;
  sortOrder: number;
  metadata: PackageMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface PackageMetadata {
  imageLimit?: number;       // per month
  videoLimit?: number;       // per month
  videoDuration?: number;     // seconds
  copyLimit?: number;        // per month
  shortFilmLimit?: number;    // per month or 'unlimited'
  resolution?: '720p' | '1080p' | '4K';
  includeWatermark?: boolean;
  prioritySupport?: boolean;
  customBranding?: boolean;
  outputFormats?: string[];   // ['instagram', 'tiktok', 'youtube']
}

// ---- Subscription ----
export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ---- Usage Tracking ----
export interface UsageRecord {
  id: string;
  userId: string;
  serviceType: ServiceType;
  count: number;
  month: string; // YYYY-MM
  createdAt: Date;
}

// ---- Order ----
export interface Order {
  id: string;
  userId: string;
  packageId: string;
  serviceType: ServiceType;
  status: OrderStatus;
  brief: OrderBrief;
  resultUrl?: string;         // Cloudinary URL
  resultPublicId?: string;   // Cloudinary public ID
  generationJobId?: string;  // Fal.ai job ID
  errorMessage?: string;
  creditsUsed: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderBrief {
  // Common
  brandName: string;
  industry: string;
  tone: 'professional' | 'friendly' | 'playful' | 'luxury' | 'casual';
  targetAudience: string;

  // IMAGE-specific
  imageStyle?: string;        // 'minimalist', 'bold', 'elegant', 'playful'
  imageCount?: number;
  colorPreference?: string[];
  imagePlatform?: ('instagram' | 'tiktok' | 'facebook' | 'twitter')[];

  // VIDEO-specific
  videoDuration?: number;     // seconds
  videoFormat?: 'vertical' | 'horizontal' | 'square';
  videoAspect?: '9:16' | '16:9' | '1:1';
  script?: string;

  // SHORT_FILM-specific
  filmType?: 'company_profile' | 'product_knowledge';
  filmDuration?: number;      // seconds
  keyMessages?: string[];
  includeVoiceover?: boolean;

  // COPY-specific
  copyType?: 'caption' | 'headline' | 'product_desc' | 'social_post';
  copyCount?: number;
  platform?: 'instagram' | 'tiktok' | 'youtube' | 'linkedin';
}

// ---- User ----
export interface User {
  id: string;
  // clerkId removed — Clerk no longer used
  email: string;
  name: string;
  phone?: string;
  companyName?: string;
  role: UserRole;
  subscription?: Subscription;
  createdAt: Date;
  updatedAt: Date;
}

// ---- Admin Dashboard ----
export interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalOrders: number;
  ordersThisMonth: number;
  revenueThisMonth: number;
  revenueByTier: Record<SubscriptionTier, number>;
  topServices: { serviceType: ServiceType; count: number }[];
}

// ---- API Response Types ----
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
