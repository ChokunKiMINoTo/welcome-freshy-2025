// Utility functions to load and parse CSV data

export interface ScheduleItem {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  duration: number;
  location: string;
  responsible: string;
  description: string;
  participants?: number;
  color: string;
  // Team duties
  operation: string;
  registration: string;
  foodDrink: string;
  entertain: string;
  staff: string;
  game: string;
}

export interface VenueItem {
  id: string;
  name: string;
  status: 'active' | 'break' | 'setup' | 'maintenance';
  activities: string;
  color: string;
}

export interface TeamItem {
  id: string;
  name: string;
  leadName: string;
  leadContact: string;
  memberCount: number;
  status: string;
  priority: string;
  color: string;
  currentTask: string;
}

export interface ContactItem {
  id: string;
  name: string;
  role: string;
  team: string;
  phone: string;
  lineId: string;
  radioChannel: string;
  email: string;
  status: 'active' | 'break' | 'offline';
  isEmergency: boolean;
}

export interface ScoreboardItem {
  id: string;
  teamName: string;
  totalScore: number;
  gameI: number;
  gameII: number;
  gameIII: number;
  gameIV: number;
  gameV: number;
  gameVI: number;
  rank: number;
  trend: 'up' | 'down' | 'same';
  lastUpdated: string;
  achievements: string;
}

export interface PropItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  location: string;
  assignedTo: string;
  status: 'available' | 'in-use' | 'missing' | 'damaged' | 'setup-required';
  priority: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  lastUpdated: string;
  notes: string;
}

export interface AlertItem {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  isActive: boolean;
  dismissible: boolean;
  actions: string;
}

// Generic CSV parser function
function parseCSV<T>(csvText: string, mapper: (row: string[]) => T): T[] {
  const lines = csvText.trim().split('\n');
  
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    return mapper(values);
  });
}

// Enhanced CSV parser for object-based mapping with proper comma handling
interface CsvRowObject {
  [key: string]: string;
}

function parseCSVWithHeaders<T>(csvText: string, mapper: (row: CsvRowObject) => T): T[] {
  const lines = csvText.trim().split('\n');
  const headers = parseCSVLine(lines[0]);
  
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const obj: CsvRowObject = {};
    
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    
    return mapper(obj);
  });
}

// Proper CSV line parser that handles commas inside quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    
    if (char === '"') {
      // Handle quotes
      if (inQuotes && line[i + 1] === '"') {
        // Double quote - escaped quote inside quoted field
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // Comma outside quotes - field separator
      result.push(current.trim());
      current = '';
      i++;
    } else {
      // Regular character
      current += char;
      i++;
    }
  }
  
  // Add the last field
  result.push(current.trim());
  
  return result;
}

// Type-specific mappers
const scheduleMapper = (row: CsvRowObject): ScheduleItem => ({
  id: row.id || '',
  title: row.title || '',
  startTime: row.startTime || '',
  endTime: row.endTime || '',
  duration: parseInt(row.duration) || 0,
  location: row.location || '',
  responsible: row.responsible || '',
  description: row.description || '',
  participants: row.participants ? parseInt(row.participants) : undefined,
  color: row.color || '#e0e0e0',
  // Parse team duties
  operation: row.Operation || '',
  registration: row.Registration || '',
  foodDrink: row['Food & Drink'] || '',
  entertain: row.Entertain || '',
  staff: row.Staff || '',
  game: row.Game || '',
});

const venueMapper = (row: string[]): VenueItem => ({
  id: row[0] || '',
  name: row[1] || '',
  status: (row[2] as 'active' | 'break' | 'setup' | 'maintenance') || 'setup',
  activities: row[3] || '',
  color: row[4] || '#000000',
});

const teamMapper = (row: string[]): TeamItem => ({
  id: row[0] || '',
  name: row[1] || '',
  leadName: row[2] || '',
  leadContact: row[3] || '',
  memberCount: parseInt(row[4]) || 0,
  status: row[5] || '',
  priority: row[6] || '',
  color: row[7] || '#000000',
  currentTask: row[8] || '',
});

const contactMapper = (row: CsvRowObject): ContactItem => ({
  id: row.id,
  name: row.name,
  role: row.role,
  team: row.team,
  phone: row.phone,
  lineId: row.lineId,
  radioChannel: row.radioChannel,
  email: row.email,
  status: row.status as 'active' | 'break' | 'offline',
  isEmergency: row.isEmergency === 'true'
});

