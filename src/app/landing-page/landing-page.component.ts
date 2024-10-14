import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FleetDataService } from '../services/fleet-management.service';
import { NgClass, NgFor, NgStyle } from '@angular/common';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [MatCardModule, MatToolbarModule, NgFor, NgStyle, NgClass],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent {
  public fleetData: any;

  constructor(private fleetDataService: FleetDataService) {
    this.fleetData = this.fleetDataService.getFleetData(); // Signal for fleet data
  }

  ngOnInit() {}

  // Utility function to generate random number
  public random(): number {
    return Math.floor(Math.random() * 5) + 1;
  }
}
// background-color: rgb(17,45,67);
//background-color: #8bc6ec;
//background-image: linear-gradient(135deg, #8bc6ec 0%, #9599e2 100%);
