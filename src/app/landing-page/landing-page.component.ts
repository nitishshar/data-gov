import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FleetDataService } from '../services/fleet-management.service';
import { NgFor, NgStyle } from '@angular/common';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [MatCardModule, MatToolbarModule,NgFor, NgStyle],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {
  public  fleetData:any; 

  constructor(private fleetDataService: FleetDataService) {
    this.fleetData = this.fleetDataService.getFleetData(); // Signal for fleet data
  }

  ngOnInit() {}
}
