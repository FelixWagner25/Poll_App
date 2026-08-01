import { Question } from '../interfaces/question';

export class QuestionModel implements Question {
  id: string;
  text: string;
  multipleAnswers: boolean;
  surveyId: string;

  constructor(data: Partial<Question> = {}) {
    let randomId = crypto.randomUUID();

    this.id = data.id ?? randomId;
    this.text = data.text ?? '';
    this.multipleAnswers = data.multipleAnswers ?? false;
    this.surveyId = data.surveyId ?? 'error';
  }

  getCleanAddJson() {
    return {
      text: this.text,
      multipleAnswers: this.multipleAnswers,
    };
  }
}
