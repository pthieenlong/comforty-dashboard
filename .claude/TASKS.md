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

| Sprint    | Phạm vi                                    | Trạng thái | Branch               |
| --------- | ------------------------------------------ | ---------- | -------------------- |
| Sprint 0  | Repo setup + docs + tooling                | `[x]`      | merged to `main`     |
| Sprint 1  | Design tokens + UI Tier 1+2 + Layouts      | `[x]`      | merged to `dev`      |
| Sprint 2  | Auth UI pages (no backend wiring)          | `[x]`      | merged to `dev`      |
| Sprint 3  | IAM (Users, Roles, Permissions)            | `[x]`      | merged to `dev`      |
| Sprint 3+ | Storybook setup + stories cho 28 component | `[x]`      | merged to `dev`      |
| Sprint 3+ | Layout polish (responsive + mock wiring)   | `[x]`      | merged to `dev`      |
| Sprint 4  | Tenant management                          | `[x]`      | merged to `dev`      |
| Sprint 5  | Product catalog                            | `[~]`      | `feat/product-form`  |
| Sprint 6  | Customer (CRM)                             | `[~]`      | `feat/customer-crm`  |
| Sprint 7  | Inventory                                  | `[~]`      | `feat/inventory`     |
| Sprint 8  | Orders + Payments                          | `[x]`      | merged to `dev`      |
| Sprint 9  | Marketing + CRM                            | `[x]`      | merged to `dev`      |
| Sprint 10 | HR (Attendance, Leave, Incidents)          | `[x]`      | `feat/hr-operations` |
| Sprint 11 | Audit log + Notifications                  | `[ ]`      |                      |
| Sprint 12 | Polish (404/403, error boundary, i18n)     | `[ ]`      |                      |

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
- [x] **DatePicker** — chọn ngày, calendar grid vi-VN, min/max
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

### Mini-sprint plan

- **9a** — Foundation: DatePicker + types/mock + stores.
- **9b-1** — Campaigns: list / detail / form.
- **9b-2** — Promotions: list / detail / form (5 rule types).
- **9c** — Vouchers: list / detail / generator + post-create dialog.

### Components cần thêm (Sprint 9)

- [x] **DatePicker** (valid_from/valid_until) — single date popover, vi-VN, min/max, today shortcut (9a)

### Mock data + stores (Sprint 9a)

- [x] `marketing.types.ts` — ICampaign (5 status), IPromotion + 5-rule discriminated union, IVoucherBatch + IVoucherCode, meta maps
- [x] `marketing.mock.ts` — 8 campaigns, 12 promotions covering all 5 rule types, 6 voucher batches (3 single + 3 multi) with ~1500 codes generated
- [x] `CampaignStore` + `PromotionStore` + `VoucherStore` — countByStatus, lookup helpers, setStatus, upsert, addBatch

### Pages (Sprint 9)

- [x] `/marketing/campaigns` — list 5-column với banner thumbnail + 3 filter (search/status/channel) (9b-1)
- [x] `/marketing/campaigns/:id` — detail Tabs Info/Promotions/Vouchers + Pause/Activate actions (9b-1)
- [x] `/marketing/campaigns/new` + `/:id/edit` — form với DatePicker × 2 + MultiSelect channels/tenants + banner Upload/URL toggle (9b-1)
- [x] `/marketing/promotions` — list 5-column với type filter + sort/pagination (9b-2)
- [x] `/marketing/promotions/:id` — detail rule card tailored per type + Pause/Activate (9b-2)
- [x] `/marketing/promotions/new` + `/:id/edit` — 2-card form, @switch theo rule type (percent_order / fixed_order / percent_category / free_shipping / bogo) (9b-2)
- [x] `/marketing/vouchers` — list 6-column với usage % và filter type/status (9c)
- [x] `/marketing/vouchers/:id` — 2-col layout (config + usage gauge | codes table với search/filter + copy code) (9c)
- [x] `/marketing/vouchers/new` — generator form sinh batch single_use hoặc multi_use, post-create dialog với Copy all + Tải CSV (9c)

