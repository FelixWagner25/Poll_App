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
  answerValue = input<string>('');
  answerInputEvent = output<string>();

  answerService = inject(AnswerService);

  answerForm = new FormControl('', { nonNullable: true, validators: [Validators.required] });
}
