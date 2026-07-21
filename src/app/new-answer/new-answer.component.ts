import { Component, inject, input } from '@angular/core';
import { AnswerService } from '../shared/services/answer.service';

@Component({
  selector: 'app-new-answer',
  imports: [],
  templateUrl: './new-answer.component.html',
  styleUrl: './new-answer.component.scss',
})
export class NewAnswerComponent {
  answerNumber = input<number>(0);

  answerService = inject(AnswerService);
}
