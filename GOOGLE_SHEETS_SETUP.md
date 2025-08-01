# 📊 Google Sheets Integration Setup

## Scoreboard Real Data Integration

### Overview
The scoreboard now fetches real data from Google Sheets instead of using mock CSV data.

### 🎯 Google Sheets Structure

**Spreadsheet**: "เกม" (Game)
**Worksheets**:
- "เกมที่ 1 : เกมแน่จริงก็เรียงให้ตรง" → Game 1
- "เกมที่ 2 : เกมกระซิบต่อบอกให้ถูก" → Game 2  
- "เกมที่ 3 : เกมคําเดียวก็เกินพอ" → Game 3
- "เกมที่ 6 : Shadow Boxing" → Game 6

**Required Columns**:
- `ชื่อกลุ่มน้อง` (Team Name)
- `รวมคะแนน` (Total Score)

### 🔧 Environment Variables

Add these to your Vercel project settings:

```
GOOGLE_SHEETS_ID=your-spreadsheet-id
GOOGLE_PRIVATE_KEY_ID=9fee2870ce9af9d28f68b355bd2b377ec1001bb0
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCwhw1QEauuBheB\ndRGDUx4ab3dHMRkzlbV4aZfBuOkoCJYHbHUmzVX2a08BgwWjNlaY5GN2ISj+mv1M\nQ7jGmWRgWShQTYncVL2lihVKTFgy2jZDtXvuH13jLgnnyqEwV1jOnat3r13RxaKP\n4va+PD58xyoMoaylwQ/TW3DfO0IBnrul3uoihngI1bI643JwoP9utHcb5U/Jz5FF\nM2rfKiO0qCtA/BdBPtFxsBH9c3pCSdtZLOH0Qsfn72HY+1YISaYqZ7hbaMDiypmL\nBoEke3k/ktomoss3tF0tZv/VapB6wbPFb1dZlW4XWMurVmJCk9g3E+qhIF2tXs51\nhUpQxZYpAgMBAAECggEABb9inb9INY0pjxkBM3iYK9Ms8TVLipmZbtdn+LJCa9Ua\nZsPPbVkqhIX07L8tMVBlHGr0mWrgpf2Pjr/2ZbJRNC6No05gVTtbG2c2Dz+8xWxu\nb4uarTj55Ro2z1m9ICZP6WufzXCjyjSNo51dBvpOLIuNi8YTKX3HkUxSY1T6GV8E\nW9Hs23WlHfZh8RbS6DoNWzDf9+P0m7TFRcEG/P72mZ7mJMLt0XktV5jLRwnKrwgD\nhY6jICeuxF4GpQkFyyiTfPgmqjTw+9zNqJQIpJ4I1wsheoujyXS9ARqYckJ/e6iQ\nkOD+GJNLJEBjJrYLz3RXXOpiQntrjfCRTOE3pj3jSQKBgQDdnMk5XjUfqGIbaEfo\nfFbdxLUyL+Uv/Z9hbB8zSWejlXQz0H/xTmfWKsZwI5OxHD8TfGhJ2F2VGwzo1Bjz\nkdV6CYZrCt0AfxNhLYtHwYPuvl8NmVeu+O6YX3BSVlttzK7ucL+aWK0TaBTEQM8C\n1Q6jolFE9BvnTb+MAmvFKupZLQKBgQDL61ZvHbdunmCGbg8sFxYX/0T5SarsoVUz\nZ3g5gHNY9gNEKYNMCAkNTMZgJYczKjzIWo80atHfUFvSppYaYLwJtgdG6cb5iib4\nsb0P6w3CzVkWbvdevPW+BmsaumRTjLxDoML6D6MvNZxcJPs+NyzEndQfPlJhNx3w\n6j/oWXrWbQKBgQCid4UWJ7iugtWZ3jOJf053uvRT3MUbD8a+t3OQN+phBPpx2hNS\nJvb9DdL49zwZhenAMV6LdLH21CP8tTGtr2Zf14fSBd7LtF3Syn7nljlQ2AP7hkXA\nIwNYde90jZbtwjck20e8sfIA3jcLQbACFYxr7l3CPWwPgPJChKvZmoK/6QKBgGZr\nKNpePoccnLZoCM7IOZyL5YSfb22yCizrRwL6dPS1eyZ9Ayjo0EMR0IDx2FnmWOj4\nMvzMueRDZBsE+Fb/RvJJrpX7TKiArtoxyxd3o023/Yq66Rt4JKTwbFLcUw9znAsL\nb2JRAFDxyDqviFDTPXTzIFsg3hddq3gY70gvyPZxAoGAFLo1lKkn6J8/PoC1dgYy\nPaAvHPLZj6XonrKy0cpNSoLa8jbvUn4QPCucH4Wq1Q1tPOvJgNnBEoVw+VOUMHUf\nFXB6ZG91ScYwia7BT2L2F01fq50IMd26vazO6m1/5OWEFXfW/84bHQrPDUxEQ5Aa\nHmYveR1ngFjNM09up+UEYwE=\n-----END PRIVATE KEY-----\n"
GOOGLE_CLIENT_EMAIL=freshy2025@gsheet-379507.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=101908854330842493116
GOOGLE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/freshy2025%40gsheet-379507.iam.gserviceaccount.com
REDIS_URL=your-redis-url
```

