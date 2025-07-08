// Utility functions to update CSV data on the server

export interface VenueUpdateRequest {
  id: string;
  status: 'active' | 'break' | 'setup' | 'maintenance';
}

export async function updateVenueStatus(venueId: string, newStatus: string): Promise<boolean> {
  try {
    const response = await fetch('/api/venues/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: venueId,
        status: newStatus,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update venue status: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Venue status updated successfully:', result);
    return true;
  } catch (error) {
    console.error('Error updating venue status:', error);
    return false;
  }
}

export async function updateMultipleVenueStatuses(updates: VenueUpdateRequest[]): Promise<boolean> {
  try {
    const response = await fetch('/api/venues/update-multiple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ updates }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update venue statuses: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Multiple venue statuses updated successfully:', result);
    return true;
  } catch (error) {
    console.error('Error updating multiple venue statuses:', error);
    return false;
  }
} 