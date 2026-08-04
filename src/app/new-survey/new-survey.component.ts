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
import { QuestionModel } from '../shared/models/question.model';
import { QuestionService } from '../shared/services/question.service';
import { AnswerModel } from '../shared/models/answer.model';
import { AnswerService } from '../shared/services/answer.service';

@Component({
  selector: 'app-new-survey',
  imports: [RouterLink, FormsModule, ReactiveFormsModule, NewQuestionComponent],
  templateUrl: './new-survey.component.html',
  styleUrl: './new-survey.component.scss',
})
export class NewSurveyComponent {
  router = inject(Router);
  surveyService = inject(SurveyService);
  questionService = inject(QuestionService);
  answerService = inject(AnswerService);

  dropdownOpened = signal<boolean>(false);
  published = signal<boolean>(false);
  indexLimitQuestions = 6;
  readonly surveyId: string = crypto.randomUUID();

  surveyForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(1024)],
    }),
    endDate: new FormControl('', {
      nonNullable: true,
      validators: [Validators.pattern(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/)],
    }),
    category: new FormControl<Category>(null, { validators: [Validators.required] }),
    questions: new FormArray<FormGroup<QuestionForm>>([this.createQuestionGroup()]),
  });

  get questionFormArray(): FormArray<FormGroup<QuestionForm>> {
    return this.surveyForm.controls.questions;
  }

  publishSurvey(surveyId: string): void {
    if (this.surveyForm.invalid) {
      this.surveyForm.markAllAsTouched();
      return;
    }
    let survey = new SurveyModel({ ...this.surveyForm.value, id: surveyId });
    this.surveyService.addSurvey(survey);
    this.addQuestionsToDatabase(surveyId);

    this.published.set(!this.published());
  }

  addQuestionsToDatabase(surveyId: string) {
    for (let i = 0; i < this.questionFormArray.length; i++) {
      let questionId = crypto.randomUUID();
      let question = new QuestionModel({
        ...this.questionFormArray.at(i).value,
        id: questionId,
        surveyId: surveyId,
      });
      this.questionService.addQuestion(question);
      this.addAnswersToDatabase(i, questionId);
    }
  }

  addAnswersToDatabase(formGroupIndex: number, questionId: string) {
    for (let j = 0; j < this.questionFormArray.at(formGroupIndex).controls.answers.length; j++) {
      let answerId = crypto.randomUUID();
      let answer = new AnswerModel({
        text: this.questionFormArray.at(formGroupIndex).controls.answers.at(j).value,
        id: answerId,
        questionId: questionId,
      });
      this.answerService.addAnswer(answer);
    }
  }

  navigateToPublishedSurvey(surveyId: string): void {
    this.router.navigate(['/survey-results', surveyId]);
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
    if (index == 0) {
      this.surveyForm.controls.questions.at(index).controls.text.setValue('');
    } else {
      this.surveyForm.controls.questions.removeAt(index);
    }
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
