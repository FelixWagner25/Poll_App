import { Component, signal, input, output } from '@angular/core';
import { NewAnswerComponent } from '../new-answer/new-answer.component';
import { InputTransfer } from '../shared/interfaces/input-transfer';
import { FormControl, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-new-question',
  imports: [NewAnswerComponent, ReactiveFormsModule],
  templateUrl: './new-question.component.html',
  styleUrl: './new-question.component.scss',
})
export class NewQuestionComponent {
  answers = signal<InputTransfer[]>([
    { internalId: 0, inputValue: '' },
    { internalId: 1, inputValue: '' },
  ]);
  multipleAnswers = signal<boolean>(false);
  questionNumber = input<number>(0);
  indexLimitAnswers = 6;
  deleteQuestionEvent = output();
  questionInputEvent = output<string>();
  questionInputValue = input<string>();
  questionFormControl = input<FormControl<string>>(
    new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  );

  addNextAnswer() {
    const numberAnswers = this.answers().length;
    let nextIndex: number;
    if (numberAnswers == 0) {
      nextIndex = 0;
      this.answers.update(() => [{ internalId: 0, inputValue: '' }]);
    } else {
      nextIndex = this.answers()[numberAnswers - 1].internalId + 1;
      if (numberAnswers >= this.indexLimitAnswers) return;
      this.answers.update((array) => [...array, { internalId: nextIndex, inputValue: '' }]);
    }
  }

  deleteAnswer(internalId: number) {
    let index = this.answers().findIndex((answer) => answer.internalId == internalId);
    this.answers().splice(index, 1);
  }

  updateAnswerInputValue(internalId: number, updateValue: string) {
    this.answers.update((answers) =>
      answers.map((answer) =>
        answer.internalId === internalId
          ? {
              internalId: internalId,
              inputValue: updateValue,
            }
          : answer,
      ),
    );
  }

  toggleCheckbox() {
    this.multipleAnswers.update((value) => !value);
  }
}
