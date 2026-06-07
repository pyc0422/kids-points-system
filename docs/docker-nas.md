# NAS / Docker Deployment

The app builds as a standalone Next.js server. It serves both the current authenticated app and the Kindle app at `/kindle`.

The container listens on port `3000`.

## Environment

Create an env file on the NAS, for example `.env.production`, or enter the same values in the NAS container UI:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
KINDLE_FAMILY_HOUSE_ID=
KINDLE_FAMILY_PIN=
KINDLE_SESSION_SECRET=
KINDLE_ACTOR_MEMBER_ID=
KINDLE_COOKIE_SECURE=
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=
```

Use these values:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase Project Settings > API > Project URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Supabase public/anon/publishable key.
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase `service_role` secret key. Do not use the anon/publishable key here.
- `KINDLE_FAMILY_HOUSE_ID`: the UUID from `public.houses.id`.
- `KINDLE_FAMILY_PIN`: the PIN your family enters at `/kindle/login`.
- `KINDLE_SESSION_SECRET`: a private random cookie-signing secret.
- `KINDLE_ACTOR_MEMBER_ID`: optional parent/admin `public.house_members.id` for Kindle audit rows.
- `KINDLE_COOKIE_SECURE`: set to `false` only when serving the app over plain HTTP.
- `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`: stable key for Next.js Server Actions.

`KINDLE_ACTOR_MEMBER_ID` is optional. When omitted, the Kindle app uses the first parent/admin member in the configured house for audit ledger rows.
Set `KINDLE_COOKIE_SECURE=false` only if the NAS serves the app over plain HTTP.

Generate `KINDLE_SESSION_SECRET` and `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` with:

```bash
openssl rand -base64 32
```

Find the house id and optional actor member id in Supabase SQL Editor:

```sql
select id, name, invite_code
from public.houses;

select id, display_name, role
from public.house_members
where house_id = 'YOUR_HOUSE_ID';
```

Run the database migrations before starting the container. The Kindle app requires:

```sql
-- Run the migration file:
-- supabase/migrations/0011_kindle_next_items.sql
```

## Build And Run

```bash
docker build -t kids-points-system .
docker run --rm -p 3000:3000 --env-file .env.production kids-points-system
```

## Synology Container Manager

If you build the image on a Mac and upload it to Synology, build it for the NAS CPU architecture. Otherwise Container Manager can stop with:

```text
exec /usr/local/bin/docker-entrypoint.sh: exec format error
```

Most Intel/AMD Synology models need `linux/amd64`:

```bash
docker buildx build --platform linux/amd64 -t kids-points-system:latest --load .
docker save kids-points-system:latest -o kids-points-system-amd64.tar
```

ARM Synology models need `linux/arm64`:

```bash
docker buildx build --platform linux/arm64 -t kids-points-system:latest --load .
docker save kids-points-system:latest -o kids-points-system-arm64.tar
```

In Synology Container Manager:

1. Go to **Image > Add > Add from file**.
2. Upload the matching `.tar` file.
3. Create a container from `kids-points-system:latest`.
4. Set port mapping to local `3000` -> container `3000`.
5. Add the environment variables from the Environment section.
6. Start the container.

If `http://NAS_IP:3000/kindle` says connection refused:

1. In Container Manager, confirm the container is still running.
   - If logs show `Local: http://kids-points-system-1:3000`, rebuild with the latest Dockerfile. The command now forces Next.js to bind to `0.0.0.0` even when Synology sets the container hostname.
2. Open the container details and check **Port Settings**:
   - Local port: `3000`
   - Container port: `3000`
   - Protocol: `TCP`
3. If Synology firewall is enabled, allow TCP port `3000` in **Control Panel > Security > Firewall**.
4. If local port `3000` is already in use, map another NAS port to container `3000`, for example local `3001` -> container `3000`, then open `http://NAS_IP:3001/kindle`.
5. Check the container logs for startup errors.

Open:

- Main app: `http://NAS_IP:3000/`
- Kindle app: `http://NAS_IP:3000/kindle`

For a NAS reverse proxy, forward HTTPS traffic to container port `3000`.

If the reverse proxy provides HTTPS, leave `KINDLE_COOKIE_SECURE` blank or set it to `true`. If you access the app directly over plain HTTP, set `KINDLE_COOKIE_SECURE=false`.

Keep Supabase service-role and Kindle PIN values out of the browser and out of committed files.
