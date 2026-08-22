import { Component, inject, signal, Renderer2, computed } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { SurveyService } from '../shared/services/survey.service';
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
import { calcDateDiffDays, getTodaysShortISOString } from '../shared/utilities/utilities';
import { NewSurveyComponent } from '../new-survey/new-survey.component';
import { SurveyWithResults } from '../shared/interfaces/suvery-with-results';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-survey-results',
  imports: [RouterLink, ReactiveFormsModule, NewSurveyComponent],
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
  overlayOpen = signal(false);

  questionsForm = new FormArray<FormGroup<QuestionSelectionForm>>([]);

  formValue = toSignal(this.questionsForm.valueChanges, {
    initialValue: this.questionsForm.value,
  });

  resultPreview = computed<SurveyWithResults | null>(() => {
    const survey = this.surveyService.survey();
    const formValue = this.formValue();
    if (!survey) return null;

    const hasSelection = formValue.some((question) =>
      question.selectedAnswers?.some((isSelected) => isSelected),
    );
    const participantsCount = survey.participantsCount + (hasSelection ? 1 : 0);

    return {
      ...survey,
      participantsCount,
      questions: survey.questions.map((question, questionIndex) => ({
        ...question,
        answers: question.answers.map((answer, answerIndex) => {
          const isSelected = formValue[questionIndex]?.selectedAnswers?.[answerIndex] ?? false;
          return {
            ...answer,
            resultCount: answer.resultCount + (isSelected ? 1 : 0),
          };
        }),
      })),
    };
  });

  constructor(private renderer: Renderer2) {}

  /**
   * Loads survey results of selected survey id and builds the question form for answer submit to backend.
   *
   */
  async ngOnInit(): Promise<void> {
    const surveyId = this.route.snapshot.paramMap.get('id');
    if (!surveyId) return;
    if (!this.surveyIsSubmittable) this.questionsForm.markAllAsTouched();
    this.surveyId = surveyId;
    await this.surveyService.loadSurveyWithResults(this.surveyId);
    this.buildQuestionsForm();
  }

  /**
   * Converts survey end date to date following german date format convention.
   *
   * @param endDate - survey end date
   * @returns day string in german date format convention
   */
  convertISOtoGermanDateStr(endDate: string): string {
    if (endDate === '') return '';
    let strArr = endDate.split('-');
    const year = strArr[0];
    const month = strArr[1];
    const day = strArr[2];
    return day + '.' + month + '.' + year;
  }

  /**
   * Toggles answer selection in survey result form.
   *
   * @param questionIndex - index of question
   * @param answerIndex - index of answer
   */
  toggleAnswer(questionIndex: number, answerIndex: number): void {
    if (!this.surveyIsSubmittable()) return;
    const questionGroup = this.questionsForm.at(questionIndex);
    const selectedAnswers = questionGroup.controls.selectedAnswers;
    const answerControl = selectedAnswers.at(answerIndex);
    answerControl.setValue(!answerControl.value);
  }

  /**
   * Publishes survey answer selection and pushes data to supabase backend.
   */
  async publishAnswerSelection(): Promise<void> {
    if (!this.surveyIsSubmittable()) return;
    if (this.questionsForm.invalid) {
      this.questionsForm.markAllAsTouched();
      return;
    }
    await this.addSelectedAnswersToDatabase();
    this.surveyService.submittedSurveyIds.update((ids) => [...ids, this.surveyId]);
    this.questionsForm.reset();
  }

  /**
   * Pushes selected answers to backend.
   *
   */
  async addSelectedAnswersToDatabase(): Promise<void> {
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
  }

  /**
   * Builds question form for survey result form.
   *
   */
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

  /**
   * Checks whether survey has expired.
   *
   * @returns true if survey has expired, otherwise false
   */
  surveyHasEnded(): boolean {
    let survey = this.surveyService.survey();
    if (survey) {
      const todayStr = getTodaysShortISOString();
      const diffDays = calcDateDiffDays(todayStr, survey.endDate);
      return diffDays < 0;
    } else {
      return false;
    }
  }

  /**
   * Checks whether user already submitted survey in this session.
   *
   * @returns true if survey has already been submitted, otherwise false
   */
  surveyWasSubmitted(): boolean {
    for (let i = 0; i < this.surveyService.submittedSurveyIds().length; i++) {
      if (this.surveyService.submittedSurveyIds()[i] === this.surveyId) return true;
    }
    return false;
  }

  /**
   * Checks whether a survey is submittable.
   *
   * @returns true if survey is submittable, otherwise false
   */
  surveyIsSubmittable(): boolean {
    return !this.surveyHasEnded() && !this.surveyWasSubmitted();
  }

  /**
   * Opens new survey overlay.
   *
   */
  openOverlay(): void {
    this.overlayOpen.set(true);
    this.renderer.addClass(document.body, 'overflow-hidden');
  }

  /**
   * Closes new survey overlay.
   *
   */
  closeOverlay(): void {
    this.overlayOpen.set(false);
    this.renderer.removeClass(document.body, 'overflow-hidden');
  }
}

/**
 * Validator function for answers in survey result form. Checks both wether at least one selection has been made and whether number of selected answers is allowed.
 *
 * @param multipleAnswers - multiple answer allowance switch
 * @returns
 */
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
