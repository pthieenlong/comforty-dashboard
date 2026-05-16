# Comforty Dashboard — Project Overview

> Admin Dashboard cho hệ thống Comforty — giao diện quản trị web cho phép HQ và Store Manager vận hành toàn bộ chuỗi cửa hàng (sản phẩm, tồn kho, đơn hàng, khách hàng, khuyến mãi, nhân sự). Đây là **frontend client** kết nối tới Comforty API (NestJS).

---

## Tech Stack

| Layer           | Technology                                   |
| --------------- | -------------------------------------------- |
| Framework       | Angular 21                                   |
| Language        | TypeScript 5.9                               |
| Component model | Standalone components (no NgModules)         |
| State           | Angular Signals                              |
| Styling         | Tailwind CSS v4 (via `@tailwindcss/postcss`) |
| Forms           | Reactive Forms                               |
| HTTP            | `HttpClient` (with interceptors)             |
| Routing         | Angular Router (lazy-loaded features)        |
| Testing         | Vitest + jsdom                               |
| Formatter       | Prettier 3                                   |
| Package manager | npm 11                                       |

---

## Quan hệ với Comforty API

Dashboard là **consumer** của Comforty API (NestJS + Prisma + PostgreSQL). Các quyết định kiến trúc của backend mà frontend phải tôn trọng:

- **Multi-tenant**: Mọi request tới tenant-scoped resource phải kèm header `x-tenant-id`. Dashboard cho phép user switch tenant context (HQ user có thể xem nhiều store).
- **Auth**: JWT Access Token (15 phút) + Refresh Token (7 ngày). Dashboard lưu access token in-memory + refresh token httpOnly cookie; auto-refresh qua HTTP interceptor.
- **RBAC**: 1 user có nhiều role tại nhiều store khác nhau. UI phải ẩn/hiện action theo permission của user trong tenant context hiện tại.
- **API response format**: Mọi response theo cấu trúc `ApiResponse<T>` (`success`, `data`, `statusCode`, `requestId`, `timestamp`). Có error interceptor unwrap về data hoặc throw typed error.
- **Soft delete**: UI không hiển thị record có `deleted_at != null` trừ trang "Trash/Khôi phục".

---

## Architecture Decisions

### Component Strategy

- **Standalone components only** — không dùng NgModules.
- `ChangeDetectionStrategy.OnPush` cho mọi component.
- State component dùng **signals** (`signal`, `computed`, `effect`), không dùng RxJS BehaviorSubject cho local state.
- Server data dùng `HttpClient` → convert sang signal qua `toSignal()` hoặc service signal store.

### Routing & Lazy Loading

- Mỗi feature module là 1 lazy route (`loadChildren` hoặc `loadComponent`).
- Guard pattern: `authGuard` (kiểm tra JWT) → `tenantGuard` (kiểm tra tenant context) → `permissionGuard` (kiểm tra RBAC).
- Route data carry permission requirement: `data: { permission: 'product:create' }`.

### Forms

- **Reactive Forms** mặc định — không dùng Template-driven.
- DTO input từ form được validate cả ở client (Angular Validators) và server (class-validator). Client validation là UX, server là source of truth.

### Styling

- Tailwind CSS v4 utility-first. Hạn chế custom CSS — chỉ viết khi không thể đạt được bằng utility.
- Không dùng `ngClass` / `ngStyle` — dùng `[class.x]` và `[style.x]` binding.

---

## Feature Modules (dự kiến)

Dashboard mirror lại các bounded contexts của backend, mỗi context là 1 feature module độc lập:

### 1. Auth & Session

- Login page (email + password), forgot password, change password.
- JWT interceptor tự attach access token + auto-refresh khi expired.
- Tenant switcher UI cho user có quyền nhiều store.

### 2. Dashboard (Home)

- Tổng quan KPI: doanh thu hôm nay, đơn hàng mới, tồn kho cảnh báo, top sản phẩm bán chạy.
- Filter theo tenant (HQ thấy tất cả store, Store Manager chỉ thấy store của mình).

### 3. Product Catalog

- Quản lý Category (cây 3 cấp), Brand, Product, ProductVariant.
- CRUD product + variant matrix (Size × Color).
- Upload ProductImage (multi-image, drag-drop ordering).
- `StoreProductPricing` — override giá theo store.

### 4. Inventory

