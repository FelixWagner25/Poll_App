import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { SurveyService } from '../shared/services/survey.service';
import { Question } from '../shared/interfaces/question';

@Component({
  selector: 'app-survey-results',
  imports: [RouterLink],
  templateUrl: './survey-results.component.html',
  styleUrl: './survey-results.component.scss',
})
export class SurveyResultsComponent {
  private route = inject(ActivatedRoute);
  readonly surveyService = inject(SurveyService);

  surveyId: string | null = null;

  questions = signal<Question[]>([]);

  async ngOnInit(): Promise<void> {
    const currentSurveyId = this.route.snapshot.paramMap.get('id');
    if (currentSurveyId === null) return;
    this.surveyId = currentSurveyId;

    try {
      const questions = await this.surveyService.getQuestionsBySurveyId(this.surveyId);
      this.questions.set(questions);
      console.log(this.questions());
    } catch (error) {
      console.error(error);
    }
  }
}
