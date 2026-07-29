import { Question } from '../interfaces/question';

export class QuestionModel implements Question {
  id: string;
  text: string;
  multipleAnswers: boolean;

  constructor(data: Partial<Question> = {}) {
    let randomId = crypto.randomUUID();
    console.log(randomId);

    this.id = data.id ?? randomId;
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
