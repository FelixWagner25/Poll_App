import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NewSurveyComponent } from './new-survey/new-survey.component';

export const routes: Routes = [
  { path: '', component: NewSurveyComponent }, //HomeComponent },
  { path: 'new-survey', component: NewSurveyComponent },
];
