import { Question } from '../interfaces/question';

export class QuestionModel implements Question {
  id: string;
  text: string;
  answerIds: string[];

  constructor(data: Partial<Question> = {}) {
    this.id = data.id ?? '0';
    this.text = data.text ?? '';
    this.answerIds = data.answerIds ?? [];
  }
}
