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

| Sprint    | Phạm vi                                | Trạng thái | Branch               |
| --------- | -------------------------------------- | ---------- | -------------------- |
| Sprint 0  | Repo setup + docs + tooling            | `[x]`      | merged to `main`     |
| Sprint 1  | Design tokens + UI Tier 1+2 + Layouts  | `[x]`      | merged to `dev`      |
| Sprint 2  | Auth UI pages (no backend wiring)      | `[~]`      | `feat/auth-and-http` |
| Sprint 3  | IAM (Users, Roles, Permissions)        | `[ ]`      |                      |
| Sprint 4  | Tenant management                      | `[ ]`      |                      |
| Sprint 5  | Product catalog                        | `[ ]`      |                      |
| Sprint 6  | Customer (CRM)                         | `[ ]`      |                      |
| Sprint 7  | Inventory                              | `[ ]`      |                      |
| Sprint 8  | Orders + Payments                      | `[ ]`      |                      |
| Sprint 9  | Marketing                              | `[ ]`      |                      |
| Sprint 10 | HR (Attendance, Incidents)             | `[ ]`      |                      |
| Sprint 11 | Audit log + Notifications              | `[ ]`      |                      |
| Sprint 12 | Polish (404/403, error boundary, i18n) | `[ ]`      |                      |

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

### Pages (Sprint 3)

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

### Components cần thêm (Sprint 4)

- [ ] **DescriptionList** (cho detail tenant)
- [ ] **Tabs** (cho detail tenant view)

### Pages (Sprint 4)

- [ ] `/tenants` — list tenant
- [ ] `/tenants/:id` — detail (Info / Users / Warehouses tabs)
- [ ] `/tenants/:id/edit` — form edit

---

## Sprint 5 — Product Catalog

**Mục tiêu**: HQ quản lý Category/Brand/Product, store xem.

### Components cần thêm (Sprint 5)

- [ ] **Tree** (cho Category 3 cấp)
- [ ] **TreeSelect** (chọn parent category)
- [ ] **Textarea**
- [ ] **NumberInput** + **PriceInput**
- [ ] **FileUpload** + **ImageUploadGrid**
- [ ] **MultiSelect** (cho variant attributes)
- [ ] **DataTable v2** (sort + pagination)

### Pages (Sprint 5)

- [ ] `/catalog/categories` — tree view + add/edit
- [ ] `/catalog/brands` — list + form
- [ ] `/catalog/products` — list với filter (category, brand, status)
- [ ] `/catalog/products/new` — multi-step form (Info → Variants → Images → Pricing)
- [ ] `/catalog/products/:id` — detail với variant matrix
- [ ] `/catalog/products/:id/edit` — form edit

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

| Date       | Sprint   | Note                                                                                                                           |
| ---------- | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 2026-05-16 | Sprint 0 | Setup repo, docs, tooling. Tạo 3 branch main/staging/dev.                                                                      |
| 2026-05-16 | Sprint 1 | Design tokens + 13 UI components + AuthLayout + AdminLayout. PR vào `dev`.                                                     |
| 2026-05-16 | Sprint 2 | Auth UI pages (Login/Forgot/Reset) + 404/403 + 3 components (PasswordInput, Checkbox, Alert). Service/interceptor/guard defer. |
