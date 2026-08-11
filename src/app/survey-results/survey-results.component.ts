import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { SurveyService } from '../shared/services/survey.service';
import { Question } from '../shared/interfaces/question';
import { Answer } from '../shared/interfaces/answer';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { QuestionSelectionForm } from '../shared/interfaces/question-selection-form';

@Component({
  selector: 'app-survey-results',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './survey-results.component.html',
  styleUrl: './survey-results.component.scss',
})
export class SurveyResultsComponent {
  router = inject(Router);
  private route = inject(ActivatedRoute);
  readonly surveyService = inject(SurveyService);

  surveyId = '';
  survey = this.surveyService.survey;
  questions = this.surveyService.surveyQuestions;

  questionsForm = new FormArray<FormGroup<QuestionSelectionForm>>([]);

  async ngOnInit(): Promise<void> {
    const surveyId = this.route.snapshot.paramMap.get('id');
    if (!surveyId) return;
    this.surveyId = surveyId;
    await this.surveyService.loadSurveyWithResults(this.surveyId);
    this.buildQuestionsForm();
  }

  convertISOtoGermanDateStr(endDate: string): string {
    if (endDate === '') return '';
    let strArr = endDate.split('-');
    const year = strArr[0];
    const month = strArr[1];
    const day = strArr[2];
    return year + '.' + month + '.' + day;
  }

  toggleAnswer(questionIndex: number, answerIndex: number): void {
    const questionGroup = this.questionsForm.at(questionIndex);
    const selectedAnswers = questionGroup.controls.selectedAnswers;
    const answerControl = selectedAnswers.at(answerIndex);
    answerControl.setValue(!answerControl.value);
  }

  async publishAnswerSelection() {
    if (this.questionsForm.invalid) {
      this.questionsForm.markAllAsTouched();
      return;
    }
    const selectedAnswerIds: string[] = [];

    this.questions().forEach((question, questionIndex) => {
      const selections = this.questionsForm.at(questionIndex).controls.selectedAnswers;

      question.answers.forEach((answer, answerIndex) => {
        if (selections.at(answerIndex).value) {
          selectedAnswerIds.push(answer.id);
        }
      });
    });

    await this.surveyService.submitSurveyResults(this.surveyId, selectedAnswerIds);
    //this.router.navigate(['/'], { fragment: 'surveys' });
  }

  buildQuestionsForm(): void {
    this.questionsForm.clear();
    for (let i = 0; i < this.questions().length; i++) {
      const answerControls = new FormArray<FormControl<boolean>>([], {
        validators: [answerSelectionValidator(this.questions()[i].multipleAnswers)],
      });

      for (let j = 0; j < this.questions()[i].answers.length; j++) {
        answerControls.push(
          new FormControl<boolean>(false, {
            nonNullable: true,
          }),
        );
      }

      const questionGroup = new FormGroup<QuestionSelectionForm>({
        selectedAnswers: answerControls,
      });
      this.questionsForm.push(questionGroup);
    }
  }
}

export function answerSelectionValidator(multipleAnswers: boolean): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const selectedAnswers = control.value as boolean[];
    const selectedCount = selectedAnswers.filter((selection) => {
      return selection;
    }).length;

    if (selectedCount === 0) return { noAnswerSelected: true };

    if (!multipleAnswers && selectedCount > 1) return { multipleAnswersNotAllowed: true };

    return null;
  };
}
