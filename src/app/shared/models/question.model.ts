import { Question } from '../interfaces/question';

export class QuestionModel implements Question {
  id: string;
  text: string;

  constructor(data: Partial<Question> = {}) {
    this.id = data.id ?? '0';
    this.text = data.text ?? '';
  }

  getCleanAddJson() {
    return {
      text: this.text,
    };
  }
}
