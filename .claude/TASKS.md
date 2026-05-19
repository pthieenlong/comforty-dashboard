# TASKS — Comforty Dashboard

File theo dõi tiến độ phát triển dashboard. Cập nhật mỗi khi hoàn thành 1 task.

> **Workflow**: build component **đan xen** với feature page — chỉ build component khi feature sắp dùng đến, không build batch trước. Mỗi sprint kết thúc bằng 1 PR vào `dev`.

**Quy ước trạng thái:**

- `[ ]` — chưa làm
- `[~]` — đang làm
- `[x]` — đã xong
- `[!]` — bị block / cần quyết định

---

## Tổng quan tiến độ

| Sprint    | Phạm vi                                    | Trạng thái | Branch              |
| --------- | ------------------------------------------ | ---------- | ------------------- |
| Sprint 0  | Repo setup + docs + tooling                | `[x]`      | merged to `main`    |
| Sprint 1  | Design tokens + UI Tier 1+2 + Layouts      | `[x]`      | merged to `dev`     |
| Sprint 2  | Auth UI pages (no backend wiring)          | `[x]`      | merged to `dev`     |
| Sprint 3  | IAM (Users, Roles, Permissions)            | `[x]`      | merged to `dev`     |
| Sprint 3+ | Storybook setup + stories cho 28 component | `[x]`      | merged to `dev`     |
| Sprint 3+ | Layout polish (responsive + mock wiring)   | `[x]`      | merged to `dev`     |
| Sprint 4  | Tenant management                          | `[x]`      | merged to `dev`     |
| Sprint 5  | Product catalog                            | `[~]`      | `feat/product-form` |
| Sprint 6  | Customer (CRM)                             | `[~]`      | `feat/customer-crm` |
| Sprint 7  | Inventory                                  | `[~]`      | `feat/inventory`    |
| Sprint 8  | Orders + Payments                          | `[x]`      | merged to `dev`     |
| Sprint 9  | Marketing                                  | `[ ]`      |                     |
| Sprint 10 | HR (Attendance, Incidents)                 | `[ ]`      |                     |
| Sprint 11 | Audit log + Notifications                  | `[ ]`      |                     |
| Sprint 12 | Polish (404/403, error boundary, i18n)     | `[ ]`      |                     |

---

## UI Component Library — Đã có (Sprint 1)

`src/app/shared/ui/`

### Tier 1 — Cốt lõi

- [x] **Button** — 5 variants, 3 sizes, loading state
- [x] **Input** — `ControlValueAccessor`, invalid state, 3 sizes
- [x] **Label** — required indicator
- [x] **FormField** — wrapper label + content + help/error text
- [x] **Card** + **CardHeader** + **CardFooter**
- [x] **Avatar** — image hoặc initials
- [x] **Icon** — wrapper `@lucide/angular`
- [x] **Spinner** — 3 sizes

### Tier 2 — Layout-aware

- [x] **Badge** — 6 variants, dot mode
- [x] **Divider** — horizontal/vertical
- [x] **NavLink** — RouterLink active state, collapsed mode
- [x] **Tooltip** — directive với CDK Overlay, 4 positions
- [x] **Dropdown** + **DropdownTrigger** directive + **DropdownItem**

---

## UI Component Library — Cần build (on-demand)

Chỉ build khi sprint feature sắp dùng đến. Cập nhật khi hoàn thành.

### Form components

- [x] **Checkbox** — single checkbox với indeterminate state
- [ ] **CheckboxGroup** — group nhiều checkbox cho multi-filter
- [ ] **Radio** + **RadioGroup**
- [x] **Switch** — toggle on/off
- [x] **Textarea** — multi-line input
- [x] **PasswordInput** — variant Input với toggle show/hide
- [x] **SearchInput** — variant Input với icon search + clear
- [x] **NumberInput** — +/- buttons, min/max
- [x] **Select** — single select dropdown, có search
- [x] **MultiSelect** — multiple select với chip
- [x] **Combobox/Autocomplete** — tìm theo SKU/phone/email
- [ ] **DatePicker** — chọn ngày, calendar grid vi-VN
- [x] **DateRangePicker** — chọn khoảng ngày
- [x] **FileUpload** — drag-drop single file với preview
- [x] **ImageUploadGrid** — multi-image với reorder (CDK drag-drop), set primary

