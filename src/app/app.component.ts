import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormBuilderComponent } from './form-builder/form-builder.component';
import { ConfigBuilderComponent } from './config-builder/config-builder.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormBuilderComponent, ConfigBuilderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'data-governance';
}
