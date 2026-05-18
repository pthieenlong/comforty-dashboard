import { MOCK_WAREHOUSES } from '@/core/warehouse/warehouse.mock';
import { PRODUCTS } from '@/features/product/product.mock';
import type {
  IMovement,
  IStockRow,
  IStockTake,
  IStockTakeLine,
  ITransfer,
  ITransferEvent,
  ITransferLine,
  MovementRefType,
  MovementType,
  StockTakeScope,
  StockTakeStatus,
  TransferStatus,
} from './inventory.types';

const day = 86400000;
const NOW = new Date('2026-05-17T10:00:00Z').getTime();

function pseudoRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 2147483647;
    return s / 2147483647;
  };
}

const ACTORS = [
  'Trần Minh Khoa',
  'Nguyễn Thị Hằng',
  'Phạm Quốc Cường',
  'Lê Hoàng Nam',
  'Đỗ Thu Trang',
  'Võ Minh Tuấn',
];

const MOVEMENT_REASONS: Record<MovementType, string[]> = {
  in: ['Nhập từ nhà cung cấp', 'Nhập đơn đặt hàng PO', 'Nhập bổ sung sau kiểm kê'],
  out: ['Xuất hủy hàng lỗi', 'Xuất mẫu trưng bày', 'Xuất khuyến mãi'],
  transfer_in: ['Nhận chuyển từ kho khác'],
  transfer_out: ['Chuyển sang chi nhánh khác'],
  adjust: ['Điều chỉnh sau kiểm kê', 'Cân chỉnh tồn kho'],
  sale: ['Bán tại POS', 'Bán đơn online'],
  return: ['Khách đổi trả', 'Hoàn từ đơn hủy'],
};

// ─── Stock rows ────────────────────────────────────────────────────────
// For each warehouse × variant, generate a stock row with random qty.
// Tenant warehouses don't carry ALL variants — pick subset to keep size reasonable.

function buildStock(): IStockRow[] {
  const rows: IStockRow[] = [];
  const rand = pseudoRandom(42);

  MOCK_WAREHOUSES.forEach((wh, wi) => {
    PRODUCTS.forEach((product, pi) => {
      // HQ has everything, store warehouses only ~70% of variants.
      const includeProductRoll = rand();
      const includeProduct = wh.tenantId === 't-hq' || includeProductRoll > 0.3;
      if (!includeProduct) return;

      product.variants.forEach((variant, vi) => {
        const variantRoll = rand();
        if (wh.tenantId !== 't-hq' && variantRoll > 0.85) return;

        const qty =
          product.status === 'archived'
            ? 0
            : Math.floor(rand() * (wh.tenantId === 't-hq' ? 120 : 40));
        const reserved = qty > 5 ? Math.floor(rand() * Math.min(qty, 6)) : 0;
        const reorderPoint = wh.tenantId === 't-hq' ? 20 : 8;
        const variantLabel = Object.values(variant.attributes).join(' / ');

        rows.push({
          id: `stock-${wh.id}-${variant.id}`,
          warehouseId: wh.id,
          productId: product.id,
          variantId: variant.id,
          variantSku: variant.sku,
          productName: product.name,
          variantLabel,
          quantity: qty,
          reservedQuantity: reserved,
          reorderPoint,
          updatedAt: new Date(NOW - (wi + pi + vi) * 6 * 3600000).toISOString(),
        });
      });
    });
  });

  return rows;
}

export const STOCK_ROWS: IStockRow[] = buildStock();

// ─── Movements ─────────────────────────────────────────────────────────

