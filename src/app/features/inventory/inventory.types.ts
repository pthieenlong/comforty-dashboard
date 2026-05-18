export type MovementType =
  | 'in'
  | 'out'
  | 'transfer_out'
  | 'transfer_in'
  | 'adjust'
  | 'sale'
  | 'return';

export type MovementRefType = 'order' | 'transfer' | 'stock_take' | 'manual';

export type TransferStatus = 'draft' | 'pending' | 'in_transit' | 'received' | 'cancelled';

export interface IStockRow {
  id: string;
  warehouseId: string;
  productId: string;
  variantId: string;
  variantSku: string;
  productName: string;
  variantLabel: string;
  quantity: number;
  reservedQuantity: number;
  reorderPoint: number;
  updatedAt: string;
}

export interface IMovement {
  id: string;
  code: string;
  type: MovementType;
  warehouseId: string;
  variantSku: string;
  productName: string;
  productId: string;
  quantity: number;
  reason: string;
  refType: MovementRefType;
  refCode: string;
  performedBy: string;
  performedAt: string;
}

export interface ITransferLine {
  variantId: string;
  variantSku: string;
  productName: string;
  variantLabel: string;
  quantity: number;
}

export interface ITransferEvent {
  id: string;
  occurredAt: string;
  status: TransferStatus;
  actor: string;
  note: string;
}

export interface ITransfer {
  id: string;
  code: string;
  status: TransferStatus;
  fromWarehouseId: string;
  toWarehouseId: string;
  note: string;
  createdAt: string;
  createdBy: string;
  expectedAt: string | null;
  receivedAt: string | null;
  totalQuantity: number;
  lines: ITransferLine[];
  events: ITransferEvent[];
}

export type StockTakeStatus = 'draft' | 'in_progress' | 'completed' | 'cancelled';
export type StockTakeScope = 'full' | 'partial';

export interface IStockTakeLine {
  variantId: string;
  variantSku: string;
  productName: string;
  variantLabel: string;
  expectedQuantity: number;
  countedQuantity: number | null;
  note: string;
}

export interface IStockTake {
  id: string;
  code: string;
  status: StockTakeStatus;
  scope: StockTakeScope;
  warehouseId: string;
  createdAt: string;
  createdBy: string;
  completedAt: string | null;
  note: string;
  lines: IStockTakeLine[];
}
