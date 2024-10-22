import { Component, Input, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';

interface SquadMember {
  name: string;
  title: string;
  image: string;
  contact?: string;
  email?: string;
  department?: string;
  phone?: string;
}

interface Document {
  name: string;
  type: string;
  author: string;
  time: string;
}

interface Project {
  name: string;
  description: string;
  link: string;
}

interface SquadData {
  name: string;
  missionStatement: string;
  leader: SquadMember;
  objectives: string[];
  helpAndSupport: string;
  members: SquadMember[];
  recentDocuments: Document[];
  projects: Project[];
}

@Component({
  selector: 'app-squad-details',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatTabsModule],
  templateUrl: './squad-details.component.html',
  styleUrls: ['./squad-details.component.scss']
})
export class SquadDetailsComponent implements OnInit {
  @Input() squadData: SquadData | null = null;
  selectedMember: SquadMember | null = null;
  cardPosition = { top: 0, left: 0 };

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    console.log('Squad data:', this.squadData);
    if (this.squadData && this.squadData.members) {
      console.log('First member:', this.squadData.members[0]);
    }
  }

  getDocumentIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'pdf':
        return 'picture_as_pdf';
      case 'doc':
      case 'docx':
        return 'description';
      case 'xls':
      case 'xlsx':
        return 'table_chart';
      case 'ppt':
      case 'pptx':
        return 'slideshow';
      case 'img':
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'image';
      default:
        return 'insert_drive_file';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  contactUs() {
    // Implement your contact logic here
    console.log('Contact Us button clicked');
    // For example, you could open a modal dialog or navigate to a contact page
    // You might want to use a service to handle this functionality
  }

  showMemberDetails(member: any, event: MouseEvent) {
    this.selectedMember = member;
    
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

    console.log('Card position:', this.cardPosition);
    console.log('Selected member:', this.selectedMember);

    // Force a change detection cycle
    this.cdr.detectChanges();

    // Add visible class after a short delay
    setTimeout(() => {
      const card = document.querySelector('.outlook-style-card') as HTMLElement;
      if (card) {
        card.classList.add('visible');
      }
    }, 50);
  }

  hideMemberDetails() {
    const card = document.querySelector('.outlook-style-card') as HTMLElement;
    if (card) {
      card.classList.remove('visible');
      setTimeout(() => {
        this.selectedMember = null;
      }, 300); // Match this to the transition duration
    } else {
      this.selectedMember = null;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.selectedMember) {
      const clickedElement = event.target as HTMLElement;
      const cardElement = clickedElement.closest('.outlook-style-card');
      const memberElement = clickedElement.closest('.member-container');

      if (!cardElement && !memberElement) {
        this.selectedMember = null;
      }
    }
  }
}
