import { Component, ChangeDetectorRef, HostListener } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FleetDataService } from '../services/fleet-management.service';
import { NgClass, NgFor, NgStyle, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [MatCardModule, MatToolbarModule, NgFor, NgStyle, NgClass, NgIf, RouterModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent {
  public fleetData: any;
  public selectedLeader: any = null;
  public cardPosition = { top: 0, left: 0 };

  constructor(
    private fleetDataService: FleetDataService,
    private cdr: ChangeDetectorRef
  ) {
    this.fleetData = this.fleetDataService.getFleetData();
  }

  public random(): number {
    return Math.floor(Math.random() * 5) + 1;
  }

  showLeaderDetails(leader: any, event: MouseEvent) {
    this.selectedLeader = leader;
    
    const cardWidth = 300; // Width of our Outlook-style card
    const padding = 10; // Padding from the edge of the viewport
    
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    // Position to the right if there's enough space, otherwise to the left
    let left = rect.right + padding;
    if (left + cardWidth > viewportWidth) {
      left = rect.left - cardWidth - padding;
    }

    // Ensure the card is always visible within the viewport
    left = Math.max(padding, Math.min(left, viewportWidth - cardWidth - padding));

    this.cardPosition = { 
      top: rect.top, 
      left: left 
    };

    this.cdr.detectChanges();
  }

  hideLeaderDetails() {
    this.selectedLeader = null;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.selectedLeader) {
      const clickedElement = event.target as HTMLElement;
      const cardElement = clickedElement.closest('.outlook-style-card');
      const leaderElement = clickedElement.closest('.leader-container');

      if (!cardElement && !leaderElement) {
        this.selectedLeader = null;
      }
    }
  }
}
