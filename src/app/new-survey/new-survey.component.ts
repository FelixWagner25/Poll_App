import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { SurveyModel } from '../shared/models/survey.model';
import { Category } from '../shared/types/category';
import { SurveyService } from '../shared/services/survey.service';

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
  surveyService = inject(SurveyService);

  surveyForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    description: new FormControl('', { nonNullable: true }),
    date: new FormControl('9999-12-31', { nonNullable: true }),
    category: new FormControl('n/a' as Category, { nonNullable: true }),
    questionIds: new FormControl([], { nonNullable: true }),
  });

  publishSurvey() {
    this.published.set(!this.published());
    let survey = new SurveyModel(this.surveyForm.value);
    this.surveyService.addSurvey(survey);
    //this.router.navigate(['/survey-results']);
  }

  toggleDropdown() {
    this.dropdownOpened.update((value) => !value);
  }
}