### 📋 Setup Steps

#### 1. Get Google Sheets ID
1. Open your Google Sheets
2. Copy the ID from the URL: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`
3. Add as `GOOGLE_SHEETS_ID` environment variable

#### 2. Service Account Setup
1. The service account credentials are provided above
2. Add all the Google service account environment variables to Vercel
3. Share your Google Sheets with: `freshy2025@gsheet-379507.iam.gserviceaccount.com`

#### 3. Redis Setup
1. Use your existing Redis URL
2. The system will cache scoreboard data for 5 minutes

### 🚀 API Endpoints

#### Get Scoreboard Data
```bash
GET /api/scoreboard
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "teamName": "Team Name",
      "game1": 100,
      "game2": 150,
      "game3": 200,
      "game6": 300,
      "totalScore": 750,
      "rank": 1,
      "trend": "up",
      "lastUpdated": "2025-01-07T12:00:00.000Z",
      "achievements": "Game 1 Winner, High Scorer"
    }
  ],
  "timestamp": "2025-01-07T12:00:00.000Z",
  "cached": false
}
```

### 🔄 Data Flow

1. **Frontend** calls `/api/scoreboard`
2. **API** checks Redis cache first
3. **If cached**: Returns cached data
4. **If not cached**: 
   - Fetches from Google Sheets
   - Processes data from all 4 worksheets
   - Calculates total scores and rankings
   - Caches in Redis for 5 minutes
   - Returns processed data

### 📊 Data Processing

#### Worksheet Processing
- Finds `ชื่อกลุ่มน้อง` column for team names
- Finds `รวมคะแนน` column for scores
- Combines data from all 4 games
- Calculates total scores and rankings

#### Achievement System
- **Game Winners**: Teams with scores > 0 in each game
- **High Scorer**: Total score > 100
- **Elite Player**: Total score > 200

### 🛠️ Troubleshooting

#### Common Issues:

1. **"Required columns not found"**
   - Check that `ชื่อกลุ่มน้อง` and `รวมคะแนน` columns exist
   - Verify column names match exactly

2. **"Failed to fetch scoreboard data"**
   - Check Google Sheets permissions
   - Verify service account access
   - Check environment variables

3. **"Redis connection error"**
   - Verify REDIS_URL is set correctly
   - Check Redis service is running

#### Debug Steps:

1. **Test Google Sheets Access**:
   ```bash
   curl https://your-app.vercel.app/api/scoreboard
   ```

2. **Check Environment Variables**:
   - GOOGLE_SHEETS_ID
   - All GOOGLE_* variables
   - REDIS_URL

3. **Verify Service Account**:
   - All environment variables are set correctly
   - Google Sheets is shared with the service account

### 🎯 Benefits

- ✅ **Real-time Data**: Live scores from Google Sheets
- ✅ **Automatic Caching**: 5-minute cache for performance
- ✅ **Fallback Support**: Falls back to CSV if API fails
- ✅ **Vercel Compatible**: Works with serverless deployment
- ✅ **Multi-game Support**: Combines data from 4 different games

### 📝 Notes

- **Cache Duration**: 5 minutes (300 seconds)
- **Data Refresh**: Automatic on cache expiry
- **Error Handling**: Graceful fallback to CSV data
- **Performance**: Redis caching for fast responses
- **Security**: Service account credentials stored as environment variables 