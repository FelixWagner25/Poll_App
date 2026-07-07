import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NewSurveyComponent } from './new-survey/new-survey.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NewSurveyComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('Poll_App');
}