### Feedback & Disclosure

- [x] **Modal/Dialog** — CDK Dialog + dismissible header + footer slot
- [x] **ConfirmDialog** — wrapper Modal cho yes/no action với service
- [x] **Drawer** — slide panel từ phải (CDK Dialog + DrawerService)
- [x] **Alert** — inline message (success/warning/error/info)
- [x] **EmptyState** — khi list rỗng
- [x] **Skeleton** — loading placeholder
- [x] **Toast wrapper** — service preset cho `ngx-sonner`

### Navigation & Data Display

- [x] **Breadcrumb** — path navigation
- [x] **Tabs** — tab switcher với signal state, TabPanel directive
- [x] **Pagination** — page number + prev/next + range display
- [x] **Tag/Chip** — label với close button
- [x] **Timeline** — vertical timeline với dot variant + icon + custom slot
- [x] **DescriptionList** — key-value chi tiết
- [~] **DataTable** — sort, filter, paginate, select, virtual scroll
  - [x] v1: column config + custom cell template + sort + selection + skeleton + empty state
  - [x] v2 (virtual): `DataTableVirtualComponent` dùng `cdk-virtual-scroll-viewport`, cùng `ColumnDef` API
- [x] **Stepper** — tự build, hybrid mode (strict/free), valid-aware
- [x] **Tree** — flatten + indent, expand/collapse, custom row template
- [x] **TreeSelect** — overlay wrap Tree, ControlValueAccessor
- [ ] **Transfer** — left-right list (Permission → Role)

### Specialized

- [ ] **PermissionGate** — structural directive ẩn UI theo permission
- [ ] **CopyButton** — click copy text với feedback
- [ ] **PhoneInput** — format số ĐT VN
- [x] **PriceInput** — format VNĐ với separator, suffix unit
- [ ] **Chart wrappers** — line/bar/pie wrap ApexCharts

---

## Sprint 2 — Auth UI Pages

**Mục tiêu**: Hoàn thiện UI cho luồng auth + 404/403 — **không** wire backend, service, interceptor, guard (defer sang sprint sau khi API ready).

**Branch**: `feat/auth-and-http`

### Components cần thêm (Sprint 2)

- [x] **PasswordInput** — toggle show/hide
- [x] **Checkbox** — single với indeterminate state, ControlValueAccessor
- [x] **Alert** — 4 variants (success/warning/danger/info), dismissible

### Pages (Sprint 2)

- [x] **Login page** — Reactive form email + password + remember, validate error, loading state, link sang Forgot
- [x] **Forgot password page** — form email, success state sau khi gửi
- [x] **Reset password page** — form mật khẩu mới + confirm với cross-field validator
- [x] **404 page** — wildcard route catch-all
- [x] **403 page** (Forbidden) — `/forbidden` route với nút back

### Defer sang sprint sau (cần backend ready)

- [ ] Define `IApiResponse<T>` + `IApiError` model
- [ ] Define `IJwtPayload`, `IUser`, `ITenant`, `IPermission` model
- [ ] `AuthService` (SignalStore) — login, logout, refresh, currentUser
- [ ] `TenantService` (SignalStore) — current tenant, switch, list available
- [ ] `PermissionService` — check `has(permission)`
- [ ] HTTP Interceptor: auth, tenant, apiResponse, error
- [ ] Guards: `authGuard`, `tenantGuard`, `permissionGuard`
- [ ] Nối tenant switcher trong Topbar với `TenantService`
- [ ] Nối user menu trong Topbar với `AuthService.currentUser`
- [ ] Wire logout action

---

