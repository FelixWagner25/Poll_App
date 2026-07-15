import { Question } from '../interfaces/question';
import { Answer } from '../interfaces/answer';

export class QuestionModel implements Question {
  id: string;
  text: string;
  answers: Answer[];

  constructor(data: Partial<Question> = {}) {
    this.id = data.id ?? '0';
    this.text = data.text ?? '';
    this.answers = data.answers ?? [];
  }
}
