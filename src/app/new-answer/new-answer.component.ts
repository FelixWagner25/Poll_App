import { Component, inject, input, output } from '@angular/core';
import { AnswerService } from '../shared/services/answer.service';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-new-answer',
  imports: [ReactiveFormsModule],
  templateUrl: './new-answer.component.html',
  styleUrl: './new-answer.component.scss',
})
export class NewAnswerComponent {
  answerNumber = input<number>(0);
  deleteAnswerEvent = output();
  answerControl = input.required<FormControl<string>>();

  answerService = inject(AnswerService);
}