## Sprint 3 — IAM (Users, Roles, Permissions)

**Mục tiêu**: Super Admin có thể CRUD user, gán role, gán permission cho role.

**Branch dự kiến**: `feat/iam`

### Components cần thêm (Sprint 3)

- [x] **DataTable v1**
- [x] **Pagination**
- [x] **SearchInput**
- [x] **Modal/Dialog** + **ConfirmDialog**
- [x] **Select**
- [x] **Switch**
- [x] **Tag**
- [x] **EmptyState**
- [x] **Skeleton**
- [x] **Toast wrapper**
- [x] **Breadcrumb**
- [x] **Tabs** (bonus, dùng cho user detail)

### Pages (Sprint 3)

- [x] `/iam/users` — list user với filter (status, tenant) + search + sort + pagination + bulk select
- [x] `/iam/users/new` — form tạo user (email, name, phone, tenant, role, active)
- [x] `/iam/users/:id` — detail user với tabs (Info / Chi nhánh & Vai trò / Hoạt động)
- [x] `/iam/users/:id/edit` — form edit (dùng chung component với create, prefill data từ mock)
- [x] `/iam/roles` — list role grid với card per role
- [x] `/iam/roles/:id` — detail role với permission matrix 10 resources × 4 actions
- [x] `/iam/permissions` — list permission read-only nhóm theo resource

### Mock data

- [x] `iam.types.ts` — IUser, IRole, IPermission, IUserTenantAssignment
- [x] `iam.mock.ts` — 28 users, 9 roles, 40 permissions (10 resources × 4 actions), 6 tenants

---

## Sprint 3+ — Layout Polish

**Mục tiêu**: Hoàn thiện layout shell với mock data — topbar wiring, responsive sidebar, route loading, placeholder cho mọi feature module để click sidebar không 404.

**Branch**: `feat/layout-polish`

### Mock data + store (core)

- [x] `core/tenant/` — types + mock 6 tenant + `TenantStore` (currentTenant, switchTenant với simulated delay)
- [x] `core/auth/` — types + mock current user + `AuthStore` (currentUser, logout → redirect `/auth/login`)
- [x] `core/notification/` — types + mock 8 noti + `NotificationStore` (items, unreadCount, markAsRead, markAllAsRead)
- [x] `shared/utils/simulate-delay.ts` — promise resolve sau random delay

### Components mới

- [x] `shared/pipes/relative-time.pipe.ts` — format "X phút/giờ/ngày trước" vi-VN
- [x] `shared/ui/page-header/` — breadcrumb + title + description + slot action
- [x] `shared/ui/placeholder-page/` — wrap PageHeader + EmptyState cho route chưa build

### Topbar wiring

- [x] Tenant switcher bind với `TenantStore`, hiển thị tên + city, check icon cho item hiện tại, toast khi switch
- [x] User menu bind với `AuthStore`, logout async với toast
- [x] Notification dropdown (panel 360px) — list noti với icon theo type, unread dot, relative time, click → mark as read + navigate
- [x] Hamburger button (left) — chỉ hiển thị trên mobile (`<lg`)

### Responsive sidebar

- [x] Desktop (`≥lg`): in-flow, collapse w-64 ↔ w-16
- [x] Mobile (`<lg`): fixed overlay slide từ trái + backdrop, đóng khi click nav item

### Routing

- [x] Wire route + placeholder page cho: `/orders`, `/customers`, `/catalog/*`, `/inventory/*`, `/marketing/*`, `/hr/*`, `/audit`, `/reports`, `/tenants`
- [x] Lazy load qua `*.routes.ts` per module — match pattern IAM

### UX polish

- [x] Route navigation loading bar (thanh 0.5px indigo, animate-pulse trên top main) — listen `NavigationStart/End/Cancel/Error`

---

## Sprint 4 — Tenant Management

**Mục tiêu**: HQ admin xem/quản lý 6 tenant (1 HQ + 5 store).

**Branch**: `feat/tenant-management`

