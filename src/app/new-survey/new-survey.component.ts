import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-new-survey',
  imports: [RouterLink, FormsModule],
  templateUrl: './new-survey.component.html',
  styleUrl: './new-survey.component.scss',
})
export class NewSurveyComponent {
  dropdownOpened = signal<boolean>(false);
  published = signal<boolean>(false);

  router = inject(Router);

  publishSurvey() {
    this.published.set(!this.published());
    //this.router.navigate(['/survey-results']);
  }

  toggleDropdown() {
    this.dropdownOpened.update((value) => !value);
  }
}
