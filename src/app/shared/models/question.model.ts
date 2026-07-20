import { Question } from '../interfaces/question';

export class QuestionModel implements Question {
  id: string;
  text: string;
  multipleAnswers: boolean;

  constructor(data: Partial<Question> = {}) {
    this.id = data.id ?? '0';
    this.text = data.text ?? '';
    this.multipleAnswers = data.multipleAnswers ?? false;
  }

  getCleanAddJson() {
    return {
      text: this.text,
      multipleAnswers: this.multipleAnswers,
    };
  }
}