### CRM extension (Sprint 9d/9e/9f/9g — gộp trong feat/marketing-crm umbrella + feat/crm-inquiries-activity)

- [x] `/crm/reviews` — list moderation với 4-card status summary + 6-col DataTable + filter (search/status/rating) (9d)
- [x] `/crm/reviews/:id` — detail moderation với action theo state, media gallery, moderation timeline, reject dialog với reason + note (9d)
- [x] Tab "Đánh giá (N)" trong product detail show approved reviews + average rating (9d)
- [x] `/crm/tickets` — list với 4-card stat + Tabs (Inbox / Của tôi / Tất cả) + 4 filter (search/type/status/priority) + 7-col DataTable (9e)
- [x] `/crm/tickets/:id` — 2-col detail: description + linked order items + comment thread (slate/indigo/amber styling cho customer/staff/internal) + compose box với internal-note toggle bên trái; info + assignee Select từ IAM (filter theo tenant + HQ) + priority Select + customer/order cards + event history bên phải (9e)
- [x] TicketEscalateDialog modal cho escalate lên cấp 2/3 (9e)
- [x] `/crm/inquiries` — list 6-col với 3-card stat (Mới/Đã trả lời/Đã lưu trữ) + 3 filter (search/status/source) (9f)
- [x] `/crm/inquiries/:id` — 2-col detail với reply thread (note vs outbound styling) + compose có channel select (email/phone/note) + sender card với link sang matched customer + assignee Select (9f)
- [x] Tab "Hoạt động (N)" trong customer-detail aggregate cross-source timeline (orders + reviews + tickets + inquiries + loyalty) với 6 pill filter buttons (9g)

---

## Sprint 10 — HR & Operations

**Mục tiêu**: Quản lý chấm công, xin nghỉ phép và sự cố vận hành nội bộ.

**Branch**: `feat/hr-operations` — chia 4 mini-sprint (10a Attendance, 10b Leave Request, 10c Incident, 10d Chart + permission).

### Mini-sprint plan

- **10a** — Foundation Attendance: Calendar component, types/mock 28 user × 30 ngày, store + 2-tab page (per-user calendar / store timesheet) + edit dialog.
- **10b** — Leave Request: types/mock 40 request + workflow approval (pending/approved/rejected/cancelled) + 3 page + integration auto sinh attendance khi approved.
- **10c** — Incident: types/mock 30 incident (6 type / 4 severity / 6 status) + 3-level escalation reuse pattern Ticket 9e + 3 page + 2 dialog (resolve/escalate).
- **10d** — Attendance chart + role-based viewing: cài ApexCharts, AttendanceChartComponent line 3 series (Có mặt/Trễ/Vắng) theo tháng/năm, department config map role→department, filter theo permission (Super Admin xem cả công ty, manager xem dept mình, nút Hôm nay ở PageHeader).

### Components cần thêm (Sprint 10)

- [x] **Calendar** — month grid 7×6 vi-VN Monday-first, cell custom template, prev/next month navigation (10a, đặt `shared/ui/calendar/` để reuse)
- [x] **AttendanceChartComponent** — line chart 3 series (Có mặt/Trễ/Vắng) với ApexCharts, mode tháng/năm, filter department+tenant (10d, đặt cùng `features/hr/`)

### Mock data + stores (Sprint 10)

- [x] `hr.types.ts` — IAttendanceRecord (6 status), IAttendancePolicy, ILeaveRequest (5 type / 4 status), meta maps
- [x] `attendance.mock.ts` — 28 user × ~50 ngày deterministic theo (userId, date)
- [x] `leave-request.mock.ts` — 40 request đa user/tenant/status
- [x] `incident.types.ts` — IIncident (7 type / 4 severity / 6 status), IIncidentComment, IIncidentEvent, meta maps
- [x] `incident.mock.ts` — 30 incident seeds Việt thực tế (POS failure, mất hàng, tranh chấp...)
- [x] `AttendanceStore` — updateRecord, summaryByUser, findByTenant, applyLeaveDates
- [x] `LeaveRequestStore` — submit, decide, cancel, countByStatus + integration sinh attendance khi approve
- [x] `IncidentStore` — transition, assign, escalate, setSeverity, addComment, createIncident
- [x] `core/department/department.config.ts` — DepartmentKey + 7 department + map roleId→department + helpers `canViewWholeCompany` / `isManagerRole` (10d)
- [x] Mở rộng IAM roles: thêm `role-cs-manager` + `role-cs-staff` (Customer Service) (10d)

