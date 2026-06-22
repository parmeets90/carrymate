# CarryMate — External Services Setup

One-time setup for **Twilio** (OTP), **Supabase** (Postgres + Storage), and **Render** (deploy).
Do these in order. The backend already has the code; you only provide credentials.

> **Where the backend reads env:** create the file at **`apps/backend/.env`** (copy `.env.example`).
> The backend and Prisma both run with that folder as their working directory.

```bash
cp .env.example apps/backend/.env   # then edit apps/backend/.env
```

---

## 1) Supabase — Database (Postgres)

1. Go to https://supabase.com → **New project**. Pick region **Mumbai (ap-south-1)** if available; set a strong **database password** and save it.
2. Wait for provisioning, then open **Project Settings → Database → Connection string** and select the **"Connection pooling"** view. You'll copy two URLs (replace `[YOUR-PASSWORD]`):
   - **Transaction pooler** (port **6543**) → `DATABASE_URL`. Append `?pgbouncer=true&connection_limit=1`.
   - **Session pooler** (port **5432**) → `DIRECT_URL` (used only for migrations).
3. Put both into `apps/backend/.env`:
   ```
   DATABASE_URL=postgresql://postgres.<ref>:<pwd>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
   DIRECT_URL=postgresql://postgres.<ref>:<pwd>@aws-0-<region>.pooler.supabase.com:5432/postgres
   ```
4. Create the tables and seed:
   ```bash
   npm run db:generate
   npm run db:migrate          # when prompted for a name, type: init
   npm run db:seed
   ```
5. Verify in Supabase → **Table editor** (you should see `users`, `travel_routes`, `delivery_requests`, etc., and the seeded admin/sender/traveler rows).

---

## 2) Supabase — Storage (files)

1. Supabase → **Storage → New bucket** → name it **`carrymate`** → keep it **Private** → Create.
2. Supabase → **Project Settings → API**, copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** secret key (under "Project API keys") → `SUPABASE_SERVICE_ROLE_KEY`
     ⚠️ Server-side only — never put the service_role key in the mobile/admin apps.
3. Add to `apps/backend/.env`:
   ```
   SUPABASE_URL=https://<ref>.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<service_role key>
   STORAGE_BUCKET=carrymate
   ```
   (Uploads use `POST /v1/uploads/presign` → returns a signed URL the app PUTs the file to.)

---

## 3) Twilio — OTP / SMS

1. Sign up at https://twilio.com and verify your email/phone.
2. **Console dashboard** → copy **Account SID** and **Auth Token**.
3. **Phone Numbers → Buy a number** with **SMS** capability (or set up a Messaging Service). Copy it in E.164, e.g. `+1XXXXXXXXXX` → `TWILIO_FROM_NUMBER`.
4. To deliver to **Indian (+91)** numbers: **Messaging → Settings → Geo Permissions** → enable **India**.
5. Add to `apps/backend/.env`:
   ```
   TWILIO_ACCOUNT_SID=ACxxxxxxxx
   TWILIO_AUTH_TOKEN=xxxxxxxx
   TWILIO_FROM_NUMBER=+1XXXXXXXXXX
   ```

> **Heads-up on India SMS:** Twilio **trial** accounts only send to *verified* numbers, and reliable A2P SMS to India often needs sender/DLT registration (an Indian regulatory step). For now you can leave Twilio **blank** — the backend prints the OTP to its console in dev so you can test the full flow without spending anything. Add Twilio when you're ready for real delivery.

---

## 4) Run locally (smoke test)

```bash
npm run backend:dev     # http://localhost:3000  (GET /health → {"status":"healthy"})
npm run admin:dev       # http://localhost:5173  (log in with the seeded admin +910000000000)
npm run mobile:start    # then: npm run mobile:android  (emulator/device)
```
Dev OTP: when Twilio is blank, the code is printed in the **backend console**.
Admin login: phone `+910000000000` (seeded admin) → use the OTP from the backend console.

---

## 5) Render — Deploy

1. https://render.com → **New → Blueprint** → connect the GitHub repo `parmeets90/carrymate`. It reads `render.yaml` and proposes two services: **carrymate-api** (web) + **carrymate-admin** (static).
2. Set the secret env vars on **carrymate-api** (dashboard → Environment):
   `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and (optional) the `TWILIO_*` keys. `JWT_*` are auto-generated.
3. Set on **carrymate-admin**: `VITE_API_BASE_URL` = your API URL (e.g. `https://carrymate-api.onrender.com`).
4. **Apply / Deploy.** The API runs `prisma migrate deploy` before starting; health check is `/health`.

> Free Render web services sleep when idle (first request after idle is slow) — fine for now.

---

## Checklist
- [ ] `apps/backend/.env` created with DATABASE_URL + DIRECT_URL (Supabase)
- [ ] `npm run db:migrate` + `db:seed` succeeded; tables visible in Supabase
- [ ] `carrymate` storage bucket + SUPABASE_URL/SERVICE_ROLE_KEY set
- [ ] (optional) Twilio keys set, India geo-permission enabled
- [ ] `GET /health` returns healthy locally
- [ ] Render blueprint deployed; API health green; admin loads
