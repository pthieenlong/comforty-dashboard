import { USERS } from '@/features/iam/iam.mock';
import { ORDERS, REFUNDS } from '@/features/order/order.mock';
import { CAMPAIGNS, PROMOTIONS, VOUCHER_BATCHES } from '@/features/marketing/marketing.mock';
import { PRODUCTS } from '@/features/product/product.mock';
import { BRANDS } from '@/features/product/brand.mock';
import { CATEGORIES } from '@/features/product/category.mock';
import { TRANSFERS, STOCK_TAKES } from '@/features/inventory/inventory.mock';
import { REVIEWS } from '@/features/customer/review.mock';
import { TICKETS } from '@/features/customer/ticket.mock';
import { INQUIRIES } from '@/features/customer/inquiry.mock';
import { LEAVE_REQUESTS } from '@/features/hr/leave-request.mock';
import { INCIDENTS } from '@/features/hr/incident.mock';
import { normalizeTenantId } from '@/core/tenant/tenant-normalize';
import type { AuditAction, AuditEntityType, IAuditChange, IAuditEntry } from './audit.types';

const COMMON_UA = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/537.36 Chrome/124',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Edg/121',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5) AppleWebKit/605.1.15 Mobile Safari',
  null,
];

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

function pickFrom<T>(arr: readonly T[], seed: string): T {
  return arr[Math.floor(hash(seed) * arr.length) % arr.length];
}

function ipFor(seed: string): string {
  const a = Math.floor(hash(`${seed}|a`) * 200) + 10;
  const b = Math.floor(hash(`${seed}|b`) * 250) + 1;
  return `10.${a}.${b}.${Math.floor(hash(`${seed}|c`) * 250) + 1}`;
}

let sequence = 0;
function nextCode(): string {
  sequence += 1;
  return `AUD-2026-${String(sequence).padStart(6, '0')}`;
}

interface BuildArgs {
  occurredAt: string;
  actorId: string;
  tenantId: string | null;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  entityLabel: string;
  changes?: IAuditChange[];
  metadata?: Record<string, string | number | boolean | null>;
}

function build(args: BuildArgs): IAuditEntry {
  const actor = USERS.find((u) => u.id === args.actorId);
  const seed = `${args.action}|${args.entityId}|${args.occurredAt}`;
  return {
    id: `aud-${sequence + 1}-${args.entityId}`,
    code: nextCode(),
    occurredAt: args.occurredAt,
    actorId: args.actorId,
    actorLabel: actor?.fullName ?? args.actorId,
    actorRole: actor?.assignments[0]?.roleIds[0] ?? 'role-staff',
    tenantId: args.tenantId ? normalizeTenantId(args.tenantId) : null,
    action: args.action,
    entityType: args.entityType,
    entityId: args.entityId,
    entityLabel: args.entityLabel,
    requestId: `req-${seed.slice(0, 8)}-${Math.floor(hash(seed) * 9999)}`,
    ipAddress: ipFor(seed),
    userAgent: pickFrom(COMMON_UA, seed),
    changes: args.changes ?? [],
    metadata: args.metadata ?? {},
  };
}

function randomActor(seed: string): string {
  // Skew toward admin / manager IDs for system-wide actions; otherwise random.
  return pickFrom(USERS, seed).id;
}

// =========================================================================
// Generators per source store
// =========================================================================

function fromOrders(): IAuditEntry[] {
  const out: IAuditEntry[] = [];
  for (const o of ORDERS) {
    // Create event
    out.push(
      build({
        occurredAt: o.placedAt,
        actorId: randomActor(`order-create|${o.id}`),
        tenantId: o.tenantId,
        action: 'order.create',
        entityType: 'order',
        entityId: o.id,
        entityLabel: o.code,
        metadata: { channel: o.channel, total: o.total },
      }),
    );
    // Transition events
    for (let i = 1; i < o.events.length; i++) {
      const prev = o.events[i - 1];
      const curr = o.events[i];
      const cancelled = curr.status === 'cancelled';
      out.push(
        build({
          occurredAt: curr.occurredAt,
          actorId: randomActor(`order-trans|${o.id}|${i}`),
          tenantId: o.tenantId,
          action: cancelled ? 'order.cancel' : 'order.transition',
          entityType: 'order',
          entityId: o.id,
          entityLabel: o.code,
          changes: [{ field: 'status', before: prev.status, after: curr.status }],
          metadata: { note: curr.note },
        }),
      );
    }
  }
  return out;
}

