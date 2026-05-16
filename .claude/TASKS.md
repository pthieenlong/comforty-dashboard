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

| Sprint    | Phạm vi                                | Trạng thái | Branch                      |
| --------- | -------------------------------------- | ---------- | --------------------------- |
| Sprint 0  | Repo setup + docs + tooling            | `[x]`      | merged to `main`            |
| Sprint 1  | Design tokens + UI Tier 1+2 + Layouts  | `[x]`      | `feat/layout-and-ui-system` |
| Sprint 2  | HTTP foundation + Auth flow + Login    | `[ ]`      | (chưa tạo)                  |
| Sprint 3  | IAM (Users, Roles, Permissions)        | `[ ]`      |                             |
| Sprint 4  | Tenant management                      | `[ ]`      |                             |
| Sprint 5  | Product catalog                        | `[ ]`      |                             |
| Sprint 6  | Customer (CRM)                         | `[ ]`      |                             |
| Sprint 7  | Inventory                              | `[ ]`      |                             |
| Sprint 8  | Orders + Payments                      | `[ ]`      |                             |
| Sprint 9  | Marketing                              | `[ ]`      |                             |
| Sprint 10 | HR (Attendance, Incidents)             | `[ ]`      |                             |
| Sprint 11 | Audit log + Notifications              | `[ ]`      |                             |
| Sprint 12 | Polish (404/403, error boundary, i18n) | `[ ]`      |                             |

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

- [ ] **Checkbox** — single checkbox với indeterminate state
- [ ] **CheckboxGroup** — group nhiều checkbox cho multi-filter
- [ ] **Radio** + **RadioGroup**
- [ ] **Switch** — toggle on/off
- [ ] **Textarea** — multi-line input
- [ ] **PasswordInput** — variant Input với toggle show/hide
- [ ] **SearchInput** — variant Input với icon search + clear
- [ ] **NumberInput** — +/- buttons, min/max, formatter (VNĐ)
- [ ] **Select** — single select dropdown, có search
- [ ] **MultiSelect** — multiple select với chip
- [ ] **Combobox/Autocomplete** — tìm theo SKU/phone/email
- [ ] **DatePicker** — chọn ngày, calendar grid vi-VN
- [ ] **DateRangePicker** — chọn khoảng ngày
- [ ] **FileUpload** — drag-drop với preview
- [ ] **ImageUploadGrid** — multi-image với reorder

### Feedback & Disclosure

- [ ] **Modal/Dialog** — CDK Overlay + FocusTrap
- [ ] **ConfirmDialog** — wrapper Modal cho yes/no action
- [ ] **Drawer** — slide panel từ phải
- [ ] **Alert** — inline message (success/warning/error/info)
- [ ] **EmptyState** — khi list rỗng
- [ ] **Skeleton** — loading placeholder
- [ ] **Toast wrapper** — preset cho `ngx-sonner`

### Navigation & Data Display

- [ ] **Breadcrumb** — path navigation
- [ ] **Tabs** — tab switcher với signal state
- [ ] **Pagination** — page number + prev/next
- [ ] **Tag/Chip** — label với close button
- [ ] **Timeline** — order status, audit entry
- [ ] **DescriptionList** — key-value chi tiết
- [ ] **DataTable** — sort, filter, paginate, select, virtual scroll
  - [ ] v1: basic table với column config
  - [ ] v2: sort + pagination
  - [ ] v3: row selection + bulk action
  - [ ] v4: virtual scroll cho list > 1000 row
- [ ] **Stepper** — wrap CDK Stepper
- [ ] **Tree** — wrap CDK Tree (cho Category)
- [ ] **TreeSelect** — chọn từ tree
- [ ] **Transfer** — left-right list (Permission → Role)

### Specialized

- [ ] **PermissionGate** — structural directive ẩn UI theo permission
- [ ] **CopyButton** — click copy text với feedback
- [ ] **PhoneInput** — format số ĐT VN
- [ ] **PriceInput** — variant NumberInput format VNĐ
- [ ] **Chart wrappers** — line/bar/pie wrap ApexCharts

---

## Sprint 2 — HTTP Foundation + Auth + Login

**Mục tiêu**: User có thể login thật (giả định API ready) → access dashboard với tenant context.

**Branch dự kiến**: `feat/auth-and-http`

### Foundation

- [ ] Define `IApiResponse<T>` + `IApiError` model trong `src/app/shared/models/`
- [ ] Define `IJwtPayload`, `IUser`, `ITenant`, `IPermission` model
- [ ] `AuthService` (SignalStore) — login, logout, refresh token, current user
- [ ] `TenantService` (SignalStore) — current tenant, switch tenant, list available
- [ ] `PermissionService` — check `has(permission)`, compute từ user roles
- [ ] HTTP Interceptor: `authInterceptor` — attach `Authorization: Bearer <token>`
- [ ] HTTP Interceptor: `tenantInterceptor` — attach `x-tenant-id`
- [ ] HTTP Interceptor: `apiResponseInterceptor` — unwrap `data` từ `ApiResponse<T>`
- [ ] HTTP Interceptor: `errorInterceptor` — chuẩn hóa error, 401 → refresh flow, 403 → toast deny
- [ ] `authGuard` — kiểm tra access token còn hiệu lực
- [ ] `tenantGuard` — đảm bảo có tenant context
- [ ] `permissionGuard` — check route data `permission`

### Components cần thêm cho Sprint này

