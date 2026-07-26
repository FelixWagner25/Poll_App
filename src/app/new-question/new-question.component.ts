import { Component, signal } from '@angular/core';
import { NewAnswerComponent } from '../new-answer/new-answer.component';
import { AnswerTransfer } from '../shared/interfaces/answer-transfer';

@Component({
  selector: 'app-new-question',
  imports: [NewAnswerComponent],
  templateUrl: './new-question.component.html',
  styleUrl: './new-question.component.scss',
})
export class NewQuestionComponent {
  addedQuestions = signal<number[]>([]);
  addedAnswers = signal<AnswerTransfer[]>([]);
  multipleAnswers = signal<boolean>(false);

  addNextAnswer() {
    const numberAddedAnswers = this.addedAnswers().length;
    let nextIndex: number;
    if (numberAddedAnswers == 0) {
      nextIndex = 0;
      this.addedAnswers.update(() => [{ internalId: 0, inputValue: '' }]);
    } else {
      nextIndex = this.addedAnswers()[numberAddedAnswers - 1].internalId + 1;
      if (numberAddedAnswers >= 4) return;
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
