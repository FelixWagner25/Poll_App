import { Component, input, output } from '@angular/core';
import { NewAnswerComponent } from '../new-answer/new-answer.component';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { QuestionForm } from '../shared/interfaces/question-form';

@Component({
  selector: 'app-new-question',
  imports: [NewAnswerComponent, ReactiveFormsModule],
  templateUrl: './new-question.component.html',
  styleUrl: './new-question.component.scss',
})
export class NewQuestionComponent {
  questionNumber = input<number>(0);
  indexLimitAnswers = 6;
  deleteQuestionEvent = output();
  questionForm = input.required<FormGroup<QuestionForm>>();

  get answers(): FormArray<FormControl<string>> {
    return this.questionForm().controls.answers;
  }

  get questionControlText(): FormControl<string> {
    return this.questionForm().controls.text;
  }

  addNextAnswer(): void {
    if (this.answers.length >= this.indexLimitAnswers) return;
    this.answers.push(
      new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(512)],
      }),
    );
  }

  deleteAnswer(index: number) {
    if (this.answers.length <= 2) {
      this.answers.at(index).setValue('');
    } else {
      this.answers.removeAt(index);
    }
  }
}