- [ ] **PasswordInput** (cho login form)
- [ ] **Checkbox** (cho "Ghi nhớ đăng nhập")
- [ ] **Alert** (cho error message khi login fail)

### Pages

- [ ] **Login page** — form email + password + remember, error handling, loading state
- [ ] **Forgot password page** — UI only (chưa nối backend nếu BE chưa có)
- [ ] **Reset password page** — UI only
- [ ] **404 page**
- [ ] **403 page** (Forbidden)

### Hookup

- [ ] Nối tenant switcher trong Topbar với `TenantService`
- [ ] Nối user menu trong Topbar với `AuthService.currentUser`
- [ ] Wire logout action

---

## Sprint 3 — IAM (Users, Roles, Permissions)

**Mục tiêu**: Super Admin có thể CRUD user, gán role, gán permission cho role.

**Branch dự kiến**: `feat/iam`

### Components cần thêm

- [ ] **DataTable v1** (cho User list)
- [ ] **Pagination**
- [ ] **SearchInput**
- [ ] **Modal/Dialog** + **ConfirmDialog**
- [ ] **Select** (cho assign role)
- [ ] **Switch** (active/inactive user)
- [ ] **Tag/Chip** (hiển thị roles của user)
- [ ] **EmptyState**
- [ ] **Skeleton**
- [ ] **Toast wrapper**
- [ ] **Breadcrumb**

### Pages

- [ ] `/iam/users` — list user với filter + search + pagination
- [ ] `/iam/users/new` — form tạo user
- [ ] `/iam/users/:id` — detail user (Info / Tenants & Roles / Activity tabs)
- [ ] `/iam/users/:id/edit` — form edit
- [ ] `/iam/roles` — list role
- [ ] `/iam/roles/:id` — detail role với permission grid
- [ ] `/iam/permissions` — list permission (read-only)

---

## Sprint 4 — Tenant Management

**Mục tiêu**: HQ admin xem/quản lý 6 tenant (1 HQ + 5 store).

### Components cần thêm

- [ ] **DescriptionList** (cho detail tenant)
- [ ] **Tabs** (cho detail tenant view)

### Pages

- [ ] `/tenants` — list tenant
- [ ] `/tenants/:id` — detail (Info / Users / Warehouses tabs)
- [ ] `/tenants/:id/edit` — form edit

---

## Sprint 5 — Product Catalog

**Mục tiêu**: HQ quản lý Category/Brand/Product, store xem.

### Components cần thêm

- [ ] **Tree** (cho Category 3 cấp)
- [ ] **TreeSelect** (chọn parent category)
- [ ] **Textarea**
- [ ] **NumberInput** + **PriceInput**
- [ ] **FileUpload** + **ImageUploadGrid**
- [ ] **MultiSelect** (cho variant attributes)
- [ ] **DataTable v2** (sort + pagination)

### Pages

- [ ] `/catalog/categories` — tree view + add/edit
- [ ] `/catalog/brands` — list + form
- [ ] `/catalog/products` — list với filter (category, brand, status)
- [ ] `/catalog/products/new` — multi-step form (Info → Variants → Images → Pricing)
- [ ] `/catalog/products/:id` — detail với variant matrix
- [ ] `/catalog/products/:id/edit` — form edit

---

## Sprint 6 — Customer (CRM)

**Mục tiêu**: Xem khách hàng global, lịch sử mua, loyalty.

### Components cần thêm

- [ ] **Timeline** (order history)

### Pages

- [ ] `/customers` — list với filter (tier, has_orders, date range)
- [ ] `/customers/:id` — detail (Info / Addresses / Orders / Loyalty tabs)

---

## Sprint 7 — Inventory

**Mục tiêu**: Xem stock, tạo movement, transfer giữa warehouse, kiểm kê.

### Components cần thêm

- [ ] **Stepper** (cho StockTransfer flow)
- [ ] **Drawer** (cho filter advanced)
- [ ] **DataTable v3** (row selection cho bulk action)

### Pages

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

### Components cần thêm

- [ ] **DateRangePicker**
- [ ] **DataTable v4** (virtual scroll cho list dài)
- [ ] **Combobox** (tìm Customer/Product nhanh)

### Pages

- [ ] `/orders` — list với filter (channel, status, date range, store)
- [ ] `/orders/:id` — detail + status timeline + action (confirm/cancel/refund)
- [ ] `/orders/new` — tạo đơn POS (chỉ staff store)
- [ ] `/payments` — list payment
- [ ] `/payments/:id` — detail + transaction history

---

## Sprint 9 — Marketing

### Components cần thêm

- [ ] **DatePicker** (valid_from/valid_until)

### Pages

- [ ] `/marketing/campaigns` — list + form
- [ ] `/marketing/promotions` — list + multi-type form
- [ ] `/marketing/vouchers` — generator + usage tracking

---

## Sprint 10 — HR

### Pages

- [ ] `/hr/attendance` — calendar view per user
- [ ] `/hr/incidents` — list + assign/resolve

---

## Sprint 11 — Audit + Notifications

### Components cần thêm

- [ ] (đã có đủ từ các sprint trước)

### Pages

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

| Date       | Sprint   | Note                                                                       |
| ---------- | -------- | -------------------------------------------------------------------------- |
| 2026-05-16 | Sprint 0 | Setup repo, docs, tooling. Tạo 3 branch main/staging/dev.                  |
| 2026-05-16 | Sprint 1 | Design tokens + 13 UI components + AuthLayout + AdminLayout. PR vào `dev`. |
