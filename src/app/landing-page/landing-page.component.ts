import { Component, ChangeDetectorRef, HostListener, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FleetDataService } from '../services/fleet-management.service';
import { NgClass, NgFor, NgStyle, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

interface Accomplishment {
  id: string;
  title: string;
  description: string;
  squad: string;
  date: Date;
  impact: string;
  metrics?: {
    label: string;
    value: string;
  }[];
}

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    MatCardModule,
    MatToolbarModule,
    NgFor,
    NgStyle,
    NgClass,
    NgIf,
    RouterModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatListModule
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent implements OnInit {
  public fleetData = signal<any>({});
  public selectedLeader: any = null;
  public cardPosition = { top: 0, left: 0 };
  public accomplishments: Accomplishment[] = [];

  constructor(
    private fleetDataService: FleetDataService,
    private cdr: ChangeDetectorRef
  ) {
    this.fleetData = this.fleetDataService.getFleetData();
  }

  ngOnInit() {
    // Get the accomplishments from the fleet data
    this.accomplishments = this.fleetData().accomplishments?.slice(0, 3) || [];
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