- Xem `InventoryStock` theo warehouse.
- Tạo `StockMovement` (nhập / xuất / điều chỉnh).
- `StockTransfer` flow giữa các warehouse: `PENDING → IN_TRANSIT → RECEIVED / CANCELLED`.
- `StockTake` (kiểm kê) — UI nhập số lượng đếm thực tế, hệ thống tính chênh lệch.

### 5. Order & Payment

- List + filter order theo channel (`POS` / `ONLINE`), status, ngày, store.
- Detail order với timeline trạng thái: `PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED → CANCELLED / REFUNDED`.
- Xem `Payment` + `PaymentTransaction` history.

### 6. Customer (CRM)

- List customer global, filter theo loyalty tier (`BRONZE` → `PLATINUM`).
- Detail: thông tin, addresses, order history cross-store, loyalty points.

### 7. Marketing

- Tạo Campaign + Promotion (4 type: `PERCENTAGE`, `FIXED_AMOUNT`, `FREE_SHIPPING`, `BUY_X_GET_Y`).
- Voucher generator với `usage_limit` + `valid_until`.
- Assign promotion tới tenant cụ thể qua `PromotionTenant`.

### 8. HR & Operations

- `AttendanceRecord` view (check-in/out theo user + tenant + ngày).
- `IncidentReport` — list, assign, resolve.

### 9. IAM (Identity Admin)

- Chỉ Super Admin / HQ Admin truy cập.
- Quản lý User, Role, Permission, RolePermission.
- Assign user vào tenant + role (`UserTenantAssignment`).

### 10. Audit & Notifications

- `AuditLog` viewer — filter theo actor, action, entity, time range.
- `Notification` center — bell icon + dropdown.

---

## Directory Structure (dự kiến)

```
src/
├── app/
│   ├── core/                       # Singleton services, interceptors, guards
│   │   ├── auth/
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.guard.ts
│   │   │   └── token-refresh.interceptor.ts
│   │   ├── tenant/
│   │   │   ├── tenant.service.ts
│   │   │   ├── tenant.guard.ts
│   │   │   └── tenant-header.interceptor.ts
│   │   ├── http/
│   │   │   ├── api-response.interceptor.ts
│   │   │   └── error.interceptor.ts
│   │   └── rbac/
│   │       ├── permission.service.ts
│   │       └── permission.guard.ts
│   ├── shared/                     # Reusable components, directives, pipes
│   │   ├── components/
│   │   │   ├── data-table/
│   │   │   ├── form-field/
│   │   │   └── confirm-dialog/
│   │   ├── directives/
│   │   └── pipes/
│   ├── features/                   # Lazy-loaded feature routes
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── product/
│   │   ├── inventory/
│   │   ├── order/
│   │   ├── customer/
│   │   ├── marketing/
│   │   ├── hr/
│   │   ├── iam/
│   │   └── audit/
│   ├── layouts/                    # Shell layouts (admin, auth)
│   │   ├── admin-layout/
│   │   └── auth-layout/
│   ├── app.config.ts
│   ├── app.routes.ts
│   └── app.ts
├── styles.css                      # Tailwind entry
└── main.ts
```

---

## Key UI Rules

1. **Tenant context visible**: Tenant switcher hiển thị trên header mọi page. User luôn biết đang thao tác trên store nào.
2. **Permission-gated UI**: Button/Action ẩn (không phải disable) nếu user không có permission. Disable chỉ dùng khi action tạm thời bất khả thi (vd: stock < 0).
3. **Confirm trước destructive action**: Delete, cancel order, void payment đều phải qua confirm dialog.
4. **Optimistic UI có giới hạn**: Chỉ dùng cho action idempotent (toggle favorite, update single field). Action tạo/xóa entity luôn đợi server confirm.
5. **Loading state explicit**: Không dùng spinner full-screen. Mỗi data section có skeleton/loading riêng để UI vẫn interactive.
6. **Accessibility**: Pass AXE checks, WCAG AA — focus management, color contrast, ARIA labels cho icon-only button.

---

## Connection to Backend

- Base API URL: `environment.apiUrl` (cấu hình theo môi trường — dev/staging/prod).
- Mọi HTTP call đi qua chain interceptor: `auth → tenant-header → api-response → error`.
- DTO type **share manually** với backend (sao chép interface từ NestJS DTO sang `src/app/.../models/`). Cân nhắc OpenAPI codegen sau khi backend stable.
