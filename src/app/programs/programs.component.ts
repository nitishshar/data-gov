import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { FleetDataService } from '../services/fleet-management.service';
import { Router } from '@angular/router';

interface Document {
  id: number;
  name: string;
  thumbnail: string;
  squad: string;
  editor: {
    name: string;
    image: string;
  };
  editedAt: Date;
}

interface Event {
  title: string;
  date: Date;
  description: string;
  type: string;
}

interface Leader {
  name: string;
  position: string;
  image: string;
  contact: string;
}

interface News {
  title: string;
  description: string;
  date: Date;
  link: string;
}

interface Squad {
  name: string;
  description: string;
  members: number;
  progress: number;
  color?: string;
}

@Component({
  selector: 'app-programs',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  template: `
    <!-- Intro Section -->
    <div class="program-page">
      <section class="intro-section glass-container">
        <div class="content-wrapper">
          <h1>Fleet Management Programs</h1>
          <p class="intro-text">
            Driving innovation and excellence in fleet management through strategic programs
            and initiatives.
          </p>
        </div>
        <div class="glass-overlay"></div>
      </section>

      <div class="main-content">
        <div class="content-area">
          <!-- Mission Statement -->
          <section class="mission-section glass-container">
            <div class="content-wrapper">
              <h2>Mission Statement</h2>
              <p>{{missionStatement}}</p>
            </div>
            <div class="glass-overlay"></div>
          </section>

          <!-- Program Description -->
          <section class="description-section glass-container">
            <div class="content-wrapper">
              <h2>About Our Program</h2>
              <div class="description-content">
                <p>{{programDescription}}</p>
              </div>
            </div>
            <div class="glass-overlay"></div>
          </section>

          <!-- Roadmap -->
          <section class="roadmap-section glass-container">
            <div class="content-wrapper">
              <h2>Program Roadmap</h2>
              <div class="roadmap-content" [class.is-image]="roadmapType === 'image'">
                <ng-container *ngIf="roadmapType === 'image'">
                  <img [src]="roadmapImage" alt="Program Roadmap" class="roadmap-image">
                </ng-container>
                <div *ngIf="roadmapType === 'text'" class="roadmap-text">
                  <div *ngFor="let milestone of roadmap" class="milestone">
                    <div class="milestone-date">{{milestone.date | date:'MMM yyyy'}}</div>
                    <div class="milestone-content">
                      <h4>{{milestone.title}}</h4>
                      <p>{{milestone.description}}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="glass-overlay"></div>
          </section>

          <!-- Recent Documents -->
          <section class="documents-section glass-container">
            <div class="content-wrapper">
              <h2>Recent Documents</h2>
              <div class="documents-grid">
                <div *ngFor="let doc of recentDocuments" class="document-card glass-effect">
                  <div class="document-thumbnail">
                    <img [src]="doc.thumbnail" [alt]="doc.name">
                  </div>
                  <div class="document-info">
                    <h4>{{doc.name}}</h4>
                    <p class="squad-name">{{doc.squad}}</p>
                    <div class="editor-info">
                      <img [src]="doc.editor.image" [alt]="doc.editor.name" class="editor-avatar">
                      <div class="editor-details">
                        <span class="editor-name">{{doc.editor.name}}</span>
                        <span class="edit-time">{{doc.editedAt | date:'medium'}}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="glass-overlay"></div>
          </section>

          <!-- Latest News -->
          <section class="news-section glass-container">
            <div class="content-wrapper">
              <h2>Latest Updates</h2>
              <div class="news-grid">
                <div *ngFor="let news of latestNews" class="news-card glass-effect">
                  <h3>{{news.title}}</h3>
                  <p>{{news.description}}</p>
                  <div class="news-meta">
                    <span class="date">{{news.date | date}}</span>
                    <a [href]="news.link" class="read-more">Read More</a>
                  </div>
                </div>
              </div>
            </div>
            <div class="glass-overlay"></div>
          </section>

          <!-- Program Squads -->
          <section class="squads-section glass-container">
            <div class="content-wrapper">
              <h2>Contributing Squads</h2>
              <div class="squads-grid">
                <div *ngFor="let squad of programSquads" class="squad-card glass-effect">
                  <h3>{{squad.name}}</h3>
                  <p>{{squad.description}}</p>
                  <div class="squad-stats">
                    <div class="stat">
                      <mat-icon>group</mat-icon>
                      <span>{{squad.members}} Members</span>
                    </div>
                    <div class="progress-bar">
                      <div class="progress" [style.width.%]="squad.progress"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="glass-overlay"></div>
          </section>
        </div>

        <div class="sidebar">
          <!-- Leadership Panel -->
          <aside class="leadership-panel glass-container">
            <div class="content-wrapper">
              <h2>Program Leadership</h2>
              <div class="leaders-list">
                <div *ngFor="let leader of leadership" class="leader-card glass-effect">
                  <img [src]="leader.image" [alt]="leader.name" class="leader-avatar">
                  <div class="leader-info">
                    <h4>{{leader.name}}</h4>
                    <p class="position">{{leader.position}}</p>
                    <a [href]="'mailto:' + leader.contact" class="contact-link">
                      <mat-icon>email</mat-icon>
                      Contact
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div class="glass-overlay"></div>
          </aside>

          <!-- Upcoming Events -->
          <aside class="events-panel glass-container">
            <div class="content-wrapper">
              <h2>Upcoming Events</h2>
              <div class="events-list">
                <div *ngFor="let event of upcomingEvents" class="event-card glass-effect">
                  <div class="event-date">
                    <span class="day">{{event.date | date:'dd'}}</span>
                    <span class="month">{{event.date | date:'MMM'}}</span>
                  </div>
                  <div class="event-info">
                    <h4>{{event.title}}</h4>
                    <p>{{event.description}}</p>
                    <span class="event-type">{{event.type}}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="glass-overlay"></div>
          </aside>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background: #ffffff;
      background-image: 
        linear-gradient(120deg, rgba(246,248,255,0.8) 0%, rgba(255,255,255,0.8) 100%),
        repeating-linear-gradient(45deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 2px, transparent 2px, transparent 12px);
      min-height: 100vh;
      color: #2c3e50;
    }

    .program-page {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .main-content {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 2rem;
      margin-top: 2rem;
    }

    .glass-container {
      position: relative;
      margin-bottom: 2rem;
      padding: 2rem;
      border-radius: 8px;
      overflow: hidden;
      background: var(--card-bg, rgba(255, 255, 255, 0.9));
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.7);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
      }
    }

    .glass-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.5);
      backdrop-filter: blur(4px);
      z-index: 0;
    }

    .content-wrapper {
      position: relative;
      z-index: 1;
    }

    .intro-section {
      text-align: center;
      padding: 4rem 2rem;

      h1 {
        font-size: 2.5rem;
        margin-bottom: 1rem;
        font-weight: 600;
        color: #009bda;
        border-bottom: 2px solid #009bda;
        padding-bottom: 10px;
      }

      .intro-text {
        font-size: 1.2rem;
        max-width: 800px;
        margin: 0 auto;
        line-height: 1.6;
      }
    }

    .glass-effect {
      background: rgba(255, 255, 255, 0.8);
      border-radius: 8px;
      padding: 1.5rem;
      backdrop-filter: blur(4px);
      border: 1px solid rgba(255, 255, 255, 0.7);
      box-shadow: 
        0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
      }
    }

    .documents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.5rem;

      .document-card {
        .document-thumbnail {
          height: 150px;
          overflow: hidden;
          border-radius: 4px;
          margin-bottom: 1rem;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .document-info {
          h4 {
            margin: 0 0 0.5rem;
            color: #1a237e;
          }

          .squad-name {
            color: #455a64;
            font-size: 0.9rem;
          }

          .editor-info {
            display: flex;
            align-items: center;
            margin-top: 1rem;

            .editor-avatar {
              width: 32px;
              height: 32px;
              border-radius: 50%;
              margin-right: 0.5rem;
            }

            .editor-details {
              display: flex;
              flex-direction: column;
              font-size: 0.9rem;

              .edit-time {
                color: #666;
                font-size: 0.8rem;
              }
            }
          }
        }
      }
    }

    .news-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;

      .news-card {
        h3 {
          color: #1a237e;
          margin: 0 0 1rem;
        }

        .news-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
          font-size: 0.9rem;

          .date {
            color: #666;
          }

          .read-more {
            color: #009bda;
            text-decoration: none;

            &:hover {
              text-decoration: underline;
            }
          }
        }
      }
    }

    .squads-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;

      .squad-card {
        h3 {
          color: #1a237e;
          margin: 0 0 1rem;
        }

        .squad-stats {
          margin-top: 1rem;

          .stat {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #455a64;
            margin-bottom: 0.5rem;

            mat-icon {
              font-size: 18px;
              width: 18px;
              height: 18px;
            }
          }

          .progress-bar {
            height: 4px;
            background: rgba(0, 0, 0, 0.1);
            border-radius: 2px;
            overflow: hidden;

            .progress {
              height: 100%;
              background: #009bda;
              transition: width 0.3s ease;
            }
          }
        }
      }
    }

    .sidebar {
      .leadership-panel, .events-panel {
        .leader-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;

          .leader-avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            object-fit: cover;
          }

          .leader-info {
            h4 {
              margin: 0;
              color: #1a237e;
            }

            .position {
              color: #455a64;
              font-size: 0.9rem;
              margin: 0.2rem 0;
            }

            .contact-link {
              display: flex;
              align-items: center;
              gap: 0.3rem;
              color: #009bda;
              text-decoration: none;
              font-size: 0.9rem;

              &:hover {
                text-decoration: underline;
              }

              mat-icon {
                font-size: 16px;
                width: 16px;
                height: 16px;
              }
            }
          }
        }

        .event-card {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;

          .event-date {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-width: 60px;
            padding: 0.5rem;
            background: #1a237e;
            color: white;
            border-radius: 4px;

            .day {
              font-size: 1.5rem;
              font-weight: 500;
            }

            .month {
              font-size: 0.8rem;
              text-transform: uppercase;
            }
          }

          .event-info {
            h4 {
              margin: 0 0 0.5rem;
              color: #1a237e;
            }

            p {
              margin: 0;
              font-size: 0.9rem;
              color: #455a64;
            }

            .event-type {
              display: inline-block;
              margin-top: 0.5rem;
              padding: 0.2rem 0.5rem;
              background: rgba(26, 35, 126, 0.1);
              color: #1a237e;
              border-radius: 4px;
              font-size: 0.8rem;
            }
          }
        }
      }
    }

    .roadmap-content {
      &.is-image {
        .roadmap-image {
          width: 100%;
          max-height: 500px;
          object-fit: contain;
          border-radius: 8px;
        }
      }

      .milestone {
        display: flex;
        gap: 2rem;
        margin-bottom: 2rem;
        position: relative;

        &:not(:last-child):before {
          content: '';
          position: absolute;
          left: 120px;
          top: 30px;
          bottom: -30px;
          width: 2px;
          background: rgba(26, 35, 126, 0.1);
        }

        .milestone-date {
          min-width: 120px;
          color: #1a237e;
          font-weight: 500;
        }

        .milestone-content {
          h4 {
            margin: 0 0 0.5rem;
            color: #1a237e;
          }

          p {
            margin: 0;
            color: #455a64;
          }
        }
      }
    }

    @media (max-width: 1024px) {
      .main-content {
        grid-template-columns: 1fr;
      }

      .sidebar {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
      }
    }

    @media (max-width: 768px) {
      .program-page {
        padding: 1rem;
      }

      .glass-container {
        padding: 1rem;
      }

      .intro-section {
        padding: 2rem 1rem;

        h1 {
          font-size: 2rem;
        }
      }
    }
  `]
})
export class ProgramsComponent implements OnInit {
  missionStatement = 'To revolutionize fleet management through innovative programs that enhance efficiency, sustainability, and safety while delivering exceptional value to our stakeholders. We aim to set new industry standards through digital transformation and sustainable practices.';
  programDescription = 'Our Fleet Management Programs represent a comprehensive approach to modernizing and optimizing fleet operations. Through strategic initiatives, cutting-edge technology implementation, and continuous improvement processes, we aim to transform traditional fleet management into a data-driven, sustainable, and highly efficient operation.';
  roadmapType: 'image' | 'text' = 'text';
  roadmapImage = 'assets/images/roadmap.png';
  roadmap = [
    {
      date: new Date('2024-01'),
      title: 'Program Initiation & Planning Phase',
      description: 'Launch of core fleet management initiatives and establishment of baseline metrics'
    },
    {
      date: new Date('2024-03'),
      title: 'Digital Infrastructure Setup',
      description: 'Implementation of core digital systems and IoT infrastructure'
    },
    {
      date: new Date('2024-06'),
      title: 'Technology Integration Phase',
      description: 'Implementation of advanced fleet tracking systems and AI-powered analytics'
    },
    {
      date: new Date('2024-09'),
      title: 'Sustainability Initiative Launch',
      description: 'Introduction of electric vehicles and renewable energy solutions'
    },
    {
      date: new Date('2024-12'),
      title: 'Expansion & Optimization Phase',
      description: 'Scaling operations and expanding program scope to additional regions'
    }
  ];