### Components cần thêm (Sprint 4)

- [x] **DescriptionList** (cho detail tenant)
- [x] **Tabs** (reuse từ Sprint 3)

### Mock data + core

- [x] Mở rộng `ITenant` (status, address, phone, email, managerName, openedAt, userCount, warehouseCount)
- [x] `core/warehouse/` — `IWarehouse` types + mock 6 warehouse (1/tenant) + `findWarehousesByTenant` helper
- [x] `findTenant` helper trong `tenant.mock.ts`

### Pages (Sprint 4)

- [x] `/tenants` — grid card 6 tenant với filter (type, status) + search (name/code/city)
- [x] `/tenants/:id` — detail với 3 tabs Info (DescriptionList) / Users (filter từ IAM mock) / Warehouses (card grid)
- [x] `/tenants/:id/edit` — form edit (name, status, city, address, phone, email, managerName) — code & type readonly

---

## Sprint 5 — Product Catalog

**Mục tiêu**: HQ quản lý Category/Brand/Product, store xem.

**Branch**: `feat/product-catalog` — chia 3 mini-sprint (5a Brand, 5b Category, 5c Product).

### Mock data (chuẩn bị 1 lần cho cả Sprint 5)

- [x] `product.types.ts` — IBrand, ICategory, ICategoryNode, IProduct, IProductVariant, IProductAttribute
- [x] `brand.mock.ts` — 5 brand (Comforty, Norden, Kyoto, Milano, Saigon Craft)
- [x] `category.mock.ts` — 18 category n-cấp tree + helpers (buildTree, flatten, getPath, findCategory)
- [x] `product.mock.ts` — 30 product seed với variant generator (cartesian product attributes), 2–5 variant/product

### Components cần thêm (Sprint 5)

- [x] **Tree** (n-cấp, expand/collapse default open)
- [x] **TreeSelect** (chọn parent category)
- [x] **Textarea**
- [x] **NumberInput** + **PriceInput**
- [x] **FileUpload** + **ImageUploadGrid** (5c.2)
- [x] **MultiSelect** (cho variant attributes)
- [ ] **DataTable v2** (virtual scroll — defer)

### Pages

- [x] `/catalog/brands` — list (DataTable + filter status) + form (5a)
- [x] `/catalog/brands/new` + `/catalog/brands/:id/edit` (5a)
- [x] `/catalog/categories` — master-detail tree + form (5b)
- [x] `/catalog/products` — list với filter (category tree, brand, status) + search + pagination (5c.1)
- [x] `/catalog/products/:id` — detail 3 tab (Tổng quan / Variants matrix / Mô tả) (5c.1)
- [x] `/catalog/products/new` — multi-step form (Info → Attributes → Images → Pricing) (5c.2)
- [x] `/catalog/products/:id/edit` — chung component, stepper free-mode (5c.2)

---

## Sprint 6 — Customer (CRM)

**Mục tiêu**: Xem khách hàng global, lịch sử mua, loyalty.

### Components cần thêm (Sprint 6)

- [x] **Timeline** (order history, loyalty events; reuse Sprint 11)

### Mock data

- [x] `customer.types.ts` — ICustomer, ICustomerAddress, ICustomerOrder + line items, ILoyaltyEvent
- [x] `customer.mock.ts` — 25 khách hàng + generator order (link tới PRODUCTS) + loyalty events, TIER_META

### Pages (Sprint 6)

- [x] `/customers` — list với filter (tier, has_orders, date range), DataTable + sort + pagination
- [x] `/customers/:id` — detail 4 tab Info/Addresses/Orders (inline expand product lines)/Loyalty (Timeline + tier benefits)

---

## Sprint 7 — Inventory

**Mục tiêu**: Xem stock, tạo movement, transfer giữa warehouse, kiểm kê.

### Components cần thêm (Sprint 7)

- [ ] **Stepper** (cho StockTransfer flow)
- [ ] **Drawer** (cho filter advanced)
- [ ] **DataTable v3** (row selection cho bulk action)