function buildMovements(): IMovement[] {
  const rand = pseudoRandom(917);
  const types: MovementType[] = [
    'in',
    'sale',
    'sale',
    'sale',
    'transfer_out',
    'transfer_in',
    'return',
    'adjust',
    'out',
  ];
  const refTypeFor: Record<MovementType, MovementRefType> = {
    in: 'manual',
    out: 'manual',
    transfer_in: 'transfer',
    transfer_out: 'transfer',
    adjust: 'stock_take',
    sale: 'order',
    return: 'order',
  };

  const movements: IMovement[] = [];
  for (let i = 0; i < 80; i++) {
    const type = types[Math.floor(rand() * types.length)] ?? 'in';
    const wh = MOCK_WAREHOUSES[Math.floor(rand() * MOCK_WAREHOUSES.length)];
    const product = PRODUCTS[Math.floor(rand() * PRODUCTS.length)];
    if (!wh || !product) continue;
    const variant = product.variants[Math.floor(rand() * product.variants.length)];
    if (!variant) continue;

    const baseQty = 1 + Math.floor(rand() * 12);
    const signed =
      type === 'in' || type === 'transfer_in' || type === 'return'
        ? baseQty
        : type === 'adjust'
          ? rand() > 0.5
            ? baseQty
            : -baseQty
          : -baseQty;
    const reasons = MOVEMENT_REASONS[type];
    const reason = reasons[Math.floor(rand() * reasons.length)] ?? '';
    const refType = refTypeFor[type];
    const refCode =
      refType === 'order'
        ? `ORD${String(Math.floor(rand() * 999)).padStart(3, '0')}`
        : refType === 'transfer'
          ? `TRF${String(Math.floor(rand() * 99)).padStart(3, '0')}`
          : refType === 'stock_take'
            ? `STK${String(Math.floor(rand() * 99)).padStart(3, '0')}`
            : `MAN${String(Math.floor(rand() * 999)).padStart(3, '0')}`;

    movements.push({
      id: `mv-${String(i + 1).padStart(4, '0')}`,
      code: `MV${String(i + 1).padStart(5, '0')}`,
      type,
      warehouseId: wh.id,
      variantSku: variant.sku,
      productName: product.name,
      productId: product.id,
      quantity: signed,
      reason,
      refType,
      refCode,
      performedBy: ACTORS[Math.floor(rand() * ACTORS.length)] ?? 'system',
      performedAt: new Date(NOW - i * 8 * 3600000 - Math.floor(rand() * 2 * 3600000)).toISOString(),
    });
  }
  return movements.sort((a, b) => (a.performedAt < b.performedAt ? 1 : -1));
}

export const MOVEMENTS: IMovement[] = buildMovements();

// ─── Transfers ─────────────────────────────────────────────────────────

const TRANSFER_STATUSES: TransferStatus[] = [
  'draft',
  'pending',
  'in_transit',
  'in_transit',
  'received',
  'received',
  'received',
  'cancelled',
];

function buildTransfers(): ITransfer[] {
  const rand = pseudoRandom(3001);
  const hq = MOCK_WAREHOUSES.find((w) => w.tenantId === 't-hq');
  const stores = MOCK_WAREHOUSES.filter((w) => w.tenantId !== 't-hq');
  if (!hq) return [];

  const transfers: ITransfer[] = [];
  for (let i = 0; i < 12; i++) {
    const status = TRANSFER_STATUSES[i % TRANSFER_STATUSES.length] ?? 'pending';
    const direction = i % 3 === 0 ? 'store_to_store' : 'hq_to_store';
    const toStore = stores[Math.floor(rand() * stores.length)];
    if (!toStore) continue;
    const from =
      direction === 'hq_to_store'
        ? hq
        : (stores.filter((s) => s.id !== toStore.id)[Math.floor(rand() * (stores.length - 1))] ??
          hq);
    const to = toStore;

    const lineCount = 1 + Math.floor(rand() * 4);
    const lines: ITransferLine[] = Array.from({ length: lineCount }, (_, li) => {
      const product = PRODUCTS[(i * 5 + li * 3) % PRODUCTS.length];
      if (!product) {
        return {
          variantId: '',
          variantSku: '',
          productName: '',
          variantLabel: '',
          quantity: 0,
        };
      }
      const variant = product.variants[li % product.variants.length];
      const variantLabel = variant ? Object.values(variant.attributes).join(' / ') : '';
      return {
        variantId: variant?.id ?? '',
        variantSku: variant?.sku ?? product.sku,
        productName: product.name,
        variantLabel,
        quantity: 2 + Math.floor(rand() * 8),
      };
    });

    const totalQuantity = lines.reduce((sum, l) => sum + l.quantity, 0);
    const createdAt = new Date(NOW - (i * 3 + 1) * day).toISOString();
    const events = buildEvents(status, createdAt, i);
    const receivedAt =
      status === 'received' ? (events[events.length - 1]?.occurredAt ?? null) : null;
    const expectedAt =
      status === 'in_transit' || status === 'pending'
        ? new Date(NOW + 2 * day).toISOString()
        : null;

    transfers.push({
      id: `trf-${String(i + 1).padStart(3, '0')}`,
      code: `TRF${String(i + 1).padStart(4, '0')}`,
      status,
      fromWarehouseId: from.id,
      toWarehouseId: to.id,
      note:
        i % 2 === 0
          ? 'Bổ sung hàng cho dịp khuyến mãi cuối tháng.'
          : 'Điều chuyển hàng tồn từ kho dư.',
      createdAt,
      createdBy: ACTORS[i % ACTORS.length] ?? 'system',
      expectedAt,
      receivedAt,
      totalQuantity,
      lines,
      events,
    });
  }

  return transfers;
}

