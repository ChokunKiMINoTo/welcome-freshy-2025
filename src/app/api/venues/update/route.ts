import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

interface VenueData {
  id: string;
  name: string;
  status: string;
  activities: string;
  color: string;
  lastUpdated: string;
}

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

    // Update venue status in Vercel KV
    const venueKey = `venue:${id}`;
    const venueData = await kv.get(venueKey) as VenueData | null;
    
    if (!venueData) {
      return NextResponse.json(
        { error: `Venue with id '${id}' not found` },
        { status: 404 }
      );
    }

    // Update the status
    const updatedVenue: VenueData = {
      ...venueData,
      status: status,
      lastUpdated: new Date().toISOString()
    };

    // Store updated venue data
    await kv.set(venueKey, updatedVenue);

    // Also update the venues list for easy retrieval
    const venuesListKey = 'venues:list';
    let venuesList = await kv.get(venuesListKey) as VenueData[] || [];
    
    // Update the specific venue in the list
    venuesList = venuesList.map((venue: VenueData) => 
      venue.id === id ? { ...venue, status: status, lastUpdated: new Date().toISOString() } : venue
    );
    
    await kv.set(venuesListKey, venuesList);

    return NextResponse.json({
      success: true,
      message: `Venue '${id}' status updated to '${status}'`,
      timestamp: new Date().toISOString(),
      venue: updatedVenue
    });

  } catch (error) {
    console.error('Error updating venue status:', error);
    return NextResponse.json(
      { error: 'Failed to update venue status' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve all venues
export async function GET() {
  try {
    const venuesListKey = 'venues:list';
    const venues = await kv.get(venuesListKey) as VenueData[] || [];
    
    return NextResponse.json({
      success: true,
      venues: venues
    });
  } catch (error) {
    console.error('Error retrieving venues:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve venues' },
      { status: 500 }
    );
  }
} 