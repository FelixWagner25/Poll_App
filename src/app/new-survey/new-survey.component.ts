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
  multipleAnswers = signal<boolean>(false);
  addedQuestions = signal<number[]>([]);
  addedAnswers = signal<AnswerTransfer[]>([]);

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
    this.multipleAnswers.update((value) => !value);
  }

  addNextQuestion() {
    let nextIndex = this.addedQuestions().length;
    if (nextIndex >= 4) return;
    this.addedQuestions.update((array) => [...array, nextIndex]);
  }

  addNextAnswer() {
    const numberAddedAnswers = this.addedAnswers().length;
    let nextIndex: number;
    if (numberAddedAnswers == 0) {
      nextIndex = 0;
      this.addedAnswers.update(() => [{ internalId: 0, inputValue: '' }]);
    } else {
      nextIndex = this.addedAnswers()[numberAddedAnswers - 1].internalId + 1;
      if (numberAddedAnswers >= 4) return;
      this.addedAnswers.update((array) => [...array, { internalId: nextIndex, inputValue: '' }]);
    }
  }

  deleteAnswer(internalId: number) {
    let index = this.addedAnswers().findIndex((answer) => answer.internalId == internalId);
    this.addedAnswers().splice(index, 1);
  }

  updateAnswerInputValue(internalId: number, updateValue: string) {
    this.addedAnswers.update((answers) =>
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
