# Android role push notifications

Sirohi Point uses direct Firebase Cloud Messaging for Android push notifications. The Customer and B2B apps register their native FCM token with the API after an approved login. The Admin app creates a campaign for one role (`Customer` maps to `CUSTOMER`; `B2B` maps to `BUSINESS`). No browser or iOS notification is registered.

## Credentials

Create one Firebase project and register these Android package IDs:

- `com.sirohipoint.customer`
- `com.sirohipoint.b2b`

Place each generated `google-services.json` in its corresponding app directory for a local Android build, or configure the same path as an EAS secret/file. Set `EXPO_PUBLIC_PUSH_ENABLED=true` only after the Firebase Android files are present.

Create a Firebase service account for the API and put its values in `apps/api/.env`:

```dotenv
FCM_ENABLED=true
FCM_PROJECT_ID=your-project-id
FCM_CLIENT_EMAIL=firebase-adminsdk-...@your-project-id.iam.gserviceaccount.com
FCM_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
PUSH_WORKER_ENABLED=true
```

Never put the service-account values in a mobile app or a public environment variable.

## Database and processes

From `apps/api`, generate Prisma and deploy the additive migration:

```powershell
npm run prisma:generate
npm run prisma:deploy
```

Run the HTTP API and the worker as separate long-running processes:

```powershell
npm run start:prod
npm run worker
```

The worker checks due campaigns every 15 seconds, persists delivery rows and resumes after restart. A serverless HTTP process without a continuously running worker cannot dispatch scheduled campaigns.

## Android build

Install the app dependencies with each app's package manager, then build a development or release Android binary. Expo Go cannot verify remote push notifications on Android SDK 53+.

```powershell
npx expo run:android
```

Use a physical device or an Android emulator with Google Play Services. The first app launch asks for notification permission. A denied permission does not block login.

## Manual checks

1. Register one Customer device and one approved B2B device.
2. Create and send a Customer campaign; confirm only the Customer device receives it.
3. Create and send a B2B campaign; confirm only the approved B2B device receives it.
4. Test the app in foreground, background and closed states.
5. Schedule a campaign at least one minute ahead and restart the worker before it is due.
6. Log out and confirm the device is deactivated; log in with another account and confirm the old account is not targeted.
7. Disable notification permission and confirm registration becomes inactive without breaking login.
8. Tap a notification and confirm it opens the normal authenticated app entry flow.

Campaign counts mean FCM accepted, failed or skipped. An accepted response does not prove that Android displayed the notification.
