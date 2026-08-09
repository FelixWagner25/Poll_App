import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { SurveyService } from '../shared/services/survey.service';
import { Question } from '../shared/interfaces/question';
import { Answer } from '../shared/interfaces/answer';
import { AnswerService } from '../shared/services/answer.service';

@Component({
  selector: 'app-survey-results',
  imports: [RouterLink],
  templateUrl: './survey-results.component.html',
  styleUrl: './survey-results.component.scss',
})
export class SurveyResultsComponent {
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
    } catch (error) {}
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

  toggleAnswer(answer: Answer): void {
    answer.userSelected = !answer.userSelected;
    if (answer.userSelected) {
      answer.resultCount++;
    } else {
      if (answer.resultCount == 0) return;
      answer.resultCount--;
    }
  }
}
