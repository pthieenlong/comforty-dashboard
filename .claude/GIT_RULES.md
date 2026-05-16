# Git Rules — Comforty Project

Tài liệu này định nghĩa quy tắc commit, branch, và PR cho project Comforty.
Mọi AI agent (Claude, Copilot, Cursor) và human developer phải tuân thủ.

---

## 1. Commit Message Convention

Project dùng **Conventional Commits** (enforced bởi commitlint).

### Format

```text
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Rules

- `type`: bắt buộc, viết thường, chọn từ danh sách bên dưới
- `scope`: optional, viết thường, là tên module/feature (vd: `auth`, `inventory`, `order`)
- `subject`: bắt buộc, viết thường, KHÔNG kết thúc bằng dấu chấm, KHÔNG quá 72 ký tự
- Dùng **imperative mood**: "add feature" KHÔNG phải "added feature" hoặc "adds feature"
- Tiếng Anh, không tiếng Việt

### Type allowed

| Type       | Khi nào dùng                             | Ví dụ                                                          |
| ---------- | ---------------------------------------- | -------------------------------------------------------------- |
| `feat`     | Tính năng mới cho user                   | `feat(auth): add JWT refresh token endpoint`                   |
| `fix`      | Sửa bug                                  | `fix(inventory): correct stock deduction in concurrent orders` |
| `refactor` | Refactor code không đổi behavior         | `refactor(order): extract state machine to separate class`     |
| `perf`     | Tối ưu performance                       | `perf(product): add Redis cache for catalog query`             |
| `test`     | Thêm/sửa test                            | `test(auth): add e2e test for login flow`                      |
| `docs`     | Chỉ thay đổi tài liệu                    | `docs(readme): update setup instructions`                      |
| `style`    | Format, semicolon, không đổi logic       | `style: apply prettier to all files`                           |
| `chore`    | Việc lặt vặt: deps, config, build script | `chore(deps): bump prisma to 5.20.0`                           |
| `ci`       | Sửa pipeline CI/CD                       | `ci: add postgres service to test job`                         |
| `build`    | Sửa build system, webpack, dockerfile    | `build: optimize docker image size`                            |
| `revert`   | Revert commit trước đó                   | `revert: revert "feat(auth): add OAuth"`                       |

### Subject — Bad vs Good

| ❌ Bad                      | ✅ Good                                        |
| --------------------------- | ---------------------------------------------- |
| `Update files`              | `feat(auth): add password reset flow`          |
| `fix bug`                   | `fix(order): prevent double payment on retry`  |
| `feat: Added new endpoint.` | `feat(api): add GET /products/:id endpoint`    |
| `WIP`                       | (Không commit WIP lên main; dùng draft branch) |

### Body (optional)

Dùng khi commit có context phức tạp cần giải thích:

```text
fix(inventory): correct stock deduction in concurrent orders

When two orders are placed simultaneously for the same SKU,
the previous logic read stock then wrote without locking,
causing oversell. Now uses SELECT FOR UPDATE inside transaction.

Closes #42
```

### Footer (optional)

- `Closes #N` / `Fixes #N` — link to issue
- `BREAKING CHANGE: <description>` — major version bump
- `Co-authored-by: Name <email>` — credit

---

## 2. Commit Granularity

### Một commit = một thay đổi logic độc lập

❌ KHÔNG gộp nhiều việc khác nhau:

```text
feat(auth): add login + fix typo in readme + update deps
```

✅ Tách thành 3 commits:

```text
feat(auth): add login endpoint
docs(readme): fix typo in setup section
chore(deps): bump nestjs to 10.4
```

### Quy tắc khi staging

- KHÔNG dùng `git add .` blindly. Luôn check `git status` trước
- Nếu có nhiều thay đổi loại khác nhau, dùng `git add <file>` riêng từng nhóm rồi commit
- Hoặc dùng `git add -p` để stage từng hunk

---

## 3. Branch Naming

### Format

```text
<type>/<short-description>
```

### Examples

- `feat/auth-jwt-refresh`
- `fix/inventory-race-condition`
- `refactor/order-state-machine`
- `chore/upgrade-prisma`

### Rules

- Lowercase, dùng dấu `-` ngăn từ
- KHÔNG dùng tên cá nhân (`long/feature-x`)
- KHÔNG dùng số ticket một mình (`PROJ-123`); kết hợp được: `feat/PROJ-123-add-payment`

### Protected branches

- `main` — production-ready, chỉ merge qua PR đã pass CI
- `dev` — integration branch, code đang phát triển

---

## 4. Pull Request Rules

### PR Title

Theo format Conventional Commits, giống commit message:

```text
feat(auth): add JWT refresh token mechanism
```

### PR Description Template

```markdown
## What

[Mô tả ngắn về thay đổi — 2-3 câu]

## Why

[Lý do thay đổi — link issue nếu có]

## How

[Approach kỹ thuật — bullet points]

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests pass locally
- [ ] Manual testing done

## Breaking Changes

[None / Mô tả breaking change nếu có]
```

### Merge Strategy

- **Squash merge** cho feature branch → `dev` (giữ history `dev` sạch)
- **Merge commit** cho `dev` → `main` (giữ context các feature)
- KHÔNG dùng rebase merge cho branch đã share

---

## 5. Forbidden Practices

❌ KHÔNG `git push --force` lên branch shared (`main`, `dev`)

- Chỉ được force push trên branch cá nhân chưa share
- Dùng `git push --force-with-lease` thay vì `--force` để an toàn hơn

❌ KHÔNG commit:

- Secrets, API keys, password (dùng `.env`, đã có trong `.gitignore`)
- Build artifacts (`dist/`, `node_modules/`)
- IDE config cá nhân (`.vscode/settings.json` — trừ khi share team)
- File `*.log`, `*.tmp`

❌ KHÔNG bypass hooks bằng `git commit --no-verify` trừ khi:

- Husky bị bug, đã verify code thực sự pass lint thủ công
- Comment lý do trong commit body

❌ KHÔNG commit trực tiếp lên `main` hoặc `dev` (luôn qua PR)

---

## 6. Rules cho AI Agent

Khi AI generate commit hoặc PR:

1. **Luôn chạy `git status` và `git diff` trước khi đề xuất commit message**
   — để hiểu chính xác thay đổi là gì

2. **Tách commit theo logic, không gộp**
   — nếu thay đổi gồm 2 việc khác nhau, đề xuất 2 commits

3. **KHÔNG tự ý commit hoặc push** mà chưa có xác nhận của user
   — chỉ generate message và lệnh, để user execute

4. **Subject phải mô tả WHAT, không phải HOW**
   - ❌ `feat(auth): use bcrypt to hash password`
   - ✅ `feat(auth): hash user password before storing`

5. **Khi có nhiều file thay đổi, đọc qua tất cả trước khi viết message**
   — tránh trường hợp message chỉ phản ánh 1 file

6. **Nếu user yêu cầu commit message tiếng Việt, từ chối lịch sự**
   — project rule là English commit, để consistent với CI và OSS norm