function fromRefunds(): IAuditEntry[] {
  return REFUNDS.map((r) => {
    const order = ORDERS.find((o) => o.id === r.orderId);
    return build({
      occurredAt: r.processedAt,
      actorId: randomActor(`refund|${r.id}`),
      tenantId: order?.tenantId ?? null,
      action: 'refund.create',
      entityType: 'refund',
      entityId: r.id,
      entityLabel: r.code,
      changes: [{ field: 'amount', before: 0, after: r.amount, display: 'Hoàn tiền' }],
      metadata: { orderId: r.orderId, orderCode: r.orderCode, reason: r.reason },
    });
  });
}

function fromCampaigns(): IAuditEntry[] {
  return CAMPAIGNS.map((c) =>
    build({
      occurredAt: c.createdAt,
      actorId: c.createdBy,
      tenantId: null,
      action: 'campaign.create',
      entityType: 'campaign',
      entityId: c.id,
      entityLabel: c.name,
      changes: [
        { field: 'status', before: null, after: c.status },
        { field: 'startAt', before: null, after: c.startAt },
        { field: 'endAt', before: null, after: c.endAt },
      ],
      metadata: { channels: c.channels.join(', ') },
    }),
  );
}

function fromPromotions(): IAuditEntry[] {
  return PROMOTIONS.map((p) =>
    build({
      occurredAt: p.createdAt,
      actorId: randomActor(`promotion|${p.id}`),
      tenantId: null,
      action: 'promotion.create',
      entityType: 'promotion',
      entityId: p.id,
      entityLabel: p.name,
      metadata: { rule: p.rule.type, status: p.status },
    }),
  );
}

function fromVoucherBatches(): IAuditEntry[] {
  return VOUCHER_BATCHES.map((v) =>
    build({
      occurredAt: v.createdAt,
      actorId: v.createdBy,
      tenantId: null,
      action: 'voucher.batch.create',
      entityType: 'voucher_batch',
      entityId: v.id,
      entityLabel: v.name,
      changes: [{ field: 'totalCodes', before: 0, after: v.totalCodes }],
      metadata: { voucherType: v.voucherType, code: v.code },
    }),
  );
}

function fromCatalog(): IAuditEntry[] {
  const out: IAuditEntry[] = [];
  // Sample 20 product create + 10 product update events (deterministic).
  PRODUCTS.slice(0, 20).forEach((p, idx) => {
    out.push(
      build({
        occurredAt: p.createdAt,
        actorId: randomActor(`product-create|${p.id}`),
        tenantId: null,
        action: 'product.create',
        entityType: 'product',
        entityId: p.id,
        entityLabel: p.name,
        metadata: { sku: p.sku, brand: p.brandId },
      }),
    );
    if (idx % 2 === 0) {
      const updatedAt = new Date(new Date(p.createdAt).getTime() + 86400000 * 3).toISOString();
      out.push(
        build({
          occurredAt: updatedAt,
          actorId: randomActor(`product-update|${p.id}`),
          tenantId: null,
          action: 'product.update',
          entityType: 'product',
          entityId: p.id,
          entityLabel: p.name,
          changes: [
            { field: 'status', before: 'draft', after: p.status },
            { field: 'basePrice', before: p.basePrice - 50000, after: p.basePrice },
          ],
        }),
      );
    }
  });
  BRANDS.forEach((b) =>
    out.push(
      build({
        occurredAt: b.createdAt,
        actorId: randomActor(`brand|${b.id}`),
        tenantId: null,
        action: 'brand.create',
        entityType: 'brand',
        entityId: b.id,
        entityLabel: b.name,
      }),
    ),
  );
  // Sample first 15 categories. ICategory has no createdAt — derive from BRANDS[0] timestamp + offset.
  const categoryBaseTime = new Date(BRANDS[0].createdAt).getTime();
  CATEGORIES.slice(0, 15).forEach((c, idx) =>
    out.push(
      build({
        occurredAt: new Date(categoryBaseTime + idx * 86400000).toISOString(),
        actorId: randomActor(`category|${c.id}`),
        tenantId: null,
        action: 'category.create',
        entityType: 'category',
        entityId: c.id,
        entityLabel: c.name,
        metadata: { code: c.code, parentId: c.parentId },
      }),
    ),
  );
  return out;
}

