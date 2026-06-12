# Seed admin user

This project supports seeding an initial admin user for development.

## Requirements
- `server/.env` must include:
  - `MONGODB_URI`
  - `ADMIN_EMAIL`
  - `ADMIN_PASSWORD`
  - (optional) `ADMIN_NAME`

## Run
From `server/`:

```bash
npm run seed:admin
```

## Verify
Check the `users` collection in MongoDB for a document with `role: "admin"`.

