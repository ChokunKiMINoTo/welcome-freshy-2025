import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST() {
  try {
    // Read the CSV file
    const csvPath = path.join(process.cwd(), 'public', 'data', 'venues.csv');
    const csvContent = await fs.readFile(csvPath, 'utf-8');
    
    // Parse CSV and convert to JSON
    const lines = csvContent.trim().split('\n');
    const venues = [];
    
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
      await kv.set(`venue:${venue.id}`, venue);
    }
    
    // Store venues list
    await kv.set('venues:list', venues);
    
    return NextResponse.json({
      success: true,
      message: `Initialized ${venues.length} venues in Vercel KV`,
      venues: venues
    });
    
  } catch (error) {
    console.error('Error initializing venues:', error);
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