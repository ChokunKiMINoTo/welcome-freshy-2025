# 🚀 Vercel Deployment Setup Guide

## Venue Status Updates Fix

### Problem
Vercel's serverless functions have a **read-only file system**, so venue status updates that try to write to CSV files won't work.

### Solution: Vercel KV Database

We've implemented **Vercel KV** (Redis-based key-value store) to handle venue status updates.

## 🔧 Setup Steps

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Create Vercel KV Database
```bash
vercel kv create
```
- Choose a name for your database (e.g., `freshy-venues`)
- Select the region closest to your users

### 4. Link KV to Your Project
```bash
vercel kv link
```
- Select your project
- Choose the database you created

### 5. Initialize Venue Data
After deployment, call the initialization API:
```bash
curl -X POST https://your-app.vercel.app/api/venues/init
```

Or visit: `https://your-app.vercel.app/api/venues/init` in your browser

## 🔄 How It Works

### Before (Broken on Vercel):
```typescript
// ❌ This doesn't work on Vercel
await fs.writeFile(csvPath, updatedCSV, 'utf-8');
```

### After (Works on Vercel):
```typescript
// ✅ This works on Vercel
await kv.set(`venue:${id}`, updatedVenue);
```

## 📊 API Endpoints

### Update Venue Status
```bash
POST /api/venues/update
{
  "id": "venue-id",
  "status": "active"
}
```

### Get All Venues
```bash
GET /api/venues/update
```

### Initialize Venue Data
```bash
POST /api/venues/init
```

## 🎯 Benefits

- ✅ **Works on Vercel**: No file system writes needed
- ✅ **Real-time updates**: Instant status changes
- ✅ **Scalable**: Handles multiple concurrent updates
- ✅ **Reliable**: Redis-based storage
- ✅ **Free tier**: Available for small projects

## 🔍 Troubleshooting

### If venue updates still don't work:

1. **Check KV Connection**:
   ```bash
   vercel kv ls
   ```

2. **Verify Environment Variables**:
   - `KV_URL`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`

3. **Re-initialize Data**:
   ```bash
   curl -X POST https://your-app.vercel.app/api/venues/init
   ```

### Alternative Solutions

If Vercel KV doesn't work, consider:

1. **Supabase** (PostgreSQL database)
2. **Google Cloud Storage** (file storage)
3. **AWS S3** (file storage)
4. **Client-side state** (temporary solution)

## 📝 Environment Variables

Add these to your Vercel project settings:

```
KV_URL=your-kv-url
KV_REST_API_URL=your-rest-api-url
KV_REST_API_TOKEN=your-token
KV_REST_API_READ_ONLY_TOKEN=your-read-only-token
```

## 🚀 Deployment

1. Push your changes to GitHub
2. Vercel will automatically deploy
3. Run the initialization API
4. Test venue status updates

Your venue status updates should now work perfectly on Vercel! 🎉 