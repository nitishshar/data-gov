import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';
import { FormBuilderComponent } from './form-builder/form-builder.component';
import { ConfigBuilderComponent } from './config-builder/config-builder.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { SquadDetailsComponent } from './squad-details/squad-details.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormBuilderComponent, ConfigBuilderComponent, LandingPageComponent, SquadDetailsComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'data-governance';
  squadData: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get('assets/sample-squad-data.json').subscribe(
      data => {
        this.squadData = data;
      },
      error => {
        console.error('Error fetching squad data:', error);
      }
    );
  }
}
