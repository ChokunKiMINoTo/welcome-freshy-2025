import { NextResponse } from 'next/server';
import { createClient } from 'redis';
import { promises as fs } from 'fs';
import path from 'path';

// Create Redis client
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redis.on('error', (err) => console.log('Redis Client Error', err));

export async function POST() {
  try {
    // Read the CSV file
    const csvPath = path.join(process.cwd(), 'public', 'data', 'venues.csv');
    const csvContent = await fs.readFile(csvPath, 'utf-8');
    
    // Parse CSV and convert to JSON
    const lines = csvContent.trim().split('\n');
    const venues = [];
    
    // Connect to Redis
    await redis.connect();
    
    for (let i = 1; i < lines.length; i++) {
      const columns = parseCSVLine(lines[i]);
      const venue = {
        id: columns[0],
        name: columns[1],
        status: columns[2],
        activities: columns[3],
        color: columns[4],
        lastUpdated: new Date().toISOString()
      };
      
      venues.push(venue);
      
      // Store individual venue
      await redis.set(`venue:${venue.id}`, JSON.stringify(venue));
    }
    
    // Store venues list
    await redis.set('venues:list', JSON.stringify(venues));
    
    // Disconnect from Redis
    await redis.disconnect();
    
    return NextResponse.json({
      success: true,
      message: `Initialized ${venues.length} venues in Redis`,
      venues: venues
    });
    
  } catch (error) {
    console.error('Error initializing venues:', error);
    try {
      await redis.disconnect();
    } catch (disconnectError) {
      console.error('Error disconnecting from Redis:', disconnectError);
    }
    return NextResponse.json(
      { error: 'Failed to initialize venues', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Helper function to parse CSV line properly
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 2;
      } else {
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }
  
  result.push(current.trim());
  return result;
} 