### Pages (Sprint 10)

- [x] `/hr/attendance` — Tabs (Cá nhân: Combobox user + Calendar grid + summary | Tổng quan store: DataTable rows=user × cols=day matrix | Biểu đồ: ApexCharts line 3 series filter theo dept/tenant) + edit dialog + nút Hôm nay ở PageHeader (10a + 10d)
- [x] `/hr/leave-requests` — list 7-col với Tabs (Cần duyệt / Của tôi / Tất cả) + 3 filter + action approve/reject (10b)
- [x] `/hr/leave-requests/new` — form type + DateRangePicker + halfDay button group + reason + attachment FileUpload (10b)
- [x] `/hr/leave-requests/:id` — detail với decision actions + event timeline (10b)
- [x] `/hr/incidents` — list 7-col với 4-stat card + Tabs (Cần xử lý / Tôi báo cáo / Tất cả) + 4 filter (10c)
- [x] `/hr/incidents/new` — form report với type/severity/title/desc/occurredAt/location/attachments (10c)
- [x] `/hr/incidents/:id` — 2-col detail (desc + attachments + comment thread bên trái | info + assignee + severity + event history bên phải) + action state-mapped (10c)
- [x] **AttendanceEditDialog** — sửa record với editedBy/editedAt audit (10a)
- [x] **IncidentResolveDialog** — resolutionNote Textarea required (10c)
- [x] **IncidentEscalateDialog** — level select + reason (10c)

### Routing + Layout

- [x] Mở rộng `hr.routes.ts` — thêm leave-requests + incidents lazy routes
- [x] Sidebar group "Nhân sự" — 3 entry (Chấm công / Đơn nghỉ phép / Sự cố) với icon Lucide tương ứng

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

### Tech debt cleanup (Sprint 12)

- [ ] **Đồng bộ Tenant ID schema** — hiện có 2 hệ song song: `core/tenant/tenant.mock.ts` dùng `t-hq/t-q1/...`, `features/iam/iam.mock.ts` (và mọi feature mock sinh từ USERS: attendance/leave/incident/order/customer) dùng `tenant-hq/tenant-q1/...`. Đang patch tạm bằng `core/tenant/tenant-normalize.ts` (helper `normalizeTenantId`). Khi BE wire xong và có 1 nguồn tenant ID duy nhất: xoá helper, sửa 1 trong 2 mock để khớp, gỡ các call `normalizeTenantId()` ở attendance-chart.component + attendance.component.

---

## Cập nhật log

