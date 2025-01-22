import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { FleetDataService } from '../services/fleet-management.service';
import { ActivatedRoute, Router } from '@angular/router';

interface TeamMember {
  name: string;
  role: string;
  contribution: string;
}

interface Accomplishment {
  id: string;
  title: string;
  description: string;
  squad: string;
  date: Date;
  impact: string;
  benefits: string[];
  teamMembers: TeamMember[];
  metrics?: {
    label: string;
    value: string;
  }[];
}

@Component({
  selector: 'app-accomplishments',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  template: `
    <div class="accomplishments-container">
      <header class="page-header">
        <div class="header-content">
          <h1>{{ selectedAccomplishment ? selectedAccomplishment.title : 'Fleet Accomplishments' }}</h1>
          <p>{{ selectedAccomplishment ? selectedAccomplishment.squad : 'Celebrating our team\'s achievements and milestones' }}</p>
        </div>
      </header>

      <div class="content-wrapper">
        <div class="main-content" *ngIf="selectedAccomplishment">
          <mat-card class="glass-card">
            <mat-card-content>
              <div class="section">
                <h3>Overview</h3>
                <p class="description">{{ selectedAccomplishment.description }}</p>
                <p class="date">Achieved on {{ selectedAccomplishment.date | date:'mediumDate' }}</p>
              </div>

              <div class="section">
                <h3>Impact</h3>
                <p>{{ selectedAccomplishment.impact }}</p>
              </div>

              <div class="metrics-section" *ngIf="selectedAccomplishment.metrics">
                <h3>Key Metrics</h3>
                <div class="metrics-grid">
                  <div class="metric-card" *ngFor="let metric of selectedAccomplishment.metrics">
                    <div class="metric-value">{{ metric.value }}</div>
                    <div class="metric-label">{{ metric.label }}</div>
                  </div>
                </div>
              </div>

              <div class="section">
                <h3>Benefits</h3>
                <ul class="benefits-list">
                  <li *ngFor="let benefit of selectedAccomplishment.benefits">{{ benefit }}</li>
                </ul>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="sidebar" *ngIf="selectedAccomplishment">
          <mat-card class="glass-card team-card">
            <mat-card-content>
              <h3>Team Members</h3>
              <div class="team-members">
                <div class="member-card" *ngFor="let member of selectedAccomplishment.teamMembers">
                  <h4>{{ member.name }}</h4>
                  <p class="role">{{ member.role }}</p>
                  <p class="contribution">{{ member.contribution }}</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="accomplishments-grid" *ngIf="!selectedAccomplishment">
          <mat-card class="accomplishment-preview" *ngFor="let accomplishment of accomplishments">
            <mat-card-header>
              <mat-card-title>{{ accomplishment.title }}</mat-card-title>
              <mat-card-subtitle>
                {{ accomplishment.squad }} • {{ accomplishment.date | date:'mediumDate' }}
              </mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <p>{{ accomplishment.description }}</p>
              <div class="metrics-preview" *ngIf="accomplishment.metrics">
                <div class="metric" *ngFor="let metric of accomplishment.metrics">
                  <span class="value">{{ metric.value }}</span>
                  <span class="label">{{ metric.label }}</span>
                </div>
              </div>
            </mat-card-content>

            <mat-card-actions>
              <button mat-button color="primary" (click)="showAccomplishmentDetails(accomplishment)">
                View Details
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .accomplishments-container {
      padding: 2rem 1rem;
    }

    .page-header {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(10px);
      padding: 3rem 2rem;
      margin-bottom: 2rem;
      border-radius: 1rem;
      text-align: center;
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.3);

      h1 {
        font-size: 2.5rem;
        color: #2c3e50;
        margin: 0;
        font-weight: 300;
      }

      p {
        font-size: 1.2rem;
        color: #34495e;
        margin: 1rem 0 0;
      }
    }

    .content-wrapper {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 2rem;
      padding: 0 1rem;

      &.list-view {
        display: block;
      }
    }

    .glass-card {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(10px);
      border-radius: 1rem;
      border: 1px solid rgba(255, 255, 255, 0.3);
      margin-bottom: 2rem;

      mat-card-content {
        padding: 2rem;
      }
    }

    .section {
      margin-bottom: 2rem;

      h3 {
        color: #2c3e50;
        font-size: 1.4rem;
        margin-bottom: 1rem;
        font-weight: 500;
      }

      .description {
        font-size: 1.1rem;
        line-height: 1.6;
        color: #34495e;
      }

      .date {
        color: #7f8c8d;
        margin-top: 0.5rem;
      }
    }

    .metrics-section {
      margin-bottom: 2rem;

      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
      }

      .metric-card {
        background: rgba(255, 255, 255, 0.5);
        padding: 1.5rem;
        border-radius: 0.5rem;
        text-align: center;

        .metric-value {
          font-size: 2rem;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 0.5rem;
        }

        .metric-label {
          color: #7f8c8d;
          font-size: 0.9rem;
        }
      }
    }

    .benefits-list {
      list-style-type: none;
      padding: 0;

      li {
        margin-bottom: 0.5rem;
        padding-left: 1.5rem;
        position: relative;
        color: #34495e;

        &:before {
          content: "•";
          position: absolute;
          left: 0;
          color: #3498db;
        }
      }
    }

    .team-card {
      .member-card {
        background: rgba(255, 255, 255, 0.5);
        padding: 1.5rem;
        border-radius: 0.5rem;
        margin-bottom: 1rem;

        h4 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.1rem;
        }

        .role {
          color: #7f8c8d;
          font-size: 0.9rem;
          margin: 0.5rem 0;
        }

        .contribution {
          color: #34495e;
          font-size: 0.9rem;
          margin: 0;
        }
      }
    }

    .accomplishments-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;

      .accomplishment-preview {
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(10px);
        border-radius: 1rem;
        border: 1px solid rgba(255, 255, 255, 0.3);
        transition: transform 0.3s ease;

        &:hover {
          transform: translateY(-5px);
        }

        mat-card-header {
          padding: 1.5rem 1.5rem 1rem;

          mat-card-title {
            font-size: 1.3rem;
            color: #2c3e50;
            margin-bottom: 0.5rem;
          }

          mat-card-subtitle {
            color: #7f8c8d;
          }
        }

        mat-card-content {
          padding: 0 1.5rem;

          p {
            color: #34495e;
            line-height: 1.6;
          }
        }

        mat-card-actions {
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: flex-end;
        }

        .metrics-preview {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;

          .metric {
            text-align: center;
            flex: 1;

            .value {
              display: block;
              font-size: 1.2rem;
              font-weight: 600;
              color: #2c3e50;
            }

            .label {
              font-size: 0.8rem;
              color: #7f8c8d;
            }
          }
        }
      }
    }

    @media (max-width: 768px) {
      .content-wrapper {
        grid-template-columns: 1fr;
      }

      .accomplishments-grid {
        grid-template-columns: 1fr;
      }

      .page-header {
        padding: 2rem 1rem;

        h1 {
          font-size: 2rem;
        }
      }
    }
  `]
})
export class AccomplishmentsComponent implements OnInit {
  accomplishments: Accomplishment[] = [];
  selectedAccomplishment: Accomplishment | null = null;

  constructor(
    private fleetService: FleetDataService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const currentData = this.fleetService.getFleetData()();
    if (currentData.accomplishments) {
      this.accomplishments = currentData.accomplishments;
      
      // Subscribe to route params to get accomplishment ID
      this.route.params.subscribe(params => {
        if (params['id']) {
          const accomplishment = this.accomplishments.find(a => a.id === params['id']);
          if (accomplishment) {
            this.selectedAccomplishment = accomplishment;
          } else {
            // If accomplishment not found, redirect to list view
            this.router.navigate(['/accomplishments']);
          }
        } else {
          this.selectedAccomplishment = null;
        }
      });
    }
  }

  showAccomplishmentDetails(accomplishment: Accomplishment) {
    // Navigate to the accomplishment details route
    this.router.navigate(['/accomplishments', accomplishment.id]);
  }
} 