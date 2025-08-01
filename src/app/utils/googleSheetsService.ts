import { google } from 'googleapis';

export interface TeamScore {
  teamName: string;
  game1: number;
  game2: number;
  game3: number;
  game6: number;
  totalScore: number;
  rank: number;
  trend: 'up' | 'down' | 'same';
  lastUpdated: string;
  achievements: string;
}

export interface GameData {
  teamName: string;
  score: number;
}

export class GoogleSheetsService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private auth: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private sheets: any;

  constructor() {
    // Initialize Google Sheets API with service account credentials from environment
    const serviceAccountCredentials = {
      type: "service_account",
      project_id: "gsheet-379507",
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
      universe_domain: "googleapis.com"
    };

    this.auth = new google.auth.GoogleAuth({
      credentials: serviceAccountCredentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
  }

  private async getWorksheetData(spreadsheetId: string, range: string): Promise<string[][]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });

      return (response.data.values as string[][]) || [];
    } catch (error) {
      console.error('Error fetching worksheet data:', error);
      return [];
    }
  }

  private findColumnIndex(headers: string[], columnName: string): number {
    return headers.findIndex(header => header.includes(columnName));
  }

  private parseGameData(worksheetData: string[][]): GameData[] {
    if (worksheetData.length < 2) return [];

    const headers = worksheetData[0];
    const teamNameColIndex = this.findColumnIndex(headers, 'ชื่อกลุ่มน้อง');
    const scoreColIndex = this.findColumnIndex(headers, 'รวมคะแนน');

    if (teamNameColIndex === -1 || scoreColIndex === -1) {
      console.error('Required columns not found');
      return [];
    }

    const gameData: GameData[] = [];
    
    for (let i = 1; i < worksheetData.length; i++) {
      const row = worksheetData[i];
      if (row[teamNameColIndex] && row[scoreColIndex]) {
        const teamName = row[teamNameColIndex].toString().trim();
        const score = parseFloat(row[scoreColIndex].toString()) || 0;
        
        if (teamName && score > 0) {
          gameData.push({ teamName, score });
        }
      }
    }

    return gameData;
  }

  async getScoreboardData(): Promise<TeamScore[]> {
    try {
      const spreadsheetId = process.env.GOOGLE_SHEETS_ID || 'your-spreadsheet-id';
      
      // Fetch data from all worksheets
      const [game1Data, game2Data, game3Data, game6Data] = await Promise.all([
        this.getWorksheetData(spreadsheetId, 'เกมที่ 1 : เกมแน่จริงก็เรียงให้ตรง'),
        this.getWorksheetData(spreadsheetId, 'เกมที่ 2 : เกมกระซิบต่อบอกให้ถูก'),
        this.getWorksheetData(spreadsheetId, 'เกมที่ 3 : เกมคําเดียวก็เกินพอ'),
        this.getWorksheetData(spreadsheetId, 'เกมที่ 6 : Shadow Boxing'),
      ]);

      // Parse each game's data
      const game1Scores = this.parseGameData(game1Data);
      const game2Scores = this.parseGameData(game2Data);
      const game3Scores = this.parseGameData(game3Data);
      const game6Scores = this.parseGameData(game6Data);

      // Combine all team names
      const allTeamNames = new Set([
        ...game1Scores.map(g => g.teamName),
        ...game2Scores.map(g => g.teamName),
        ...game3Scores.map(g => g.teamName),
        ...game6Scores.map(g => g.teamName),
      ]);

      // Create team scores
      const teamScores: TeamScore[] = Array.from(allTeamNames).map(teamName => {
        const game1Score = game1Scores.find(g => g.teamName === teamName)?.score || 0;
        const game2Score = game2Scores.find(g => g.teamName === teamName)?.score || 0;
        const game3Score = game3Scores.find(g => g.teamName === teamName)?.score || 0;
        const game6Score = game6Scores.find(g => g.teamName === teamName)?.score || 0;

        const totalScore = game1Score + game2Score + game3Score + game6Score;

        return {
          teamName,
          game1: game1Score,
          game2: game2Score,
          game3: game3Score,
          game6: game6Score,
          totalScore,
          rank: 0, // Will be calculated after sorting
          trend: 'same' as const, // Default trend
          lastUpdated: new Date().toISOString(),
          achievements: this.generateAchievements(game1Score, game2Score, game3Score, game6Score),
        };
      });

      // Sort by total score and assign ranks
      teamScores.sort((a, b) => b.totalScore - a.totalScore);
      teamScores.forEach((team, index) => {
        team.rank = index + 1;
      });

      return teamScores;
    } catch (error) {
      console.error('Error fetching scoreboard data:', error);
      return [];
    }
  }

  private generateAchievements(game1: number, game2: number, game3: number, game6: number): string {
    const achievements = [];
    
    if (game1 > 0) achievements.push('Game 1 Winner');
    if (game2 > 0) achievements.push('Game 2 Winner');
    if (game3 > 0) achievements.push('Game 3 Winner');
    if (game6 > 0) achievements.push('Shadow Boxing Champion');
    
    const totalScore = game1 + game2 + game3 + game6;
    if (totalScore > 100) achievements.push('High Scorer');
    if (totalScore > 200) achievements.push('Elite Player');
    
    return achievements.join(', ');
  }
}

// Default export
export default GoogleSheetsService; 