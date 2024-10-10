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

   // Utility function to darken a color slightly
   public darkenColor(color: string): string {
    let num = parseInt(color.replace('#', ''), 16),
        amt = -30,
        R = (num >> 16) + amt,
        G = ((num >> 8) & 0x00FF) + amt,
        B = (num & 0x0000FF) + amt;
  
    return '#' + (
      0x1000000 + 
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 + 
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 + 
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
  }
  
}
// background-color: rgb(17,45,67);