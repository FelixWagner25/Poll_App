import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { SurveyService } from '../shared/services/survey.service';
import { Question } from '../shared/interfaces/question';
import { Answer } from '../shared/interfaces/answer';
import { AnswerService } from '../shared/services/answer.service';
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
  answerService = inject(AnswerService);

  surveyId: string | null = null;
  questions = signal<Question[]>([]);
  answers = signal<Answer[][]>([]);
  survey = computed(
    () =>
      this.surveyService.surveyList().filter((survey) => {
        return survey.id === this.surveyId;
      })[0],
  );
  questionsForm = new FormArray<FormGroup<QuestionSelectionForm>>([]);

  async ngOnInit(): Promise<void> {
    const currentSurveyId = this.route.snapshot.paramMap.get('id');
    if (currentSurveyId === null) return;
    this.surveyId = currentSurveyId;

    try {
      const questions = await this.surveyService.getQuestionsBySurveyId(this.surveyId);
      this.questions.set(
        [...questions].sort((a, b) => {
          return a.positionIndex - b.positionIndex;
        }),
      );
    } catch (error) {
      console.error(error);
    }

    try {
      for (let i = 0; i < this.questions().length; i++) {
        const questionId = this.questions()[i].id;
        let questionAnswers = await this.surveyService.getAnswersByQuestionId(questionId);
        questionAnswers.sort((a, b) => {
          return a.positionIndex - b.positionIndex;
        });
        this.answers.set([...this.answers(), questionAnswers]);
      }
      this.buildQuestionsForm();
    } catch (error) {
      console.log(error);
    }
    console.log(this.survey());
  }

  convertISOtoGermanDateStr(endDate: string): string {
    if (endDate === '') return '';
    let strArr = endDate.split('-');
    const year = strArr[0];
    const month = strArr[1];
    const day = strArr[2];
    return year + '.' + month + '.' + day;
  }

  getAnswerResult(resultCount: number, participantsCount: number): string {
    if (participantsCount == 0) return '0 %';
    return String(Math.round((resultCount / participantsCount) * 100)) + ' %';
  }

  toggleAnswer(questionIndex: number, answerIndex: number): void {
    const questionGroup = this.questionsForm.at(questionIndex);
    const selectedAnswers = questionGroup.controls.selectedAnswers;
    const answerControl = selectedAnswers.at(answerIndex);
    answerControl.setValue(!answerControl.value);
  }

  publishAnswerSelection() {
    if (this.questionsForm.invalid) {
      this.questionsForm.markAllAsTouched();
      console.log('All touched');
    }
    console.log('Complete survey');

    //this.router.navigate(['/'], { fragment: 'surveys' });
  }

  buildQuestionsForm(): void {
    this.questionsForm.clear();
    for (let i = 0; i < this.questions().length; i++) {
      const questionAnswers = this.answers()[i];

      const answerControls = new FormArray<FormControl<boolean>>([], {
        validators: [answerSelectionValidator(this.questions()[i].multipleAnswers)],
      });

      for (let j = 0; j < questionAnswers.length; j++) {
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
