// ============================================
// MIKAFAROZE — Supabase / Drizzle ORM Schema
// ============================================

import { pgTable, text, timestamp, boolean, integer, decimal, jsonb, serial, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ---- Enums ----
export const serviceTypeEnum = pgEnum('service_type', ['IMAGE', 'VIDEO', 'SHORT_FILM', 'COPY']);
export const serviceCategoryEnum = pgEnum('service_category', ['DIGITAL_MARKETING', 'SHORT_FILM']);
export const orderStatusEnum = pgEnum('order_status', ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED']);
export const subscriptionTierEnum = pgEnum('subscription_tier', ['STARTER', 'PRO', 'ENTERPRISE']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['ACTIVE', 'PAST_DUE', 'CANCELLED', 'TRIALING']);
export const userRoleEnum = pgEnum('user_role', ['USER', 'ADMIN']);

// ---- Users ----
export const users = pgTable('users', {
  id: text('id').primaryKey(), // clerkId
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  phone: text('phone'),
  companyName: text('company_name'),
  role: userRoleEnum('role').default('USER').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ---- Subscriptions ----
export const subscriptions = pgTable('subscriptions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tier: subscriptionTierEnum('tier').notNull(),
  status: subscriptionStatusEnum('status').notNull().default('TRIALING'),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  currentPeriodStart: timestamp('current_period_start').notNull(),
  currentPeriodEnd: timestamp('current_period_end').notNull(),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ---- Service Packages (Admin-managed) ----
export const servicePackages = pgTable('service_packages', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  serviceType: serviceTypeEnum('service_type').notNull(),
  category: serviceCategoryEnum('category').notNull(),
  price: integer('price').notNull(), // IDR
  priceId: text('price_id'), // Stripe Price ID
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  metadata: jsonb('metadata').$type<{
    imageLimit?: number;
    videoLimit?: number;
    videoDuration?: number;
    copyLimit?: number;
    shortFilmLimit?: number;
    resolution?: '720p' | '1080p' | '4K';
    includeWatermark?: boolean;
    prioritySupport?: boolean;
    customBranding?: boolean;
    outputFormats?: string[];
  }>().default({}).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ---- Orders ----
export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  packageId: text('package_id').references(() => servicePackages.id),
  serviceType: serviceTypeEnum('service_type').notNull(),
  status: orderStatusEnum('status').default('PENDING').notNull(),
  brief: jsonb('brief').$type<Record<string, unknown>>().notNull(),
  resultUrl: text('result_url'),
  resultPublicId: text('result_public_id'),
  generationJobId: text('generation_job_id'),
  errorMessage: text('error_message'),
  creditsUsed: integer('credits_used').default(0).notNull(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ---- Usage Records ----
export const usageRecords = pgTable('usage_records', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  serviceType: serviceTypeEnum('service_type').notNull(),
  count: integer('count').default(0).notNull(),
  month: text('month').notNull(), // YYYY-MM
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ---- Relations ----
export const usersRelations = relations(users, ({ many, one }) => ({
  orders: many(orders),
  subscription: one(subscriptions, { fields: [users.id], references: [subscriptions.userId] }),
  usageRecords: many(usageRecords),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, { fields: [subscriptions.userId], references: [users.id] }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  package: one(servicePackages, { fields: [orders.packageId], references: [servicePackages.id] }),
}));
