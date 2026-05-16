# CODE_RULES.md — Comforty API

Quy tắc viết code bắt buộc cho toàn bộ project. Mọi code mới phải tuân theo tài liệu này.

---

## 1. Naming Conventions

### Files & Directories

```text
kebab-case cho tất cả file và thư mục
product.service.ts        ✓
product.controller.ts     ✓
productService.ts         ✗
ProductService.ts         ✗
```

### Classes

| Loại        | Pattern               | Ví dụ                                  |
| ----------- | --------------------- | -------------------------------------- |
| Controller  | `{Domain}Controller`  | `ProductController`                    |
| Service     | `{Domain}Service`     | `ProductService`                       |
| Repository  | `{Domain}Repository`  | `ProductRepository`                    |
| Module      | `{Domain}Module`      | `ProductModule`                        |
| DTO         | `{Action}{Domain}DTO` | `CreateProductDTO`, `UpdateProductDTO` |
| Guard       | `{Name}Guard`         | `JwtAuthGuard`, `TenantGuard`          |
| Interceptor | `{Name}Interceptor`   | `AuditInterceptor`                     |
| Filter      | `{Name}Filter`        | `HttpExceptionFilter`                  |
| Decorator   | `{name}` (camelCase)  | `currentUser`, `tenantId`              |
| Enum        | `{Name}` (PascalCase) | `OrderStatus`, `PaymentMethod`         |
| Interface   | `I{Name}`             | `IApiResponse`, `IJwtPayload`          |
| Type        | `{Name}` (PascalCase) | `PaginatedResult`, `ApiResponse`       |

> **Lưu ý DTO**: suffix `DTO` viết **hoa toàn bộ** (không phải `Dto`).

### Variables & Functions

```typescript
// camelCase cho biến và function
const tenantId = request.headers['x-tenant-id'];
function calculateOrderTotal(items: OrderItem[]): number {}

// SCREAMING_SNAKE_CASE cho constants
const MAX_REFRESH_TOKEN_TTL = 60 * 60 * 24 * 7;
const DEFAULT_PAGE_SIZE = 20;
```

---

## 2. Import & Path Alias

Luôn dùng alias `@/` thay vì relative path:

```typescript
// ✓ Đúng
import { PrismaService } from '@/prisma/prisma.service';
import { CreateProductDTO } from '@/modules/product/dto/create-product.dto';

// ✗ Sai
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateProductDTO } from '../../dto/create-product.dto';
```

Cấu hình alias trong `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

---

## 3. Module Structure

Mỗi module phải có cấu trúc chuẩn:

```text
modules/product/
├── dto/
│   ├── create-product.dto.ts
│   ├── update-product.dto.ts
│   └── query-product.dto.ts
├── product.controller.ts
├── product.service.ts
├── product.repository.ts    (optional — nếu query phức tạp)
├── product.module.ts
└── product.service.spec.ts
```

---

## 4. API Response Format

Mọi API response đều phải trả về theo cấu trúc `ApiResponse<T>`:

```typescript
interface IApiResponse<T = unknown> {
  success: boolean;
  data: T;
  statusCode: number;
  requestId: string; // UUID v4
  timestamp: Date;
}
```

**Ví dụ response thành công:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Áo sơ mi trắng"
  },
  "statusCode": 200,
  "requestId": "a1b2c3d4-...",
  "timestamp": "2026-05-04T10:00:00.000Z"
}
```

**Ví dụ response lỗi:**

```json
{
  "success": false,
  "data": null,
  "statusCode": 404,
  "requestId": "a1b2c3d4-...",
  "timestamp": "2026-05-04T10:00:00.000Z",
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Không tìm thấy sản phẩm với ID đã cho"
  }
}
```

Implement qua `ResponseInterceptor` đặt ở `src/common/interceptors/response.interceptor.ts`.

---

## 5. Error Handling

### Custom Exception Classes

Tạo exception riêng cho từng domain, extends từ NestJS built-in:

```typescript
// src/common/exceptions/app.exception.ts
export class AppException extends HttpException {
  constructor(
    readonly errorCode: string,
    message: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ) {
    super({ errorCode, message }, statusCode);
  }
}

// src/modules/product/exceptions/product.exception.ts
export class ProductNotFoundException extends AppException {
  constructor(id: string) {
    super('PRODUCT_NOT_FOUND', `Không tìm thấy sản phẩm: ${id}`, HttpStatus.NOT_FOUND);
  }
}
```

### Exception Filter

`HttpExceptionFilter` ở `src/common/filters/http-exception.filter.ts` chuyển đổi mọi exception thành `IApiResponse` format chuẩn.

### Error Code Convention

```text
{DOMAIN}_{ACTION}_{REASON}

PRODUCT_NOT_FOUND
PRODUCT_CREATE_FAILED
ORDER_CANCEL_FORBIDDEN
AUTH_TOKEN_EXPIRED
TENANT_ACCESS_DENIED
```

### Nguyên tắc

- **Không** dùng try/catch để nuốt lỗi — luôn throw hoặc log rõ ràng
- **Không** throw string — luôn throw exception class
- **Không** expose stack trace ở production (`NODE_ENV=production`)
- Validation lỗi dùng `class-validator` + `ValidationPipe` global — không validate thủ công

---

## 6. DTO & Validation

```typescript
import { IsString, IsNotEmpty, IsOptional, IsUUID, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDTO {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsUUID()
  categoryId: string;
}
```

- Dùng `@Transform` để sanitize input (trim string, lowercase email, v.v.)
- Dùng `@Expose()` + `excludeExtraneousValues: true` khi cần whitelist output
- Tất cả ID field phải validate bằng `@IsUUID()`

---

## 7. Service Layer Rules

```typescript
@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findById(id: string, tenantId: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) throw new ProductNotFoundException(id);
    return product;
  }
}
```

- Service **không** biết về HTTP — không import `@nestjs/common` Response object
- Service **không** xây dựng raw SQL — dùng Prisma
- Business logic đặt ở Service, **không** ở Controller hay Repository
- Mọi method public của Service đều phải có unit test tương ứng

---

## 8. Controller Layer Rules

```typescript
@ApiTags('products')
@Controller('products')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @TenantId() tenantId: string) {
    return this.productService.findById(id, tenantId);
  }
}
```

- Controller chỉ: nhận request → gọi service → trả kết quả
- Không có logic business trong controller
- Dùng `ParseUUIDPipe` cho tất cả ID param
- Dùng custom decorator `@TenantId()` để lấy tenant context

---

## 9. Comments

**Mặc định không viết comment.** Chỉ comment khi WHY thực sự không hiển nhiên:

```typescript
// ✓ Nên comment — lý do kỹ thuật không rõ ràng từ code
// Prisma không support upsert với composite unique khi một field là nullable
// nên phải findFirst + create/update thủ công
const existing = await this.prisma.inventoryStock.findFirst({ ... });

// ✗ Không cần comment — code đã tự giải thích
// Tìm sản phẩm theo ID
const product = await this.productService.findById(id);
```

---

## 10. General Rules

- **Không** thêm `any` type — dùng `unknown` nếu thực sự không biết type
- **Không** dùng `!` non-null assertion trừ khi đã guard trước đó
- **Không** export class/function không dùng đến
- **Không** để `console.log` trong code production — dùng NestJS Logger
- Prefer `async/await` hơn Promise chain
- Prefer `const` hơn `let`, tránh `var`
- Destructure khi có thể: `const { id, name } = product`
