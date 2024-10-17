import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface SquadMember {
  name: string;
  title: string;
  image: string;
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
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './squad-details.component.html',
  styleUrls: ['./squad-details.component.scss']
})
export class SquadDetailsComponent implements OnInit {
  @Input() squadData: SquadData | null = null;

  constructor() {}

  ngOnInit() {
    // If you need to do any initialization with squadData, do it here
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
}
