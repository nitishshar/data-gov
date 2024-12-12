import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  landingPageForm!: FormGroup;
  squadDetailsForm!: FormGroup;

  menuItems = [
    { path: 'landing-page', icon: 'home', label: 'Landing Page' },
    { path: 'squad-details', icon: 'groups', label: 'Squad Details' },
    { path: 'tools', icon: 'build', label: 'Tools Management' },
    { path: 'programs', icon: 'school', label: 'Programs' },
    { path: 'members', icon: 'person', label: 'Members' },
    { path: 'settings', icon: 'settings', label: 'Settings' }
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.initializeForms();
  }

  ngOnInit() {
    this.loadCurrentData();
  }

  // Helper getters for the template
  get objectivesArray(): FormArray {
    return this.landingPageForm.get('objectives') as FormArray;
  }

  get leadershipArray(): FormArray {
    return this.landingPageForm.get('leadership') as FormArray;
  }

  get toolsArray(): FormArray {
    return this.landingPageForm.get('tools') as FormArray;
  }

  get programsArray(): FormArray {
    return this.landingPageForm.get('programs') as FormArray;
  }

  get squadsArray(): FormArray {
    return this.landingPageForm.get('squads') as FormArray;
  }

  private initializeForms() {
    this.landingPageForm = this.fb.group({
      name: ['', Validators.required],
      missionStatement: ['', Validators.required],
      objectives: this.fb.array([]),
      leadership: this.fb.array([]),
      tools: this.fb.array([]),
      programs: this.fb.array([]),
      squads: this.fb.array([])
    });

    this.squadDetailsForm = this.fb.group({
      name: ['', Validators.required],
      missionStatement: ['', Validators.required],
      leader: this.fb.group({
        name: ['', Validators.required],
        title: ['', Validators.required],
        image: [''],
        email: ['', [Validators.required, Validators.email]],
        department: [''],
        phone: ['']
      }),
      objectives: this.fb.array([]),
      members: this.fb.array([]),
      recentDocuments: this.fb.array([]),
      projects: this.fb.array([]),
      helpAndSupport: ['']
    });
  }

  // Array manipulation methods
  addObjective() {
    this.objectivesArray.push(this.fb.control('', Validators.required));
  }

  removeObjective(index: number) {
    this.objectivesArray.removeAt(index);
  }

  addLeader() {
    this.leadershipArray.push(
      this.fb.group({
        name: ['', Validators.required],
        title: ['', Validators.required],
        image: [''],
        email: ['', [Validators.required, Validators.email]],
        department: [''],
        phone: ['']
      })
    );
  }

  removeLeader(index: number) {
    this.leadershipArray.removeAt(index);
  }

  private loadCurrentData() {
    // Load landing page data
    this.http.get('/api/landing-page').subscribe({
      next: (data: any) => {
        this.landingPageForm.patchValue(data);
      },
      error: (error) => {
        this.snackBar.open('Error loading landing page data', 'Close', {
          duration: 3000
        });
      }
    });

    // Load squad details data
    this.http.get('/api/squad-details').subscribe({
      next: (data: any) => {
        this.squadDetailsForm.patchValue(data);
      },
      error: (error) => {
        this.snackBar.open('Error loading squad details', 'Close', {
          duration: 3000
        });
      }
    });
  }

  saveLandingPage() {
    if (this.landingPageForm.valid) {
      this.http.post('/api/landing-page', this.landingPageForm.value).subscribe({
        next: () => {
          this.snackBar.open('Landing page updated successfully', 'Close', {
            duration: 3000
          });
        },
        error: (error) => {
          this.snackBar.open('Error updating landing page', 'Close', {
            duration: 3000
          });
        }
      });
    }
  }

  saveSquadDetails() {
    if (this.squadDetailsForm.valid) {
      this.http.post('/api/squad-details', this.squadDetailsForm.value).subscribe({
        next: () => {
          this.snackBar.open('Squad details updated successfully', 'Close', {
            duration: 3000
          });
        },
        error: (error) => {
          this.snackBar.open('Error updating squad details', 'Close', {
            duration: 3000
          });
        }
      });
    }
  }
} 