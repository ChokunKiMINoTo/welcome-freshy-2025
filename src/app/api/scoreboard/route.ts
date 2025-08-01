import { NextResponse } from 'next/server';
import { createClient } from 'redis';
import GoogleSheetsService from '../../utils/googleSheetsService';

// Create Redis client
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redis.on('error', (err) => console.log('Redis Client Error', err));

export async function GET() {
  try {
    // Connect to Redis
    await redis.connect();

    // Check if we have cached data (cache for 5 minutes)
    const cacheKey = 'scoreboard:data';
    const cachedData = await redis.get(cacheKey);
    
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      await redis.disconnect();
      
      return NextResponse.json({
        success: true,
        data: parsedData,
        timestamp: new Date().toISOString(),
        cached: true,
      });
    }

    // Fetch fresh data from Google Sheets
    const sheetsService = new GoogleSheetsService();
    const scoreboardData = await sheetsService.getScoreboardData();

    // Cache the data for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(scoreboardData));

    // Disconnect from Redis
    await redis.disconnect();

    return NextResponse.json({
      success: true,
      data: scoreboardData,
      timestamp: new Date().toISOString(),
      cached: false,
    });
  } catch (error) {
    console.error('Error fetching scoreboard data:', error);
    try {
      await redis.disconnect();
    } catch (disconnectError) {
      console.error('Error disconnecting from Redis:', disconnectError);
    }
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch scoreboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 