const scoreboardMapper = (row: CsvRowObject): ScoreboardItem => ({
  id: row.id,
  teamName: row.teamName,
  totalScore: parseInt(row.totalScore) || 0,
  gameI: parseInt(row.gameI) || 0,
  gameII: parseInt(row.gameII) || 0,
  gameIII: parseInt(row.gameIII) || 0,
  gameIV: parseInt(row.gameIV) || 0,
  gameV: parseInt(row.gameV) || 0,
  gameVI: parseInt(row.gameVI) || 0,
  rank: parseInt(row.rank) || 0,
  trend: row.trend as 'up' | 'down' | 'same',
  lastUpdated: row.lastUpdated,
  achievements: row.achievements
});

const propMapper = (row: CsvRowObject): PropItem => ({
  id: row.id,
  name: row.name,
  category: row.category,
  quantity: parseInt(row.quantity) || 0,
  location: row.location,
  assignedTo: row.assignedTo,
  status: row.status as 'available' | 'in-use' | 'missing' | 'damaged' | 'setup-required',
  priority: row.priority as 'critical' | 'high' | 'medium' | 'low',
  description: row.description,
  lastUpdated: row.lastUpdated,
  notes: row.notes
});

const alertMapper = (row: CsvRowObject): AlertItem => ({
  id: row.id,
  type: row.type as 'error' | 'warning' | 'info' | 'success',
  title: row.title,
  message: row.message,
  priority: row.priority as 'critical' | 'high' | 'medium' | 'low',
  timestamp: row.timestamp,
  isActive: row.isActive === 'true',
  dismissible: row.dismissible === 'true',
  actions: row.actions
});

// CSV loader functions
export async function loadScheduleData(): Promise<ScheduleItem[]> {
  try {
    const response = await fetch('/data/schedule.csv');
    const csvText = await response.text();
    return parseCSVWithHeaders(csvText, scheduleMapper);
  } catch (error) {
    console.error('Error loading schedule data:', error);
    return [];
  }
}

export async function loadVenueData(): Promise<VenueItem[]> {
  try {
    // Try to load from KV API first
    const response = await fetch('/api/venues/update');
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.venues) {
        // Transform KV data to VenueItem format
        return data.venues.map((venue: { id: string; name: string; status: string; activities: string; color: string }) => ({
          id: venue.id,
          name: venue.name,
          status: venue.status as 'active' | 'break' | 'setup' | 'maintenance',
          activities: venue.activities,
          color: venue.color,
        }));
      }
    }
    
    // Fallback to CSV if KV is not available
    const csvResponse = await fetch('/data/venues.csv');
    const csvText = await csvResponse.text();
    return parseCSV(csvText, venueMapper);
  } catch (error) {
    console.error('Error loading venue data:', error);
    return [];
  }
}

export async function loadTeamData(): Promise<TeamItem[]> {
  try {
    const response = await fetch('/data/teams.csv');
    const csvText = await response.text();
    return parseCSV(csvText, teamMapper);
  } catch (error) {
    console.error('Error loading team data:', error);
    return [];
  }
}

export async function loadContactData(): Promise<ContactItem[]> {
  try {
    const response = await fetch('/data/contacts.csv');
    const csvText = await response.text();
    return parseCSVWithHeaders(csvText, contactMapper);
  } catch (error) {
    console.error('Error loading contact data:', error);
    return [];
  }
}

export async function loadScoreboardData(): Promise<ScoreboardItem[]> {
  try {
    const response = await fetch('/data/scoreboard.csv');
    const csvText = await response.text();
    return parseCSVWithHeaders(csvText, scoreboardMapper);
  } catch (error) {
    console.error('Error loading scoreboard data:', error);
    return [];
  }
}

export async function loadPropData(): Promise<PropItem[]> {
  try {
    const response = await fetch('/data/props.csv');
    const csvText = await response.text();
    return parseCSVWithHeaders(csvText, propMapper);
  } catch (error) {
    console.error('Error loading prop data:', error);
    return [];
  }
}

export async function loadAlertData(): Promise<AlertItem[]> {
  try {
    const response = await fetch('/data/alerts.csv');
    const csvText = await response.text();
    return parseCSVWithHeaders(csvText, alertMapper);
  } catch (error) {
    console.error('Error loading alert data:', error);
    return [];
  }
} 