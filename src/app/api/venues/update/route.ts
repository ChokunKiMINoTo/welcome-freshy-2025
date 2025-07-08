import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

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

    // Read the current CSV file
    const csvPath = path.join(process.cwd(), 'public', 'data', 'venues.csv');
    const csvContent = await fs.readFile(csvPath, 'utf-8');
    
    // Parse and update the CSV
    const lines = csvContent.trim().split('\n');
    const headers = lines[0];
    let venueFound = false;
    
    const updatedLines = lines.map((line, index) => {
      if (index === 0) return line; // Keep headers
      
      const columns = parseCSVLine(line);
      const venueId = columns[0];
      
      if (venueId === id) {
        venueFound = true;
        columns[2] = status; // Update status column (index 2)
        return columns.map(col => 
          col.includes(',') || col.includes('"') ? `"${col.replace(/"/g, '""')}"` : col
        ).join(',');
      }
      
      return line;
    });

    if (!venueFound) {
      return NextResponse.json(
        { error: `Venue with id '${id}' not found` },
        { status: 404 }
      );
    }

    // Write the updated CSV back to file
    const updatedCSV = updatedLines.join('\n');
    await fs.writeFile(csvPath, updatedCSV, 'utf-8');

    return NextResponse.json({
      success: true,
      message: `Venue '${id}' status updated to '${status}'`,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error updating venue status:', error);
    return NextResponse.json(
      { error: 'Failed to update venue status' },
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