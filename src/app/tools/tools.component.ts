import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { FleetDataService } from '../services/fleet-management.service';

interface Tool {
  id: number;
  name: string;
  description: string;
  squad: string;
  color: string;
  link: string;
  documentation: string;
  support: {
    type: 'link' | 'text';
    content: string;
  };
  features: string[];
  technicalDetails: string[];
}

@Component({
  selector: 'app-tools',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  template: `
    <!-- Intro Section -->
    <section class="intro-section glass-container">
      <div class="content-wrapper">
        <h1>Fleet Management Tools</h1>
        <p class="intro-text">
          Discover our comprehensive suite of fleet management tools designed to optimize operations,
          enhance efficiency, and drive innovation in fleet management.
        </p>
      </div>
      <div class="glass-overlay"></div>
    </section>

    <!-- Tools Summary Table -->
    <section class="summary-section glass-container">
      <div class="content-wrapper">
        <h2>Tools Overview</h2>
        <div class="table-container glass-effect">
          <table class="tools-table">
            <thead>
              <tr>
                <th>SL No.</th>
                <th>Tool Name</th>
                <th>Summary</th>
                <th>Managing Squad</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let tool of tools; let i = index">
                <td>{{i + 1}}</td>
                <td>{{tool.name}}</td>
                <td>{{tool.description}}</td>
                <td>{{tool.squad}}</td>
                <td>
                  <button mat-button color="primary" [routerLink]="['/tools', tool.id]">
                    <mat-icon>launch</mat-icon>
                    View Details
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="glass-overlay"></div>
    </section>

    <!-- Individual Tool Sections -->
    <section *ngFor="let tool of tools" class="tool-section glass-container" [id]="'tool-' + tool.id">
      <div class="content-wrapper">
        <div class="tool-header" [style.background-color]="tool.color + '33'">
          <h2>{{tool.name}}</h2>
          <div class="squad-badge">
            Managed by: {{tool.squad}}
          </div>
        </div>

        <div class="tool-content glass-effect">
          <div class="tool-description">
            <h3>About this Tool</h3>
            <p>{{tool.description}}</p>
          </div>

          <div class="tool-features">
            <h3>Key Features</h3>
            <ul>
              <li *ngFor="let feature of tool.features">{{feature}}</li>
            </ul>
          </div>

          <div class="tool-technical">
            <h3>Technical Details</h3>
            <ul>
              <li *ngFor="let detail of tool.technicalDetails">{{detail}}</li>
            </ul>
          </div>

          <div class="tool-documentation glass-effect">
            <h3>Documentation</h3>
            <a [href]="tool.documentation" target="_blank" class="doc-link">
              <mat-icon>description</mat-icon>
              View Documentation
            </a>
          </div>

          <div class="tool-support glass-effect">
            <h3>Help & Support</h3>
            <ng-container [ngSwitch]="tool.support.type">
              <a *ngSwitchCase="'link'" [href]="tool.support.content" target="_blank" class="support-link">
                <mat-icon>help</mat-icon>
                Get Support
              </a>
              <p *ngSwitchCase="'text'" class="support-text">{{tool.support.content}}</p>
            </ng-container>
          </div>
        </div>
      </div>
      <div class="glass-overlay"></div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%);
      min-height: 100vh;
      color: #2c3e50;
    }

    .glass-container {
      position: relative;
      margin: 2rem;
      padding: 2rem;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    }

    .glass-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(10px);
      z-index: 0;
    }

    .content-wrapper {
      position: relative;
      z-index: 1;
    }

    .intro-section {
      text-align: center;
      padding: 4rem 2rem;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));

      h1 {
        font-size: 3rem;
        margin-bottom: 1rem;
        font-weight: 300;
        letter-spacing: 0.05em;
        color: #1a237e;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
      }

      .intro-text {
        font-size: 1.2rem;
        max-width: 800px;
        margin: 0 auto;
        line-height: 1.6;
        color: #455a64;
      }
    }

    .glass-effect {
      background: rgba(255, 255, 255, 0.7);
      border-radius: 8px;
      padding: 1.5rem;
      backdrop-filter: blur(5px);
      border: 1px solid rgba(255, 255, 255, 0.8);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }

    .tools-table {
      width: 100%;
      border-collapse: collapse;
      color: #2c3e50;

      th, td {
        padding: 1rem;
        text-align: left;
        border-bottom: 1px solid rgba(0, 0, 0, 0.08);
      }

      th {
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #1a237e;
      }

      tr:hover {
        background: rgba(255, 255, 255, 0.5);
      }
    }

    .tool-section {
      margin-top: 3rem;

      .tool-header {
        padding: 2rem;
        border-radius: 8px 8px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(255, 255, 255, 0.9) !important;

        h2 {
          margin: 0;
          font-size: 2rem;
          font-weight: 300;
          color: #1a237e;
        }

        .squad-badge {
          background: rgba(26, 35, 126, 0.1);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          color: #1a237e;
        }
      }

      .tool-content {
        margin-top: 1rem;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        padding: 2rem;

        h3 {
          color: #1a237e;
          margin-bottom: 1rem;
          font-weight: 500;
        }

        ul {
          list-style-type: none;
          padding: 0;

          li {
            margin-bottom: 0.5rem;
            padding-left: 1.5rem;
            position: relative;
            color: #455a64;

            &:before {
              content: "•";
              position: absolute;
              left: 0;
              color: #1a237e;
            }
          }
        }

        p {
          color: #455a64;
          line-height: 1.6;
        }
      }

      .tool-documentation, .tool-support {
        grid-column: 1 / -1;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;

        a {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #1a237e;
          text-decoration: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          background: rgba(26, 35, 126, 0.1);
          transition: all 0.3s ease;

          &:hover {
            background: rgba(26, 35, 126, 0.2);
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }

          mat-icon {
            font-size: 20px;
            width: 20px;
            height: 20px;
          }
        }

        .support-text {
          color: #455a64;
          line-height: 1.6;
        }
      }
    }

    @media (max-width: 768px) {
      .glass-container {
        margin: 1rem;
        padding: 1rem;
      }

      .tool-content {
        grid-template-columns: 1fr !important;
      }

      .tools-table {
        th, td {
          padding: 0.5rem;
        }
      }

      .intro-section h1 {
        font-size: 2rem;
      }
    }
  `]
})
export class ToolsComponent implements OnInit {
  tools: Tool[] = [];

  constructor(private fleetService: FleetDataService) {}

  ngOnInit() {
    const fleetData = this.fleetService.getFleetData()();
    this.tools = fleetData.tools.map((tool: any, index: number) => ({
      id: index + 1,
      name: tool.name,
      description: tool.description,
      squad: 'Fleet Operations Squad', // This should come from your data
      color: tool.color,
      link: tool.link,
      documentation: '/docs/tools/' + (index + 1), // This should be replaced with actual documentation links
      support: {
        type: 'text',
        content: 'For support, please contact the Fleet Operations Squad at fleet-ops@example.com'
      },
      features: [
        'Real-time monitoring and tracking',
        'Advanced analytics and reporting',
        'Integration with fleet management systems'
      ],
      technicalDetails: [
        'Built with modern web technologies',
        'RESTful API integration',
        'Real-time data processing'
      ]
    }));
  }
} 