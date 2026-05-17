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
| Sprint 6  | Customer (CRM)                             | `[ ]`      |                     |
| Sprint 7  | Inventory                                  | `[ ]`      |                     |
| Sprint 8  | Orders + Payments                          | `[ ]`      |                     |
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
- [ ] **Combobox/Autocomplete** — tìm theo SKU/phone/email
- [ ] **DatePicker** — chọn ngày, calendar grid vi-VN
- [ ] **DateRangePicker** — chọn khoảng ngày
- [x] **FileUpload** — drag-drop single file với preview
- [x] **ImageUploadGrid** — multi-image với reorder (CDK drag-drop), set primary

### Feedback & Disclosure

- [x] **Modal/Dialog** — CDK Dialog + dismissible header + footer slot
- [x] **ConfirmDialog** — wrapper Modal cho yes/no action với service
- [ ] **Drawer** — slide panel từ phải
- [x] **Alert** — inline message (success/warning/error/info)
- [x] **EmptyState** — khi list rỗng
- [x] **Skeleton** — loading placeholder
- [x] **Toast wrapper** — service preset cho `ngx-sonner`

### Navigation & Data Display

- [x] **Breadcrumb** — path navigation
- [x] **Tabs** — tab switcher với signal state, TabPanel directive
- [x] **Pagination** — page number + prev/next + range display
- [x] **Tag/Chip** — label với close button
- [ ] **Timeline** — order status, audit entry
- [x] **DescriptionList** — key-value chi tiết
- [~] **DataTable** — sort, filter, paginate, select, virtual scroll
  - [x] v1: column config + custom cell template + sort + selection + skeleton + empty state
  - [ ] v2: hoàn thiện virtual scroll cho list > 1000 row
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

- [ ] **Timeline** (order history)

### Pages (Sprint 6)

- [ ] `/customers` — list với filter (tier, has_orders, date range)
- [ ] `/customers/:id` — detail (Info / Addresses / Orders / Loyalty tabs)

---

## Sprint 7 — Inventory

**Mục tiêu**: Xem stock, tạo movement, transfer giữa warehouse, kiểm kê.

### Components cần thêm (Sprint 7)

- [ ] **Stepper** (cho StockTransfer flow)
- [ ] **Drawer** (cho filter advanced)
- [ ] **DataTable v3** (row selection cho bulk action)

### Pages (Sprint 7)

- [ ] `/inventory/stock` — xem tồn theo warehouse
- [ ] `/inventory/movements` — log mọi biến động
- [ ] `/inventory/transfers` — list + flow stepper
- [ ] `/inventory/transfers/new` — tạo transfer
- [ ] `/inventory/transfers/:id` — detail + action (confirm/cancel)
- [ ] `/inventory/stock-take` — list kiểm kê
- [ ] `/inventory/stock-take/:id` — UI nhập số liệu

---

## Sprint 8 — Orders + Payments

**Mục tiêu**: Quản lý đơn (POS + online), refund, view payment.

### Components cần thêm (Sprint 8)

- [ ] **DateRangePicker**
- [ ] **DataTable v4** (virtual scroll cho list dài)
- [ ] **Combobox** (tìm Customer/Product nhanh)

### Pages (Sprint 8)

- [ ] `/orders` — list với filter (channel, status, date range, store)
- [ ] `/orders/:id` — detail + status timeline + action (confirm/cancel/refund)
- [ ] `/orders/new` — tạo đơn POS (chỉ staff store)
- [ ] `/payments` — list payment
- [ ] `/payments/:id` — detail + transaction history

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

| Date       | Sprint    | Note                                                                                                                                                                                                                                                                                                      |
| ---------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-16 | Sprint 0  | Setup repo, docs, tooling. Tạo 3 branch main/staging/dev.                                                                                                                                                                                                                                                 |
| 2026-05-16 | Sprint 1  | Design tokens + 13 UI components + AuthLayout + AdminLayout. PR vào `dev`.                                                                                                                                                                                                                                |
| 2026-05-16 | Sprint 2  | Auth UI pages (Login/Forgot/Reset) + 404/403 + 3 components (PasswordInput, Checkbox, Alert). Service/interceptor/guard defer.                                                                                                                                                                            |
| 2026-05-17 | Sprint 3  | IAM: 7 pages (Users CRUD, Roles list/detail, Permissions list) + 12 components (DataTable v1, Pagination, Select, Modal+ConfirmDialog, Toast wrapper, SearchInput, Switch, Tag, EmptyState, Skeleton, Breadcrumb, Tabs). Mock data 28 users + 9 roles + 40 permissions.                                   |
| 2026-05-17 | Storybook | Setup Storybook 10 + 28 stories cho toàn bộ UI components (ui/forms/feedback/overlay/navigation/data). Interaction test cho Modal + DataTable. Exclude stories khỏi prod bundle.                                                                                                                          |
| 2026-05-17 | Sprint 3+ | Layout polish: tenant/auth/noti mock stores + topbar wiring (switcher, user menu, noti dropdown 360px), responsive sidebar (desktop collapse + mobile drawer), route loading bar, 11 placeholder pages + breadcrumb. PageHeader, PlaceholderPage, RelativeTime pipe, simulateDelay util.                  |
| 2026-05-17 | Sprint 4  | Tenant management: extend `ITenant` (+8 field), `core/warehouse/` 6 mock, 3 pages (list grid card, detail 3 tabs Info/Users/Warehouse, edit form readonly). DescriptionList component mới. Lazy route `/tenants` thay placeholder.                                                                        |
| 2026-05-17 | Sprint 5  | Catalog 5a/5b: mock (5 brand, 18 cat, 30 product + variants). 6 component mới (Textarea, NumberInput, PriceInput, MultiSelect, Tree, TreeSelect). Brand list/form + Category master-detail. FileUpload defer 5c.                                                                                          |
| 2026-05-17 | Sprint 5  | Catalog 5c.1: Product list (filter category tree + brand + status + search + pagination, sort) và Product detail (3 tab Overview/Variants matrix/Description). Đổi mock toàn bộ sang domain quần áo (5 brand, 27 cat, 30 product apparel). Form `new`/`edit` defer sang 5c.2.                             |
| 2026-05-17 | Sprint 5  | Catalog 5c.2: Product multi-step form (Info → Attributes → Images → Pricing) hybrid Stepper (strict new / free edit). 3 component mới (Stepper, FileUpload, ImageUploadGrid CDK drag-drop). Attribute preset list, auto-gen variant matrix preserve giá/stock theo combo key. Detail gallery placeholder. |