### Pages (Sprint 7)

- [x] `/inventory/stock` — flat list theo (warehouse × variant), filter warehouse/low-stock/search + Drawer lọc nâng cao (7a)
- [x] `/inventory/movements` — log với filter loại/kho/date range (7a)
- [x] `/inventory/transfers` — list với filter status, link sang detail (7b)
- [x] `/inventory/transfers/new` — 4-step form (Info → Items → Review → Submit), strict mode, validate stock đủ (7b)
- [x] `/inventory/transfers/:id` — detail + Timeline + action chuyển trạng thái optimistic (7b)
- [x] `/inventory/stock-take` — list phiên kiểm kê với filter status/warehouse + variance summary (7c)
- [x] `/inventory/stock-take/:id` — UI nhập số liệu với search + filter (chưa đếm / có chênh lệch), stats card, action draft/complete/cancel (7c)

---

## Sprint 8 — Orders + Payments

**Mục tiêu**: Quản lý đơn (POS + online), refund, view payment.

### Mini-sprint plan

- **8a** — Component foundation + mock data + stores (Combobox, DateRangePicker, DataTable v4, types/mock 80 orders + payments + refunds, OrderStore + PaymentStore).
- **8b** — Orders list + detail (status timeline + actions).
- **8c** — POS `/orders/new` (Stepper 3-step) + Payments list/detail.

### Components cần thêm (Sprint 8)

- [x] **Combobox** (tìm Customer/Product nhanh) — async search, keyboard nav, custom option template (8a)
- [x] **DateRangePicker** — popover 1 tháng, Monday-first, Áp dụng/Đặt lại (8a)
- [x] **DataTable v4** — virtual scroll variant component (8a)

### Mock data + stores (Sprint 8a)

- [x] `order.types.ts` — 9 OrderStatus (draft/pending_payment/confirmed/preparing/shipping/completed/partial_refunded/refunded/cancelled), `IOrder`, `IOrderItem`, `IOrderShipping`, `IOrderEvent`, `IPayment`, `IRefund` + `IRefundLine`, status/method/reason meta maps
- [x] `order.mock.ts` — 80 orders (60 online + 20 POS) đa kênh đa tenant với distribution status đúng plan, 80 payments 1-1 với order, 8 refunds (4 full + 4 partial) ref tới line items
- [x] `OrderStore` — signals (`orders`, `refunds`, `saving`, `countByStatus`), helpers `findById`/`findByCustomer`/`findByTenant`/`findRefundsByOrder`, optimistic `transition()` + `addRefund()`
- [x] `PaymentStore` — signals (`payments`, `countByStatus`, `totalPaid`), helpers `findById`/`findByOrder`

### Pages

- [x] `/orders` — list với filter (channel, status, date range, store, search) + sort + pagination (8b)
- [x] `/orders/:id` — detail 3 tab Items/Tiến trình/Hoàn hàng + sidebar Khách hàng + Thanh toán, action theo state (confirm/preparing/shipping/completed/cancel/refund line-item) (8b)
- [x] `/orders/new` — POS Stepper 3-step (Customer/walk-in → Cart Combobox + qty stepper → Payment + summary), submit tạo đơn POS hoàn tất + payment paid synchronously (8c)
- [x] `/payments` — list 6 column với filter (search/method/status/tenant/date range) + sort + pagination (8c)
- [x] `/payments/:id` — detail method icon + linked-order card (8c)

---

## Sprint 9 — Marketing

### Components cần thêm (Sprint 9)

- [ ] **DatePicker** (valid_from/valid_until)

### Pages (Sprint 9)

- [ ] `/marketing/campaigns` — list + form
- [ ] `/marketing/promotions` — list + multi-type form
- [ ] `/marketing/vouchers` — generator + usage tracking

---

## Sprint 10 — HR

### Pages (Sprint 10)

- [ ] `/hr/attendance` — calendar view per user
- [ ] `/hr/incidents` — list + assign/resolve

