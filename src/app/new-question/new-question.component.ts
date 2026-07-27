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
  addedQuestions = signal<number[]>([]);
  addedAnswers = signal<InputTransfer[]>([]);
  multipleAnswers = signal<boolean>(false);
  questionNumber = input<number>(0);
  indexLimitAddedAnswers = 4;
  deleteQuestionEvent = output();
  questionInputEvent = output<string>();
  questionInputValue = input<string>();

  questionForm = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3), Validators.maxLength(1200)],
  });

  firstAnswerForm = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(1200)],
  });

  secondAnswerForm = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(1200)],
  });

  addNextAnswer() {
    const numberAddedAnswers = this.addedAnswers().length;
    let nextIndex: number;
    if (numberAddedAnswers == 0) {
      nextIndex = 0;
      this.addedAnswers.update(() => [{ internalId: 0, inputValue: '' }]);
    } else {
      nextIndex = this.addedAnswers()[numberAddedAnswers - 1].internalId + 1;
      if (numberAddedAnswers >= this.indexLimitAddedAnswers) return;
      this.addedAnswers.update((array) => [...array, { internalId: nextIndex, inputValue: '' }]);
    }
  }

  deleteAnswer(internalId: number) {
    let index = this.addedAnswers().findIndex((answer) => answer.internalId == internalId);
    this.addedAnswers().splice(index, 1);
  }

  updateAnswerInputValue(internalId: number, updateValue: string) {
    this.addedAnswers.update((answers) =>
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
