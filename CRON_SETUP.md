# Automated Attendance Cron Job Setup

This system automatically marks attendance for student "231220041" at random times throughout the day with random meal types (breakfast, lunch, dinner).

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the backend root directory with the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
BASE_URL=http://localhost:5000
```

### 2. Dependencies

The following packages are automatically installed:

- `node-cron`: For scheduling tasks
- `axios`: For making HTTP requests

### 3. How It Works

#### Automatic Scheduling

The cron job runs at the following times:

- **Breakfast**: 7-9 AM (hourly)
- **Lunch**: 12-2 PM (hourly)
- **Dinner**: 7-9 PM (hourly)
- **Random times**: 6 AM, 9 AM, 3 PM, 6 PM

#### Random Behavior

- Each execution makes 1-3 random API calls
- Each call marks attendance for a random meal type (breakfast/lunch/dinner)
- Uses current date automatically

#### API Endpoint

The cron job calls: `POST /api/attendance/internal`

- No authentication required (internal endpoint)
- Body: `{ student_id: "231220041", date: "YYYY-MM-DD", attendance: "breakfast|lunch|dinner" }`

## Testing

### Manual Testing

You can test the cron job manually using the test endpoint:

```bash
curl -X POST http://localhost:5000/api/cron/test-attendance \
  -H "Content-Type: application/json"
```

### Check Status

```bash
curl -X GET http://localhost:5000/api/cron/status
```

### Enable Test Mode

For frequent testing, uncomment the test cron job in `services/cronService.js`:

```javascript
// Uncomment for testing - runs every 2 minutes
cron.schedule("*/2 * * * *", async () => {
  console.log("\n🧪 Test cron triggered at:", new Date().toLocaleString());
  await this.executeRandomAttendanceMarkings();
});
```

## Security Features

1. **Internal Route**: Uses separate `/api/attendance/internal` endpoint
2. **Request Validation**: All requests are validated before processing
3. **No External Access**: Internal endpoint is meant for server-side use only

## Monitoring

The application logs all cron job activities:

- ✅ Successful attendance markings
- ⚠️ Failed attempts (duplicate entries, etc.)
- 📊 Summary of each execution batch
- 🎲 Random execution details

## Configuration

### Changing Student ID

Edit `services/cronService.js`:

```javascript
this.studentId = "your_student_id_here";
```

### Adjusting Schedule

Modify the cron expressions in `cronService.js`:

```javascript
// Example: Run every 30 minutes during meal hours
cron.schedule("*/30 7-9,12-14,19-21 * * *", async () => {
  await this.executeRandomAttendanceMarkings();
});
```

### Cron Expression Format

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, 0 or 7 is Sunday)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

## Troubleshooting

### Common Issues

1. **"Student not found"**

   - Verify student "231220041" exists in the database
   - Check the student collection/model

2. **"Attendance already marked"**

   - This is expected behavior - the system prevents duplicate entries
   - The cron will try different meal types automatically

3. **Network errors**
   - Check if the server is running on the correct port
   - Verify `BASE_URL` in environment variables

### Logs

Monitor the console output for detailed logs of all cron job activities.
