import { Component, signal } from '@angular/core';
import { NewAnswerComponent } from '../new-answer/new-answer.component';

@Component({
  selector: 'app-new-question',
  imports: [NewAnswerComponent],
  templateUrl: './new-question.component.html',
  styleUrl: './new-question.component.scss',
})
export class NewQuestionComponent {
  addedQuestions = signal<number[]>([]);
  addedAnswers = signal<number[]>([]);
  multipleAnswers = signal<boolean>(false);

  addNextAnswer() {
    let nextIndex = this.addedAnswers().length;
    if (nextIndex >= 4) return;
    this.addedAnswers.update((array) => [...array, nextIndex]);
  }

  deleteAnswer(index: number) {
    this.addedAnswers().splice(index, 1);
  }

  toggleCheckbox() {
    this.multipleAnswers.update((value) => !value);
  }
}
