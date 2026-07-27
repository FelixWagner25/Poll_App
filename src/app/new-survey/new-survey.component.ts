import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  FormControl,
  FormGroup,
  FormsModule,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { SurveyModel } from '../shared/models/survey.model';
import { Category } from '../shared/types/category';
import { SurveyService } from '../shared/services/survey.service';
import { NewQuestionComponent } from '../new-question/new-question.component';
import { InputTransfer } from '../shared/interfaces/input-transfer';

@Component({
  selector: 'app-new-survey',
  imports: [RouterLink, FormsModule, ReactiveFormsModule, NewQuestionComponent],
  templateUrl: './new-survey.component.html',
  styleUrl: './new-survey.component.scss',
})
export class NewSurveyComponent {
  dropdownOpened = signal<boolean>(false);
  published = signal<boolean>(false);
  questions = signal<InputTransfer[]>([{ internalId: 0, inputValue: '' }]);
  indexLimitQuestions = 5;

  router = inject(Router);
  surveyService = inject(SurveyService);

  surveyForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(10)],
    }),
    endDate: new FormControl('', {
      nonNullable: true,
      validators: [Validators.pattern(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/)],
    }),
    category: new FormControl<Category>(null, { validators: [Validators.required] }),
    firstQuestion: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(1200)],
    }),
    questions: new FormGroup({}),
  });

  publishSurvey(): void {
    if (this.surveyForm.invalid) {
      this.surveyForm.markAllAsTouched();
      return;
    }
    this.published.set(!this.published());
    //@TODO here is a problem with the category assignment of suveryForm
    let survey = new SurveyModel(this.surveyForm.value);
    this.surveyService.addSurvey(survey);
  }

  navigateToPublishedSurvey(): void {
    this.router.navigate(['/survey-results']);
  }

  toggleDropdown(): void {
    this.dropdownOpened.update((value) => !value);
  }

  setSelectedCategory(category: Category): void {
    this.setFormCategory(category);
    this.toggleDropdown();
  }

  deleteFormInput(attribute: 'name' | 'description' | 'endDate') {
    this.surveyForm.controls[attribute].setValue('');
  }

  addNextQuestion() {
    const numberquestions = this.questions().length;
    let nextIndex: number;
    if (numberquestions == 0) {
      nextIndex = 0;
      this.questions.update(() => [{ internalId: 0, inputValue: '' }]);
    } else {
      nextIndex = this.questions()[numberquestions - 1].internalId + 1;
      if (numberquestions >= this.indexLimitQuestions) return;
      this.questions.update((array) => [...array, { internalId: nextIndex, inputValue: '' }]);
    }
  }

  deleteQuestion(internalId: number) {
    if (internalId == 0) return; //One question is required and must not be deleted.
    let index = this.questions().findIndex((question) => question.internalId == internalId);
    this.questions().splice(index, 1);
  }

  updateQuestionInputValue(internalId: number, updateValue: string) {
    this.questions.update((questions) =>
      questions.map((question) =>
        question.internalId === internalId
          ? {
              internalId: internalId,
              inputValue: updateValue,
            }
          : question,
      ),
    );
  }

  setFormCategory(category: Category) {
    this.surveyForm.controls.category.setValue(category);
    this.surveyForm.controls.category.markAllAsTouched();
    this.surveyForm.controls.category.markAllAsDirty();
  }
}
