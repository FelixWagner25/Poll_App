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
import { NewAnswerComponent } from '../new-answer/new-answer.component';
import { AnswerTransfer } from '../shared/interfaces/answer-transfer';

@Component({
  selector: 'app-new-survey',
  imports: [RouterLink, FormsModule, ReactiveFormsModule, NewQuestionComponent, NewAnswerComponent],
  templateUrl: './new-survey.component.html',
  styleUrl: './new-survey.component.scss',
})
export class NewSurveyComponent {
  dropdownOpened = signal<boolean>(false);
  published = signal<boolean>(false);
  multipleAnswersMandatoryQuestion = signal<boolean>(false);
  addedQuestions = signal<AnswerTransfer[]>([]);
  addedAnswersMandatoryQuestion = signal<AnswerTransfer[]>([]);
  indexLimitAddedQuestions = 5;
  indexLimitAddedAnswers = 4;

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
    firstAnswer: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(1200)],
    }),
    secondAnswer: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(1200)],
    }),
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

  deleteFormInput(
    attribute:
      | 'name'
      | 'description'
      | 'endDate'
      | 'firstQuestion'
      | 'firstAnswer'
      | 'secondAnswer',
  ) {
    this.surveyForm.controls[attribute].setValue('');
  }

  toggleCheckbox() {
    this.multipleAnswersMandatoryQuestion.update((value) => !value);
  }

  addNextQuestion() {
    const numberAddedQuestions = this.addedQuestions().length;
    let nextIndex: number;
    if (numberAddedQuestions == 0) {
      nextIndex = 0;
      this.addedQuestions.update(() => [{ internalId: 0, inputValue: '' }]);
    } else {
      nextIndex = this.addedQuestions()[numberAddedQuestions - 1].internalId + 1;
      if (numberAddedQuestions >= this.indexLimitAddedQuestions) return;
      this.addedQuestions.update((array) => [...array, { internalId: nextIndex, inputValue: '' }]);
    }
  }

  addNextAnswer() {
    const numberaddedAnswersMandatoryQuestion = this.addedAnswersMandatoryQuestion().length;
    let nextIndex: number;
    if (numberaddedAnswersMandatoryQuestion == 0) {
      nextIndex = 0;
      this.addedAnswersMandatoryQuestion.update(() => [{ internalId: 0, inputValue: '' }]);
    } else {
      nextIndex =
        this.addedAnswersMandatoryQuestion()[numberaddedAnswersMandatoryQuestion - 1].internalId +
        1;
      if (numberaddedAnswersMandatoryQuestion >= this.indexLimitAddedAnswers) return;
      this.addedAnswersMandatoryQuestion.update((array) => [
        ...array,
        { internalId: nextIndex, inputValue: '' },
      ]);
    }
  }

  deleteAnswer(internalId: number) {
    let index = this.addedAnswersMandatoryQuestion().findIndex(
      (answer) => answer.internalId == internalId,
    );
    this.addedAnswersMandatoryQuestion().splice(index, 1);
  }

  updateAnswerInputValue(internalId: number, updateValue: string) {
    this.addedAnswersMandatoryQuestion.update((answers) =>
      answers.map((answer) =>
        answer.internalId === internalId
          ? {
              internalId: internalId,
              inputValue: updateValue,
            }
          : answer,
      ),
    );
  }

  deleteQuestion(internalId: number) {
    let index = this.addedQuestions().findIndex((question) => question.internalId == internalId);
    this.addedQuestions().splice(index, 1);
  }

  updateQuestionInputValue(internalId: number, updateValue: string) {
    this.addedQuestions.update((questions) =>
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
