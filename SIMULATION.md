# Synthetic dataset (demo)

The mess system was never deployed to a real hostel, so the admin dashboards
are exercised with a **simulated** user base rather than real adoption:

- ~200 synthetic students (`student_id` prefixed `SIM…`, e.g. `SIM2027001`)
- a daily job that marks their attendance at realistic rates
  (~62% breakfast, ~88% lunch, ~79% dinner, lower on weekends)

This is test/demo data. It is not real usage and is labelled as such wherever
it is described.

## One-time setup

```bash
node scripts/seedStudents.js 200          # create the synthetic students
node scripts/backfillAttendance.js 45     # ~45 days of history so charts fill in
```

Both scripts are idempotent and only ever write records whose `student_id`
starts with `SIM` — real students and their data are never touched.

## Keeping it running

Set `SIMULATE_ATTENDANCE=true` in the backend environment. On boot the server
schedules a daily job (21:30) that adds one more day of synthetic attendance.
With the flag unset, nothing runs.

## Storage stays bounded

The `attendance` collection has a **TTL index** (`createdAt`, 90 days), so old
rows delete themselves automatically. At ~200 students × 3 meals × 90 days that
caps the collection at roughly 50k small documents (a few MB) — well inside the
Atlas free tier.

## Removing it

```bash
node scripts/clearSimData.js               # deletes all SIM students + attendance
```