function buildEvents(status: TransferStatus, createdAt: string, idx: number): ITransferEvent[] {
  const base = new Date(createdAt).getTime();
  const events: ITransferEvent[] = [
    {
      id: `ev-${idx}-create`,
      occurredAt: createdAt,
      status: 'draft',
      actor: ACTORS[idx % ACTORS.length] ?? 'system',
      note: 'Tạo phiếu chuyển',
    },
  ];
  if (status === 'draft') return events;

  events.push({
    id: `ev-${idx}-pending`,
    occurredAt: new Date(base + 4 * 3600000).toISOString(),
    status: 'pending',
    actor: ACTORS[(idx + 1) % ACTORS.length] ?? 'system',
    note: 'Xác nhận và chờ xuất kho nguồn',
  });
  if (status === 'pending') return events;

  if (status === 'cancelled') {
    events.push({
      id: `ev-${idx}-cancel`,
      occurredAt: new Date(base + 12 * 3600000).toISOString(),
      status: 'cancelled',
      actor: ACTORS[(idx + 2) % ACTORS.length] ?? 'system',
      note: 'Huỷ do thay đổi nhu cầu phân phối',
    });
    return events;
  }

  events.push({
    id: `ev-${idx}-transit`,
    occurredAt: new Date(base + 24 * 3600000).toISOString(),
    status: 'in_transit',
    actor: ACTORS[(idx + 2) % ACTORS.length] ?? 'system',
    note: 'Đã xuất kho, đang vận chuyển',
  });
  if (status === 'in_transit') return events;

  events.push({
    id: `ev-${idx}-receive`,
    occurredAt: new Date(base + 48 * 3600000).toISOString(),
    status: 'received',
    actor: ACTORS[(idx + 3) % ACTORS.length] ?? 'system',
    note: 'Đã nhận đủ tại kho đích',
  });

  return events;
}

export const TRANSFERS: ITransfer[] = buildTransfers();

export function findTransfer(id: string): ITransfer | undefined {
  return TRANSFERS.find((t) => t.id === id);
}

// ─── Stock-takes ───────────────────────────────────────────────────────

const STOCK_TAKE_STATUSES: StockTakeStatus[] = [
  'completed',
  'completed',
  'completed',
  'in_progress',
  'in_progress',
  'draft',
  'draft',
  'cancelled',
];

function buildStockTakes(): IStockTake[] {
  const rand = pseudoRandom(5119);
  const takes: IStockTake[] = [];

  for (let i = 0; i < 8; i++) {
    const status = STOCK_TAKE_STATUSES[i] ?? 'draft';
    const wh = MOCK_WAREHOUSES[i % MOCK_WAREHOUSES.length];
    if (!wh) continue;
    const scope: StockTakeScope = i % 2 === 0 ? 'full' : 'partial';

    // Pick stock rows for this warehouse, take a subset for partial.
    const whStock = STOCK_ROWS.filter((s) => s.warehouseId === wh.id);
    const subsetSize = scope === 'full' ? Math.min(whStock.length, 24) : 6 + Math.floor(rand() * 5);
    const picks = whStock.slice(0, subsetSize);

    const lines: IStockTakeLine[] = picks.map((row) => {
      // Counted: completed has counted value (may differ from expected),
      // in_progress has some lines counted some not, others null.
      let counted: number | null = null;
      if (status === 'completed') {
        const variance = Math.floor(rand() * 5) - 2; // -2..+2
        counted = Math.max(0, row.quantity + variance);
      } else if (status === 'in_progress') {
        if (rand() > 0.4) {
          const variance = Math.floor(rand() * 4) - 1;
          counted = Math.max(0, row.quantity + variance);
        }
      }
      const noteRoll = rand();
      return {
        variantId: row.variantId,
        variantSku: row.variantSku,
        productName: row.productName,
        variantLabel: row.variantLabel,
        expectedQuantity: row.quantity,
        countedQuantity: counted,
        note:
          counted !== null && counted !== row.quantity && noteRoll > 0.6
            ? 'Hàng lỗi đã loại bỏ'
            : '',
      };
    });

    const createdAt = new Date(NOW - (i * 4 + 1) * day).toISOString();
    const completedAt =
      status === 'completed' ? new Date(NOW - (i * 4 - 1) * day).toISOString() : null;

    takes.push({
      id: `st-${String(i + 1).padStart(3, '0')}`,
      code: `STK${String(i + 1).padStart(4, '0')}`,
      status,
      scope,
      warehouseId: wh.id,
      createdAt,
      createdBy: ACTORS[i % ACTORS.length] ?? 'system',
      completedAt,
      note: scope === 'full' ? 'Kiểm kê toàn bộ định kỳ' : 'Kiểm kê đột xuất một số SKU',
      lines,
    });
  }

  return takes;
}

export const STOCK_TAKES: IStockTake[] = buildStockTakes();

export function findStockTake(id: string): IStockTake | undefined {
  return STOCK_TAKES.find((t) => t.id === id);
}
