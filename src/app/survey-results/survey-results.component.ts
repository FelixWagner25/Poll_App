import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-survey-results',
  imports: [RouterLink],
  templateUrl: './survey-results.component.html',
  styleUrl: './survey-results.component.scss',
})
export class SurveyResultsComponent {
  private route = inject(ActivatedRoute);
  surveyId: string | null = null;

  ngOnInit() {
    this.surveyId = this.route.snapshot.paramMap.get('id');
  }
}