function fromInventory(): IAuditEntry[] {
  const out: IAuditEntry[] = [];
  for (const t of TRANSFERS) {
    out.push(
      build({
        occurredAt: t.createdAt,
        actorId: t.createdBy,
        tenantId: t.fromWarehouseId,
        action: 'inventory.transfer.create',
        entityType: 'inventory_transfer',
        entityId: t.id,
        entityLabel: t.code,
        metadata: { from: t.fromWarehouseId, to: t.toWarehouseId, lineCount: t.lines.length },
      }),
    );
    for (let i = 1; i < t.events.length; i++) {
      const prev = t.events[i - 1];
      const curr = t.events[i];
      out.push(
        build({
          occurredAt: curr.occurredAt,
          actorId: t.createdBy,
          tenantId: t.fromWarehouseId,
          action: 'inventory.transfer.transition',
          entityType: 'inventory_transfer',
          entityId: t.id,
          entityLabel: t.code,
          changes: [{ field: 'status', before: prev.status, after: curr.status }],
          metadata: { actorLabel: curr.actor, note: curr.note },
        }),
      );
    }
  }
  for (const s of STOCK_TAKES) {
    out.push(
      build({
        occurredAt: s.createdAt,
        actorId: s.createdBy,
        tenantId: s.warehouseId,
        action: 'inventory.stock_take.create',
        entityType: 'stock_take',
        entityId: s.id,
        entityLabel: s.code,
        metadata: { warehouse: s.warehouseId, scope: s.scope },
      }),
    );
    if (s.status === 'completed' && s.completedAt) {
      out.push(
        build({
          occurredAt: s.completedAt,
          actorId: s.createdBy,
          tenantId: s.warehouseId,
          action: 'inventory.stock_take.complete',
          entityType: 'stock_take',
          entityId: s.id,
          entityLabel: s.code,
          metadata: { lines: s.lines.length },
        }),
      );
    }
  }
  return out;
}

function fromCrm(): IAuditEntry[] {
  const out: IAuditEntry[] = [];
  for (const r of REVIEWS) {
    if (r.status === 'pending') continue;
    out.push(
      build({
        occurredAt: r.moderatedAt ?? r.submittedAt,
        actorId: r.moderatedBy ?? randomActor(`review|${r.id}`),
        tenantId: null,
        action: 'review.moderate',
        entityType: 'review',
        entityId: r.id,
        entityLabel: r.title || `Review ${r.id}`,
        changes: [{ field: 'status', before: 'pending', after: r.status }],
        metadata: { rating: r.rating, productId: r.productId },
      }),
    );
  }
  for (const t of TICKETS) {
    for (let i = 1; i < t.events.length; i++) {
      const prev = t.events[i - 1];
      const curr = t.events[i];
      out.push(
        build({
          occurredAt: curr.occurredAt,
          actorId: randomActor(`ticket|${t.id}|${i}`),
          tenantId: t.tenantId,
          action: 'ticket.transition',
          entityType: 'ticket',
          entityId: t.id,
          entityLabel: t.code,
          changes: [{ field: 'action', before: prev.action, after: curr.action }],
          metadata: { actorLabel: curr.actor, details: curr.details },
        }),
      );
    }
  }
  for (const q of INQUIRIES) {
    for (const reply of q.replies) {
      if (reply.channel === 'note') continue;
      out.push(
        build({
          occurredAt: reply.occurredAt,
          actorId: reply.authorId,
          tenantId: null,
          action: 'inquiry.reply',
          entityType: 'inquiry',
          entityId: q.id,
          entityLabel: q.subject,
          metadata: { channel: reply.channel },
        }),
      );
    }
  }
  return out;
}

function fromIam(): IAuditEntry[] {
  const out: IAuditEntry[] = [];
  for (const u of USERS) {
    out.push(
      build({
        occurredAt: u.createdAt,
        actorId: USERS[0].id,
        tenantId: u.assignments[0]?.tenantId ?? null,
        action: 'user.create',
        entityType: 'user',
        entityId: u.id,
        entityLabel: u.fullName,
        metadata: { email: u.email },
      }),
    );
    // Role assignment events 1 day after user creation.
    const assignTime = new Date(new Date(u.createdAt).getTime() + 86400000).toISOString();
    for (const a of u.assignments) {
      out.push(
        build({
          occurredAt: assignTime,
          actorId: USERS[0].id,
          tenantId: a.tenantId,
          action: 'role.assign',
          entityType: 'role',
          entityId: a.roleIds[0] ?? 'role-staff',
          entityLabel: a.roleIds[0] ?? 'role-staff',
          changes: [{ field: 'userId', before: null, after: u.id }],
          metadata: { userLabel: u.fullName, tenantId: a.tenantId },
        }),
      );
    }
  }
  return out;
}

