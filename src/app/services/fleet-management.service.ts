import { Injectable, signal } from '@angular/core';
import { FLEET_DATA } from '../constant.ts/app.constant';

@Injectable({
  providedIn: 'root'
})
export class FleetDataService {
  // Signal to store fleet data
  private fleetData = signal({
    missionStatement: '',
    leadership: '',
    objectives: [],
    tools: [],
    programs: [],
    squads: [],
    accomplishments: []
  });

  constructor() {
    // Load initial data (in real-world apps, fetch from an API)
    const data = FLEET_DATA;

    this.fleetData.set(data); // Set the signal data
  }

  // Getter for the fleet data signal
  getFleetData() {
    return this.fleetData;
  }
}
