/**
 * Normalize tenant IDs across the two mock sources.
 *
 * Project currently has two parallel tenant ID conventions:
 *  - `core/tenant/tenant.mock.ts` uses `t-hq`, `t-q1`, `t-q7`, ...
 *  - `features/iam/iam.mock.ts` uses `tenant-hq`, `tenant-q1`, ...
 *
 * IAM-derived data (user.assignments) and most feature mocks (attendance,
 * leave-request, incident, order, customer) use the second form, while
 * TenantStore + the topbar switcher use the first. Until backend unifies
 * them, normalize to the `tenant-*` form for cross-feature comparisons.
 *
 * TODO(post-BE-integration): drop this once a single canonical tenant ID
 * scheme is established.
 */
export function normalizeTenantId(id: string): string {
  if (id.startsWith('tenant-')) return id;
  if (id.startsWith('t-')) return `tenant-${id.slice(2)}`;
  return id;
}