---

## Sprint 11 — Audit + Notifications

### Components cần thêm (Sprint 11)

- [ ] (đã có đủ từ các sprint trước)

### Pages (Sprint 11)

- [ ] `/audit` — filter heavy table (actor, action, entity, date range)
- [ ] Notification dropdown trong Topbar (đã có UI placeholder, cần nối service)

---

## Sprint 12 — Polish

- [ ] **PermissionGate** directive (ẩn nav item theo permission)
- [ ] **CopyButton** (request ID, order code)
- [ ] **Chart wrappers** (cho Dashboard KPI thật)
- [ ] Dashboard KPI thật từ API
- [ ] Global error boundary
- [ ] Loading state cho mọi route navigation
- [ ] i18n vi-VN cho date/number/currency
- [ ] Mobile responsive review

---

## Cập nhật log

| Date       | Sprint    | Note                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-16 | Sprint 0  | Setup repo, docs, tooling. Tạo 3 branch main/staging/dev.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2026-05-16 | Sprint 1  | Design tokens + 13 UI components + AuthLayout + AdminLayout. PR vào `dev`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 2026-05-16 | Sprint 2  | Auth UI pages (Login/Forgot/Reset) + 404/403 + 3 components (PasswordInput, Checkbox, Alert). Service/interceptor/guard defer.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 2026-05-17 | Sprint 3  | IAM: 7 pages (Users CRUD, Roles list/detail, Permissions list) + 12 components (DataTable v1, Pagination, Select, Modal+ConfirmDialog, Toast wrapper, SearchInput, Switch, Tag, EmptyState, Skeleton, Breadcrumb, Tabs). Mock data 28 users + 9 roles + 40 permissions.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2026-05-17 | Storybook | Setup Storybook 10 + 28 stories cho toàn bộ UI components (ui/forms/feedback/overlay/navigation/data). Interaction test cho Modal + DataTable. Exclude stories khỏi prod bundle.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 2026-05-17 | Sprint 3+ | Layout polish: tenant/auth/noti mock stores + topbar wiring (switcher, user menu, noti dropdown 360px), responsive sidebar (desktop collapse + mobile drawer), route loading bar, 11 placeholder pages + breadcrumb. PageHeader, PlaceholderPage, RelativeTime pipe, simulateDelay util.                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2026-05-17 | Sprint 4  | Tenant management: extend `ITenant` (+8 field), `core/warehouse/` 6 mock, 3 pages (list grid card, detail 3 tabs Info/Users/Warehouse, edit form readonly). DescriptionList component mới. Lazy route `/tenants` thay placeholder.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2026-05-17 | Sprint 5  | Catalog 5a/5b: mock (5 brand, 18 cat, 30 product + variants). 6 component mới (Textarea, NumberInput, PriceInput, MultiSelect, Tree, TreeSelect). Brand list/form + Category master-detail. FileUpload defer 5c.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 2026-05-17 | Sprint 5  | Catalog 5c.1: Product list (filter category tree + brand + status + search + pagination, sort) và Product detail (3 tab Overview/Variants matrix/Description). Đổi mock toàn bộ sang domain quần áo (5 brand, 27 cat, 30 product apparel). Form `new`/`edit` defer sang 5c.2.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 2026-05-17 | Sprint 5  | Catalog 5c.2: Product multi-step form (Info → Attributes → Images → Pricing) hybrid Stepper (strict new / free edit). 3 component mới (Stepper, FileUpload, ImageUploadGrid CDK drag-drop). Attribute preset list, auto-gen variant matrix preserve giá/stock theo combo key. Detail gallery placeholder.                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2026-05-17 | Sprint 6  | CRM: mock 25 khách hàng + order generator link tới PRODUCTS + loyalty events, TIER_META 4 hạng (Bronze/Silver/Gold/Platinum). Timeline component mới. 2 page: list (filter tier + has_orders + date range), detail 4 tab Info/Addresses (read-only)/Orders (inline expand line items)/Loyalty (Timeline + tier benefits).                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2026-05-18 | Sprint 7  | Inventory 7a+7b: mock (stock ~150 row, 80 movements, 12 transfers). Drawer component mới (CDK Dialog slide từ phải). 5 page: stock (filter + Drawer nâng cao), movements (filter type/kho/date), transfers list, transfer-form 4-step strict (Info → Items → Review → Submit) với validate stock đủ, transfer-detail với Timeline + action chuyển trạng thái optimistic. Stock-take defer 7c. Sidebar bổ sung "Biến động".                                                                                                                                                                                                                                                                                                                                           |
| 2026-05-18 | Sprint 7  | Inventory 7c: mock 8 phiên kiểm kê (mix 4 status, scope full/partial, lines counted/null theo status). 2 page: stock-take list (filter + variance summary mỗi phiên) và stock-take counter (4 stats card, filter chưa đếm/có chênh lệch, inline input đếm và note, action Lưu nháp/Hoàn tất với confirm dialog/Huỷ phiên với optimistic status update). Sidebar bổ sung "Kiểm kê".                                                                                                                                                                                                                                                                                                                                                                                   |
| 2026-05-18 | Sprint 8  | Orders 8a (foundation): mock 80 orders (60 online + 20 POS) trải 5 store tenant với 9 OrderStatus theo distribution plan, 80 payments 1-1 và 8 refunds (4 full + 4 partial line-item). OrderStore (transition optimistic, addRefund) + PaymentStore. 3 component mới: Combobox (CDK Overlay + async search + keyboard nav + custom option template), DateRangePicker (popover 1 tháng vi-VN Monday-first), DataTable v4 virtual scroll (cdk-virtual-scroll-viewport, cùng ColumnDef API). Pages 8b/8c defer.                                                                                                                                                                                                                                                         |
| 2026-05-18 | Storybook | Backfill 14 story còn nợ: Combobox + DateRangePicker + DataTableVirtual (Sprint 8a); MultiSelect + Textarea + NumberInput + PriceInput + FileUpload + ImageUploadGrid + TreeSelect (Sprint 5); Drawer (Sprint 7); Stepper + Tree + Timeline + DescriptionList + PageHeader + PlaceholderPage (Sprint 4-6). Tổng 43 story. Build storybook pass.                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 2026-05-19 | Sprint 8  | Orders 8b: 2 page + 1 dialog. `/orders` list với 5 filter (search/channel/status/tenant/date-range qua DateRangePicker) + sort + pagination + 6 column DataTable; `/orders/:id` detail với Card header (status icon wrap, 2-3 action button theo state mapping), Tabs 3 panel (Items + footer summary subtotal/discount/shipping/total/refunded · Tiến trình Timeline với staff actor · Hoàn hàng list), sidebar 2 card (Khách hàng + shipping carrier/tracking · Thanh toán DescriptionList). RefundDialog line-item: checkbox + qty input bound max theo `qty - refundedQuantity`, select lý do, ghi chú, tổng tiền computed. Action 5 transition + cancel confirm + refund flow → addRefund auto chuyển partial/full refunded. Placeholder removed, routes wired. |
| 2026-05-19 | Sprint 8  | Orders 8c: POS flow + Payments. `/orders/new` Stepper strict 3-step (Customer + walk-in checkbox + Combobox search · Cart Combobox add + qty stepper +/- + remove + subtotal · Payment method Select + discount PriceInput + ghi chú + summary card), submit tạo order channel='pos' status='completed' và payment 'paid' đồng thời rồi navigate detail. `/payments` list 6 column với 5 filter; `/payments/:id` detail method icon wrap + linked-order card. Store mở rộng: OrderStore.createOrder + nextOrderCode, PaymentStore.addPayment + nextPaymentCode + findByTenant. Sidebar bổ sung 'Thanh toán' (LucideCreditCard) trong group 'Bán hàng'. App routes thêm `/payments` lazy.                                                                             |
