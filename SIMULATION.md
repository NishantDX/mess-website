# Synthetic dataset (demo)

The mess system was never deployed to a real hostel, so the admin dashboards
are exercised with a **simulated** user base rather than real adoption:

- ~200 synthetic students (`student_id` prefixed `SIM…`, e.g. `SIM2027001`)
- a daily job that marks their attendance at realistic rates
  (~62% breakfast, ~88% lunch, ~79% dinner, lower on weekends)

This is test/demo data. It is not real usage and is labelled as such wherever
it is described.

## Setup — just one env var

Set `SIMULATE_ATTENDANCE=true` in the backend environment and (re)deploy.

On first boot with that flag, the server **self-seeds**: creates the ~200 SIM
students and backfills ~45 days of attendance in the background (it doesn't
delay startup). It then schedules a daily job (21:30) that adds one more day.
All of it is idempotent — it only runs the seed/backfill when the data isn't
already there, and it only ever writes `SIM`-prefixed records.

Optional overrides: `SIM_STUDENT_COUNT` (default 200), `SIM_BACKFILL_DAYS`
(default 45).

### Or run it manually (needs a local clone with MONGO_URI)

```bash
node scripts/seedStudents.js 200
node scripts/backfillAttendance.js 45
```

## Storage stays bounded

The `attendance` collection has a **TTL index** (`createdAt`, 90 days), so old
rows delete themselves automatically. At ~200 students × 3 meals × 90 days that
caps the collection at roughly 50k small documents (a few MB) — well inside the
Atlas free tier.

## Removing it

```bash
node scripts/clearSimData.js               # deletes all SIM students + attendance
```