  recentDocuments: Document[] = [];
  leadership: Leader[] = [];
  upcomingEvents: Event[] = [];
  latestNews: News[] = [];
  programSquads: Squad[] = [];

  constructor(private fleetService: FleetDataService, private router: Router) {}

  ngOnInit() {
    // Initialize with sample data
    this.recentDocuments = [
      {
        id: 1,
        name: 'Fleet Optimization Strategy 2024',
        thumbnail: 'assets/images/doc1.jpg',
        squad: 'Operations Squad',
        editor: {
          name: 'John Doe',
          image: 'assets/images/user1.jpg'
        },
        editedAt: new Date('2024-01-15')
      },
      {
        id: 2,
        name: 'Sustainability Implementation Plan',
        thumbnail: 'assets/images/doc2.jpg',
        squad: 'Green Initiative Squad',
        editor: {
          name: 'Lisa Wong',
          image: 'assets/images/user2.jpg'
        },
        editedAt: new Date('2024-01-10')
      },
      {
        id: 3,
        name: 'Digital Transformation Roadmap',
        thumbnail: 'assets/images/doc3.jpg',
        squad: 'Tech Innovation Squad',
        editor: {
          name: 'Alex Kumar',
          image: 'assets/images/user3.jpg'
        },
        editedAt: new Date('2024-01-05')
      },
      {
        id: 4,
        name: 'Safety Protocol Guidelines',
        thumbnail: 'assets/images/doc4.jpg',
        squad: 'Safety & Compliance Squad',
        editor: {
          name: 'Maria Garcia',
          image: 'assets/images/user4.jpg'
        },
        editedAt: new Date('2024-01-01')
      }
    ];

    this.leadership = [
      {
        name: 'Sarah Johnson',
        position: 'Program Director',
        image: 'assets/images/leader1.jpg',
        contact: 'sarah.j@example.com'
      },
      {
        name: 'Michael Chen',
        position: 'Technical Lead',
        image: 'assets/images/leader2.jpg',
        contact: 'michael.c@example.com'
      },
      {
        name: 'Emily Rodriguez',
        position: 'Sustainability Manager',
        image: 'assets/images/leader3.jpg',
        contact: 'emily.r@example.com'
      }
    ];

    this.upcomingEvents = [
      {
        title: 'Q1 Program Review',
        date: new Date('2024-03-15'),
        description: 'Quarterly progress review and strategic planning meeting',
        type: 'Review Meeting'
      },
      {
        title: 'Digital Transformation Workshop',
        date: new Date('2024-02-20'),
        description: 'Hands-on workshop for new digital tools and systems',
        type: 'Workshop'
      },
      {
        title: 'Sustainability Summit',
        date: new Date('2024-02-10'),
        description: 'Discussion of green initiatives and environmental goals',
        type: 'Conference'
      },
      {
        title: 'Safety Training Session',
        date: new Date('2024-02-05'),
        description: 'Mandatory safety protocols and procedures training',
        type: 'Training'
      },
      {
        title: 'Innovation Hackathon',
        date: new Date('2024-01-25'),
        description: 'Team event to develop innovative solutions for fleet management',
        type: 'Team Event'
      }
    ];

    this.latestNews = [
      {
        title: 'New Fleet Management System Successfully Launched',
        description: 'Successfully implemented the latest AI-powered fleet tracking technology, enabling real-time monitoring and predictive maintenance capabilities.',
        date: new Date('2024-01-15'),
        link: '#'
      },
      {
        title: 'Sustainability Milestone Achieved',
        description: 'Program reaches 25% electric vehicle integration target ahead of schedule, marking a significant step towards our sustainability goals.',
        date: new Date('2024-01-10'),
        link: '#'
      },
      {
        title: 'Digital Transformation Initiative Kicks Off',
        description: 'Launch of comprehensive digital transformation project to modernize fleet operations and enhance efficiency.',
        date: new Date('2024-01-05'),
        link: '#'
      },
      {
        title: 'Safety First Campaign Launched',
        description: 'Introduction of new safety protocols and training programs to enhance fleet safety standards.',
        date: new Date('2024-01-01'),
        link: '#'
      }
    ];

    this.programSquads = [
      {
        name: 'Operations Squad',
        description: 'Focused on day-to-day fleet operations optimization and efficiency improvements',
        members: 8,
        progress: 75,
        color: '#4CAF50'
      },
      {
        name: 'Tech Innovation Squad',
        description: 'Leading digital transformation and technology integration initiatives',
        members: 6,
        progress: 60,
        color: '#2196F3'
      },
      {
        name: 'Green Initiative Squad',
        description: 'Driving sustainability and environmental impact reduction programs',
        members: 5,
        progress: 45,
        color: '#8BC34A'
      },
      {
        name: 'Safety & Compliance Squad',
        description: 'Ensuring adherence to safety standards and regulatory requirements',
        members: 7,
        progress: 80,
        color: '#FFC107'
      }
    ];
  }
} 