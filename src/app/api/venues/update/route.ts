import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'redis';

interface VenueData {
  id: string;
  name: string;
  status: string;
  activities: string;
  color: string;
  lastUpdated: string;
}

// Create Redis client
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redis.on('error', (err) => console.log('Redis Client Error', err));

export async function POST(request: NextRequest) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: id and status' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['active', 'break', 'setup', 'maintenance'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
        { status: 400 }
      );
    }

    // Connect to Redis
    await redis.connect();

    // Update venue status in Redis
    const venueKey = `venue:${id}`;
    const venueData = await redis.get(venueKey);
    
    if (!venueData) {
      await redis.disconnect();
      return NextResponse.json(
        { error: `Venue with id '${id}' not found` },
        { status: 404 }
      );
    }

    // Parse and update the venue data
    const venue = JSON.parse(venueData) as VenueData;
    const updatedVenue: VenueData = {
      ...venue,
      status: status,
      lastUpdated: new Date().toISOString()
    };

    // Store updated venue data
    await redis.set(venueKey, JSON.stringify(updatedVenue));

    // Also update the venues list for easy retrieval
    const venuesListKey = 'venues:list';
    const venuesListData = await redis.get(venuesListKey);
    let venuesList: VenueData[] = venuesListData ? JSON.parse(venuesListData) : [];
    
    // Update the specific venue in the list
    venuesList = venuesList.map((venue: VenueData) => 
      venue.id === id ? { ...venue, status: status, lastUpdated: new Date().toISOString() } : venue
    );
    
    await redis.set(venuesListKey, JSON.stringify(venuesList));

    // Disconnect from Redis
    await redis.disconnect();

    return NextResponse.json({
      success: true,
      message: `Venue '${id}' status updated to '${status}'`,
      timestamp: new Date().toISOString(),
      venue: updatedVenue
    });

  } catch (error) {
    console.error('Error updating venue status:', error);
    try {
      await redis.disconnect();
    } catch (disconnectError) {
      console.error('Error disconnecting from Redis:', disconnectError);
    }
    return NextResponse.json(
      { error: 'Failed to update venue status' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve all venues
export async function GET() {
  try {
    // Connect to Redis
    await redis.connect();

    const venuesListKey = 'venues:list';
    const venuesListData = await redis.get(venuesListKey);
    const venues: VenueData[] = venuesListData ? JSON.parse(venuesListData) : [];
    
    // Disconnect from Redis
    await redis.disconnect();
    
    return NextResponse.json({
      success: true,
      venues: venues
    });
  } catch (error) {
    console.error('Error retrieving venues:', error);
    try {
      await redis.disconnect();
    } catch (disconnectError) {
      console.error('Error disconnecting from Redis:', disconnectError);
    }
    return NextResponse.json(
      { error: 'Failed to retrieve venues' },
      { status: 500 }
    );
  }
} 