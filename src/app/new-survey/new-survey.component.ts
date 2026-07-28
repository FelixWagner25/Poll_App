import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  FormControl,
  FormGroup,
  FormsModule,
  Validators,
  ReactiveFormsModule,
  FormArray,
} from '@angular/forms';
import { SurveyModel } from '../shared/models/survey.model';
import { Category } from '../shared/types/category';
import { SurveyService } from '../shared/services/survey.service';
import { NewQuestionComponent } from '../new-question/new-question.component';
import { QuestionForm } from '../shared/interfaces/question-form';
import { Question } from '../shared/interfaces/question';

@Component({
  selector: 'app-new-survey',
  imports: [RouterLink, FormsModule, ReactiveFormsModule, NewQuestionComponent],
  templateUrl: './new-survey.component.html',
  styleUrl: './new-survey.component.scss',
})
export class NewSurveyComponent {
  dropdownOpened = signal<boolean>(false);
  published = signal<boolean>(false);
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
    questions: new FormArray<FormGroup<QuestionForm>>([]),
  });

  get questionFormArray(): FormArray<FormGroup<QuestionForm>> {
    return this.surveyForm.controls.questions;
  }

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

  deleteFormInput(attribute: 'name' | 'description' | 'endDate'): void {
    this.surveyForm.controls[attribute].setValue('');
  }

  addNextQuestion(): void {
    const numberQuestions = this.questionFormArray.controls.length;
    if (numberQuestions >= this.indexLimitQuestions) return;
    this.surveyForm.controls.questions.push([this.createQuestionGroup()]);
  }

  deleteQuestion(index: number): void {
    if (index == 0) return; //One question is required and must not be deleted.
    this.surveyForm.controls.questions.removeAt(index);
  }

  setFormCategory(category: Category): void {
    this.surveyForm.controls.category.setValue(category);
    this.surveyForm.controls.category.markAllAsTouched();
    this.surveyForm.controls.category.markAllAsDirty();
  }

  createQuestionGroup(): FormGroup<QuestionForm> {
    return new FormGroup<QuestionForm>({
      text: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(3), Validators.maxLength(1024)],
      }),
      multipleAnswers: new FormControl(false, { nonNullable: true }),
      answers: new FormArray<FormControl<string>>([
        this.createAnswerControl(),
        this.createAnswerControl(),
      ]),
    });
  }

  createAnswerControl(): FormControl<string> {
    return new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(512)],
    });
  }
}