function fromHr(): IAuditEntry[] {
  const out: IAuditEntry[] = [];
  for (const l of LEAVE_REQUESTS) {
    out.push(
      build({
        occurredAt: l.requestedAt,
        actorId: l.userId,
        tenantId: l.tenantId,
        action: 'leave.submit',
        entityType: 'leave_request',
        entityId: l.id,
        entityLabel: l.code,
        metadata: { type: l.type, days: 1 },
      }),
    );
    if (l.decidedAt && l.decidedBy) {
      out.push(
        build({
          occurredAt: l.decidedAt,
          actorId: l.decidedBy,
          tenantId: l.tenantId,
          action: 'leave.decide',
          entityType: 'leave_request',
          entityId: l.id,
          entityLabel: l.code,
          changes: [{ field: 'status', before: 'pending', after: l.status }],
        }),
      );
    }
  }
  for (const i of INCIDENTS) {
    for (const e of i.events) {
      if (e.kind === 'created') {
        out.push(
          build({
            occurredAt: e.occurredAt,
            actorId: e.actorId,
            tenantId: i.tenantId,
            action: 'incident.create',
            entityType: 'incident',
            entityId: i.id,
            entityLabel: i.code,
            metadata: { type: i.type, severity: i.severity },
          }),
        );
      } else if (e.kind === 'escalated') {
        out.push(
          build({
            occurredAt: e.occurredAt,
            actorId: e.actorId,
            tenantId: i.tenantId,
            action: 'incident.escalate',
            entityType: 'incident',
            entityId: i.id,
            entityLabel: i.code,
            metadata: { note: e.note ?? null },
          }),
        );
      } else if (
        e.kind === 'acknowledged' ||
        e.kind === 'investigating' ||
        e.kind === 'resolved' ||
        e.kind === 'closed' ||
        e.kind === 'cancelled'
      ) {
        out.push(
          build({
            occurredAt: e.occurredAt,
            actorId: e.actorId,
            tenantId: i.tenantId,
            action: 'incident.transition',
            entityType: 'incident',
            entityId: i.id,
            entityLabel: i.code,
            changes: [{ field: 'status', after: e.kind, before: null }],
          }),
        );
      }
    }
  }
  return out;
}

function fromSessions(): IAuditEntry[] {
  // Generate ~3 login events per user spread across past 30 days.
  const out: IAuditEntry[] = [];
  const now = Date.now();
  USERS.forEach((u, idx) => {
    for (let n = 0; n < 3; n++) {
      const daysAgo = (idx * 3 + n * 7) % 30;
      const occurredAt = new Date(now - daysAgo * 86400000 - n * 3600000).toISOString();
      const failed = (idx + n) % 13 === 0;
      out.push(
        build({
          occurredAt,
          actorId: u.id,
          tenantId: u.assignments[0]?.tenantId ?? null,
          action: failed ? 'login.failed' : 'login.success',
          entityType: 'session',
          entityId: `sess-${u.id}-${n}`,
          entityLabel: u.email,
          metadata: failed ? { reason: 'invalid_password' } : { method: 'password' },
        }),
      );
    }
  });
  return out;
}

// =========================================================================
// Assemble + sort
// =========================================================================

export const AUDIT_ENTRIES: IAuditEntry[] = [
  ...fromOrders(),
  ...fromRefunds(),
  ...fromCampaigns(),
  ...fromPromotions(),
  ...fromVoucherBatches(),
  ...fromCatalog(),
  ...fromInventory(),
  ...fromCrm(),
  ...fromIam(),
  ...fromHr(),
  ...fromSessions(),
].sort((a, b) => (b.occurredAt < a.occurredAt ? -1 : 1));

export function findAuditEntry(id: string): IAuditEntry | undefined {
  return AUDIT_ENTRIES.find((e) => e.id === id);
}
