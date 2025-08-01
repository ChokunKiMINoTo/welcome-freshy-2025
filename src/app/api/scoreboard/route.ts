import { NextResponse } from 'next/server';
import GoogleSheetsService from '../../utils/googleSheetsService';

export async function GET() {
  try {
    // Fetch fresh data from Google Sheets
    const sheetsService = new GoogleSheetsService();
    const scoreboardData = await sheetsService.getScoreboardData();

    return NextResponse.json({
      success: true,
      data: scoreboardData,
      timestamp: new Date().toISOString(),
      cached: false,
    });
  } catch (error) {
    console.error('Error fetching scoreboard data:', error);
    
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