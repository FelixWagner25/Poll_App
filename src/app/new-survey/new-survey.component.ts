import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';

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

  surveyForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    description: new FormControl(''),
    date: new FormControl('9999.12.31'),
    category: new FormControl('not assigned'),
    questions: new FormControl([]),
  });

  publishSurvey() {
    this.published.set(!this.published());
    //this.router.navigate(['/survey-results']);
  }

  toggleDropdown() {
    this.dropdownOpened.update((value) => !value);
  }
}
