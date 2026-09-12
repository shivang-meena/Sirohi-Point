# Sirohi Point commerce platform

One Expo React Native codebase powers the responsive web, Android, and iOS applications. A versioned NestJS API and PostgreSQL/Prisma data layer provide authentication, catalogue administration, inventory, banners, and checkout.

## Delivered application

- Responsive commerce home, catalogue, search, product details, wishlist, cart, delivery, and payment selection
- Customer email/password registration and login from **Your account**
- Protected customer order submission with server-calculated prices
- Separate role-protected administrator workspace
- Admin overview with user, product, and banner counts
- Product create/edit/remove, stock control, visibility control, and product image upload
- Homepage banner create/edit/remove, image, linked product, order, color, CTA, and visibility controls
- User list and reversible access removal
- Interactive homepage product slider with autoplay, swipe, pagination, and visible previous/next controls on web and mobile
- Centralized responsive light/dark design tokens shared by web, Android, and iOS
- Versioned REST API with validation, role guards, CORS, security headers, health checks, and Swagger
- PostgreSQL migrations for users, password hashes, inventory, products, images, orders, and banners

## Architecture

```text
apps/client        Expo SDK 57 + React Native + React Native Web
apps/api           NestJS API + Prisma + PostgreSQL
packages/contracts Shared Zod API contracts and TypeScript types
packages/domain    Shared commerce calculations
packages/design-tokens Shared responsive UI tokens
```

## Requirements

- Node.js 22.13 or newer
- npm 10 or newer
- Docker Desktop for local PostgreSQL persistence
- Android Studio or an Android device for local Android testing
- macOS/Xcode or EAS Build for iOS binaries

## Start with PostgreSQL

```powershell
npm install
docker compose up -d postgres
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/client/.env.example apps/client/.env
```

Set secure values for `AUTH_TOKEN_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `apps/api/.env`. Set `EXPO_PUBLIC_API_URL=http://localhost:3000` in `apps/client/.env`, then run:

```powershell
npm run prisma:generate --workspace=@sirohi/api
npm run prisma:deploy --workspace=@sirohi/api
npm run prisma:seed --workspace=@sirohi/api
npm run api
```

In a second terminal:

```powershell
npm run web
```

- Customer login: `http://localhost:8081/login`
- Customer signup: `http://localhost:8081/signup`
- Admin login: `http://localhost:8081/admin/login`

The admin account is created by the seed command from `ADMIN_EMAIL` and `ADMIN_PASSWORD`; no production credential is committed to Git. Without `DATABASE_URL`, the API can use its in-memory demonstration catalogue for local UI checks only.

## Validation and platform commands

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npm run android
npm run ios
```

The production build exports the web client and compiles the API. Android and iOS bundles can be verified from `apps/client` with:

```powershell
npx expo export --platform android
npx expo export --platform ios
```

## Product images

Administrators can upload product and banner images from the web admin. The API currently stores uploaded image data in PostgreSQL for a self-contained deployment. For higher traffic, replace this adapter with object storage while keeping the same `imageUrl` contract.

Bundled fallback product images remain in `apps/client/assets/images/products/` and are mapped in `apps/client/src/data/product-media.ts`.

## Mobile distribution

Run EAS commands from `apps/client`:

```powershell
npx eas-cli build --profile preview --platform android
npx eas-cli build --profile production --platform all
```

Store signing and submission require the organization's Expo, Google Play, and Apple Developer credentials.
