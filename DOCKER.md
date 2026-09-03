# Running with Docker

Brings up the API together with its own MongoDB and Redis so a new machine
needs nothing installed but Docker.

```bash
cp .env.example .env      # fill in Firebase / Razorpay values
docker compose up --build
```

- API: http://localhost:5000
- MongoDB: localhost:27017 (data persisted in the `mongo-data` volume)
- Redis: localhost:6379

`docker-compose.yml` overrides `MONGO_URI` and `REDIS_URL` to point at the
containers; everything else comes from `.env`.

## Caching

The menu endpoints (`GET /api/menu/week`, `/day/:day`, `/date/:date`) read
through Redis. Responses carry an `X-Cache: HIT | MISS` header. A menu write
(`POST /api/menu`) busts the affected keys.

Caching is **optional**: with no `REDIS_URL` set the app runs exactly as before
and every read goes to MongoDB. If `REDIS_URL` is set but Redis is down, the
cache layer fails quietly and falls back to MongoDB.

### Enabling it on Render

Add a Redis instance (Render Key Value, Upstash, etc.) and set `REDIS_URL` in
the backend service's environment. Nothing else changes.