| Date       | Sprint    | Note                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-16 | Sprint 0  | Setup repo, docs, tooling. Tạo 3 branch main/staging/dev.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 2026-05-16 | Sprint 1  | Design tokens + 13 UI components + AuthLayout + AdminLayout. PR vào `dev`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 2026-05-16 | Sprint 2  | Auth UI pages (Login/Forgot/Reset) + 404/403 + 3 components (PasswordInput, Checkbox, Alert). Service/interceptor/guard defer.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2026-05-17 | Sprint 3  | IAM: 7 pages (Users CRUD, Roles list/detail, Permissions list) + 12 components (DataTable v1, Pagination, Select, Modal+ConfirmDialog, Toast wrapper, SearchInput, Switch, Tag, EmptyState, Skeleton, Breadcrumb, Tabs). Mock data 28 users + 9 roles + 40 permissions.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 2026-05-17 | Storybook | Setup Storybook 10 + 28 stories cho toàn bộ UI components (ui/forms/feedback/overlay/navigation/data). Interaction test cho Modal + DataTable. Exclude stories khỏi prod bundle.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2026-05-17 | Sprint 3+ | Layout polish: tenant/auth/noti mock stores + topbar wiring (switcher, user menu, noti dropdown 360px), responsive sidebar (desktop collapse + mobile drawer), route loading bar, 11 placeholder pages + breadcrumb. PageHeader, PlaceholderPage, RelativeTime pipe, simulateDelay util.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 2026-05-17 | Sprint 4  | Tenant management: extend `ITenant` (+8 field), `core/warehouse/` 6 mock, 3 pages (list grid card, detail 3 tabs Info/Users/Warehouse, edit form readonly). DescriptionList component mới. Lazy route `/tenants` thay placeholder.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2026-05-17 | Sprint 5  | Catalog 5a/5b: mock (5 brand, 18 cat, 30 product + variants). 6 component mới (Textarea, NumberInput, PriceInput, MultiSelect, Tree, TreeSelect). Brand list/form + Category master-detail. FileUpload defer 5c.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2026-05-17 | Sprint 5  | Catalog 5c.1: Product list (filter category tree + brand + status + search + pagination, sort) và Product detail (3 tab Overview/Variants matrix/Description). Đổi mock toàn bộ sang domain quần áo (5 brand, 27 cat, 30 product apparel). Form `new`/`edit` defer sang 5c.2.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2026-05-17 | Sprint 5  | Catalog 5c.2: Product multi-step form (Info → Attributes → Images → Pricing) hybrid Stepper (strict new / free edit). 3 component mới (Stepper, FileUpload, ImageUploadGrid CDK drag-drop). Attribute preset list, auto-gen variant matrix preserve giá/stock theo combo key. Detail gallery placeholder.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 2026-05-17 | Sprint 6  | CRM: mock 25 khách hàng + order generator link tới PRODUCTS + loyalty events, TIER_META 4 hạng (Bronze/Silver/Gold/Platinum). Timeline component mới. 2 page: list (filter tier + has_orders + date range), detail 4 tab Info/Addresses (read-only)/Orders (inline expand line items)/Loyalty (Timeline + tier benefits).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 2026-05-18 | Sprint 7  | Inventory 7a+7b: mock (stock ~150 row, 80 movements, 12 transfers). Drawer component mới (CDK Dialog slide từ phải). 5 page: stock (filter + Drawer nâng cao), movements (filter type/kho/date), transfers list, transfer-form 4-step strict (Info → Items → Review → Submit) với validate stock đủ, transfer-detail với Timeline + action chuyển trạng thái optimistic. Stock-take defer 7c. Sidebar bổ sung "Biến động".                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 2026-05-18 | Sprint 7  | Inventory 7c: mock 8 phiên kiểm kê (mix 4 status, scope full/partial, lines counted/null theo status). 2 page: stock-take list (filter + variance summary mỗi phiên) và stock-take counter (4 stats card, filter chưa đếm/có chênh lệch, inline input đếm và note, action Lưu nháp/Hoàn tất với confirm dialog/Huỷ phiên với optimistic status update). Sidebar bổ sung "Kiểm kê".                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2026-05-18 | Sprint 8  | Orders 8a (foundation): mock 80 orders (60 online + 20 POS) trải 5 store tenant với 9 OrderStatus theo distribution plan, 80 payments 1-1 và 8 refunds (4 full + 4 partial line-item). OrderStore (transition optimistic, addRefund) + PaymentStore. 3 component mới: Combobox (CDK Overlay + async search + keyboard nav + custom option template), DateRangePicker (popover 1 tháng vi-VN Monday-first), DataTable v4 virtual scroll (cdk-virtual-scroll-viewport, cùng ColumnDef API). Pages 8b/8c defer.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2026-05-18 | Storybook | Backfill 14 story còn nợ: Combobox + DateRangePicker + DataTableVirtual (Sprint 8a); MultiSelect + Textarea + NumberInput + PriceInput + FileUpload + ImageUploadGrid + TreeSelect (Sprint 5); Drawer (Sprint 7); Stepper + Tree + Timeline + DescriptionList + PageHeader + PlaceholderPage (Sprint 4-6). Tổng 43 story. Build storybook pass.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 2026-05-19 | Sprint 8  | Orders 8b: 2 page + 1 dialog. `/orders` list với 5 filter (search/channel/status/tenant/date-range qua DateRangePicker) + sort + pagination + 6 column DataTable; `/orders/:id` detail với Card header (status icon wrap, 2-3 action button theo state mapping), Tabs 3 panel (Items + footer summary subtotal/discount/shipping/total/refunded · Tiến trình Timeline với staff actor · Hoàn hàng list), sidebar 2 card (Khách hàng + shipping carrier/tracking · Thanh toán DescriptionList). RefundDialog line-item: checkbox + qty input bound max theo `qty - refundedQuantity`, select lý do, ghi chú, tổng tiền computed. Action 5 transition + cancel confirm + refund flow → addRefund auto chuyển partial/full refunded. Placeholder removed, routes wired.                                                                                                                                                                                                                                                                                                                                           |
| 2026-05-19 | Sprint 8  | Orders 8c: POS flow + Payments. `/orders/new` Stepper strict 3-step (Customer + walk-in checkbox + Combobox search · Cart Combobox add + qty stepper +/- + remove + subtotal · Payment method Select + discount PriceInput + ghi chú + summary card), submit tạo order channel='pos' status='completed' và payment 'paid' đồng thời rồi navigate detail. `/payments` list 6 column với 5 filter; `/payments/:id` detail method icon wrap + linked-order card. Store mở rộng: OrderStore.createOrder + nextOrderCode, PaymentStore.addPayment + nextPaymentCode + findByTenant. Sidebar bổ sung 'Thanh toán' (LucideCreditCard) trong group 'Bán hàng'. App routes thêm `/payments` lazy.                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 2026-05-19 | Fix       | Checkbox click không toggle trong Storybook và `/orders/new` (walk-in). Nguyên nhân: input `sr-only` nested trong label `for/id` không re-dispatch click reliably. Fix: input overlay absolute inset-0 opacity-0 phủ kín visible box + bỏ `[for]` (implicit descendant association đã đủ). Thêm spec test (5/5 pass) làm regression guard. Cũng refactor walk-in trên `/orders/new` từ checkbox sang 2-button radio group cho UX rõ ràng hơn.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 2026-05-19 | Sprint 9  | Marketing 9a foundation: DatePicker component (single date, vi-VN, min/max, today shortcut) + 4 stories. Marketing types + meta maps cho 3 entity (Campaign / Promotion / Voucher) với 5 promotion rule subtypes (percent_order / fixed_order / percent_category / free_shipping / bogo) và 2 voucher types (single_use / multi_use). Mock 8 campaigns + 12 promotions + 6 voucher batches với ~1500 codes generated deterministically. 3 stores với upsert / addBatch / setStatus / countByStatus.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2026-05-19 | Sprint 9  | Marketing 9b-1 Campaigns: 5-column DataTable list (banner thumbnail + channel badges + 3 filter), detail Tabs Info/Promotions/Vouchers với Pause/Activate transition, form name + uppercase code + DatePicker × 2 + channels MultiSelect + tenant scope + banner Upload/URL toggle (URL preview live). CampaignStore.upsert(). Sidebar group Marketing tách 'Chiến dịch' (LucideMegaphone) + 'Khuyến mãi' (LucideClipboardList).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2026-05-19 | Sprint 9  | Marketing 9b-2 Promotions: 5-column list (type + usage + 3 filter), detail rule card tailored per type (vd percent_category show category+brand names, BOGO show X/Y + trigger count), form 2-card với @switch theo rule type — percent_order (percent + minOrder + maxDiscount), fixed_order (amount + minOrder), percent_category (percent + maxDiscount + category/brand MultiSelect), free_shipping (minOrder threshold), bogo (buy/get NumberInput + trigger products MultiSelect). PromotionStore.upsert(). Placeholder removed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 2026-05-20 | Sprint 9  | Marketing 9c Vouchers: 6-column list (usage % + 3 filter), detail 2-col (config DescriptionList + usage progress bar bên trái · codes table sticky header với search/filter unused/used + click-to-copy + 'Copy all unused' bên phải, pagination 50/page), generator form với type select (drives suffix preview) + discount mode toggle (percent/fixed). On submit sinh codes deterministic, gọi addBatch, post-create dialog cho single_use show all codes + 'Copy tất cả' + 'Tải CSV'. Sidebar Marketing thêm 'Voucher' (LucideTicket).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 2026-05-20 | Sprint 9  | CRM 9d Reviews: types/mock 80 reviews (4 status, ~35% có media) link products/customers/orders. ReviewStore.transition (approve/reject/hide/unhide) + countByStatus + averageRating. Pages: `/crm/reviews` standalone moderation (4-stat card + 6-col DataTable + 3 filter), `/crm/reviews/:id` detail (header action theo state, content + media grid, moderation timeline). ReviewRejectDialog với predefined reasons. Tab "Đánh giá (N)" trong product detail với avg rating + reviews approved. Sidebar group "CRM" mới với entry "Đánh giá".                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2026-05-20 | Sprint 9  | CRM 9e Tickets: types (6 status open/in_progress/pending_customer/resolved/closed/cancelled, 4 type exchange/return/complaint/inquiry, 4 priority, 3-level escalation, internal/public comments) + mock 60 tickets từ 24 seeds Việt thực tế + assignee từ IAM USERS filtered theo tenant + comments thread theo status + events trace transitions. TicketStore.transition + assign + escalate + setPriority + addComment + createTicket. Pages: `/crm/tickets` list 4-stat card + Tabs (Inbox / Của tôi / Tất cả) + 4 filter + 7-col DataTable; `/crm/tickets/:id` 2-col detail (description + items + comment thread 3-styled (customer/staff/internal) + compose với internal-note toggle bên trái; info + assignee Select + priority Select + customer/order + event history bên phải) + state-mapped action buttons. TicketEscalateDialog cho level 2/3 + reason. Sidebar CRM thêm "Yêu cầu hỗ trợ".                                                                                                                                                                                                       |
| 2026-05-20 | Sprint 9  | CRM 9f Inquiries: types (3 status new/replied/archived, 4 source web_contact/social/phone/email, reply channel email/phone/note) + mock 24 contact form seeds Việt thực tế (giờ mở cửa, shipping, sizing, KOC, B2B, refund policy, voucher, app, complaint...) với auto-match email/phone về CUSTOMERS để link sang hồ sơ. InquiryStore.setStatus + assign + addReply (note giữ status, reply non-note flip sang replied). Pages: `/crm/inquiries` list 6-col với 3-stat + 3 filter; `/crm/inquiries/:id` 2-col detail (message + reply thread amber/indigo styling + compose với channel select bên trái; sender card + matched customer link + assignee Select + info bên phải). Sidebar CRM thêm "Liên hệ".                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2026-05-20 | Sprint 9  | CRM 9g Activity log: thêm tab "Hoạt động (N)" thứ 5 vào customer-detail aggregate cross-source timeline. Sources: orders (placed + terminal status), reviews (submitted), tickets (created), inquiries (linked via matchedCustomerId), loyalty events. 6 pill filter buttons (Tất cả/Đơn/Đánh giá/Yêu cầu/Liên hệ/Loyalty) backed bằng signal. Mỗi entry có 'Xem chi tiết →' link tới source page tương ứng. Sort desc by timestamp.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 2026-05-20 | Sprint 10 | HR 10a Attendance foundation: Calendar component mới ở `shared/ui/calendar/` (month grid 7×6 vi-VN Monday-first, ng-template cell projection, prev/next nav + Today). Mock 28 user × ~50 ngày deterministic theo (userId, date) với 6 status (present/late/absent/on_leave/half_day/overtime). AttendanceStore (updateRecord audit, summaryByUser, findByTenant, applyLeaveDates). Page `/hr/attendance` Tabs 2-panel: Cá nhân (Combobox user + Calendar render dot/short status + giờ check-in/out + summary card), Tổng quan store (DataTable matrix rows=user × cols=day với cell color theo status). AttendanceEditDialog với time input native + ghi nhận editedBy/editedAt.                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2026-05-20 | Sprint 10 | HR 10b Leave Request: types/mock 40 request (5 type annual/sick/unpaid/maternity/compassionate × 4 status) đa user/tenant. LeaveRequestStore.decide() khi approve sẽ side-effect gọi AttendanceStore.applyLeaveDates() auto sinh attendance records on_leave cho range ngày. Pages: list 7-col với 4-stat card + Tabs (Cần duyệt/Của tôi/Tất cả) + 3 filter + inline approve/reject; form `new` với DateRangePicker + halfDay button group (chỉ enable khi sameDay) + reason Textarea + FileUpload attachment; detail với decision action + Timeline event (created → approved/rejected/cancelled).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2026-05-20 | Sprint 10 | HR 10c Incident: types (7 type equipment_failure/theft_loss/safety/customer_dispute/cash_discrepancy/security/other × 4 severity × 6 status reported→acknowledged→investigating→resolved→closed→cancelled, 3-level escalation) + mock 30 seeds Việt thực tế (POS lỗi, mất hàng, chênh lệch tiền, tranh chấp khách, an ninh...). IncidentStore với transition + assign + escalate + setSeverity + addComment + createIncident, mỗi action append event audit trail. Pages: list 7-col với 4-stat card (Mới/Đang xử lý/Đã giải quyết/Critical mở) + Tabs (Cần xử lý/Tôi báo cáo/Tất cả) + 4 filter; form `new` với type/severity Select + ImageUploadGrid; detail 2-col (desc + attachments gallery + comment thread + compose                                                                                                                                                                                                                                                                                                                                                                                   | info + assignee Select filter theo tenant + severity Select + Timeline). IncidentResolveDialog (resolutionNote required) + IncidentEscalateDialog (level 2/3 + reason). Sidebar group Nhân sự mở rộng 3 entry (Chấm công/Đơn nghỉ phép/Sự cố). |
| 2026-05-21 | Sprint 10 | HR 10d Attendance chart + role-based viewing: cài `apexcharts` + `ng-apexcharts`. Tạo `core/department/department.config.ts` map roleId→DepartmentKey (7 dept: management/sales/inventory/marketing/customer_service/audit/general) + helpers `canViewWholeCompany` (Super Admin + HQ Admin) / `isManagerRole`. Mở rộng IAM roles: thêm `role-cs-manager` + `role-cs-staff` cho phòng CSKH. AttendanceChartComponent dùng `<apx-chart>` line 3 series (Có mặt/Trễ/Vắng — bucket: present-bucket = present+overtime+half_day, late-bucket = late, absent-bucket = absent+on_leave), 2 mode (month: X=ngày 1..N của tháng, year: X=T1..T12), filter theo userId được lọc bởi (tenant + department). Tab thứ 3 "Biểu đồ" trong `/hr/attendance` với 3 filter Select (mode/department/tenant — tenant chỉ hiện cho admin xem-toàn-công-ty, manager non-admin chỉ thấy department của mình lock theo currentRoleId). Nút "Hôm nay" ở PageHeader slot với attribute `page-actions`, reset year+month về today + label tháng hiện tại. ApexCharts ~540kB lazy theo route attendance — không ảnh hưởng initial bundle. |
| 2026-05-21 | Sprint 10 | Bugfix HR PageHeader slot: 4 file (leave-requests-list, incidents-list, leave-request-detail, incident-detail) trước đó projection nút action vào PageHeader nhưng thiếu attribute `page-actions` selector → action không hiển thị. Bổ sung `page-actions` cho từng wrapper div hoặc app-button.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2026-05-21 | Sprint 10 | Bugfix HR 10d chart "Không có dữ liệu": 2 lỗi đan xen. (1) Tenant ID schema không đồng nhất — core/tenant.mock dùng `t-xxx` còn IAM (và attendance records sinh từ USERS) dùng `tenant-xxx`. Thêm `core/tenant/tenant-normalize.ts` với `normalizeTenantId()` và áp dụng ở AttendanceChartComponent.filteredUserIds + AttendanceComponent.matrixRows. (2) `chartDepartment` init mặc định `'all'` cho non-admin nhưng `departmentOptions` của họ chỉ chứa department riêng — fix init theo `departmentOfRole(currentRoleId())` khi không phải company viewer. Đăng kí TODO ở Sprint 12 để cleanup khi BE đồng bộ schema.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
