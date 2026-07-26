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
  selectedCategory: Category = null;
  multipleAnswersMandatoryQuestion = signal<boolean>(false);
  addedQuestions = signal<number[]>([]);
  addedAnswersMandatoryQuestion = signal<AnswerTransfer[]>([]);

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
    category: new FormControl(null, { validators: [Validators.required] }),
    firstQuestion: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(1200)],
    }),
  });

  publishSurvey(): void {
    this.published.set(!this.published());
    let survey = new SurveyModel(this.surveyForm.value);
    this.surveyService.addSurvey(survey);

    //this.navigateToPublishedSurvey();
  }

  navigateToPublishedSurvey(): void {
    this.router.navigate(['/survey-results']);
  }

  toggleDropdown(): void {
    this.dropdownOpened.update((value) => !value);
  }

  setSelectedCategory(value: Category): void {
    this.selectedCategory = value;
    this.toggleDropdown();
  }

  deleteFormInput(attribute: 'name' | 'description' | 'endDate' | 'firstQuestion') {
    this.surveyForm.controls[attribute].setValue('');
  }

  toggleCheckbox() {
    this.multipleAnswersMandatoryQuestion.update((value) => !value);
  }

  addNextQuestion() {
    let nextIndex = this.addedQuestions().length;
    if (nextIndex >= 4) return;
    this.addedQuestions.update((array) => [...array, nextIndex]);
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
      if (numberaddedAnswersMandatoryQuestion >= 4) return;
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
}
