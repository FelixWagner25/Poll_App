import { Component, signal } from '@angular/core';
import { NewAnswerComponent } from '../new-answer/new-answer.component';

@Component({
  selector: 'app-new-question',
  imports: [NewAnswerComponent],
  templateUrl: './new-question.component.html',
  styleUrl: './new-question.component.scss',
})
export class NewQuestionComponent {
  additionalQuestionIndices = signal<number[]>([]);
  additionalAnswerIndices = signal<number[]>([]);
  multipleAnswers = signal<boolean>(false);

  addNextAnswer() {
    let nextIndex = this.additionalAnswerIndices().length;
    if (nextIndex >= 4) return;
    this.additionalAnswerIndices.update((array) => [...array, nextIndex]);
  }

  deleteAnswer(index: number) {
    this.additionalAnswerIndices().splice(index, 1);
  }

  toggleCheckbox() {
    this.multipleAnswers.update((value) => !value);
  }
}
