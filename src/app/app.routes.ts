import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NewSurveyComponent } from './new-survey/new-survey.component';
import { SurveyResultsComponent } from './survey-results/survey-results.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'new-survey', component: NewSurveyComponent },
  { path: 'survey-results', component: SurveyResultsComponent },
];
