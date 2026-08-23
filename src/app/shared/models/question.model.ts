import { Question } from '../interfaces/question';

export class QuestionModel implements Question {
  id: string;
  text: string;
  multipleAnswers: boolean;
  positionIndex: number;
  surveyId: string;

  /**
   * Initializes question data model with provided data.
   *
   * @param data - input data to initialize the question model.
   */
  constructor(data: Partial<Question> = {}) {
    let randomId = crypto.randomUUID();

    this.id = data.id ?? randomId;
    this.text = data.text ?? '';
    this.multipleAnswers = data.multipleAnswers ?? false;
    this.positionIndex = data.positionIndex ?? 0;
    this.surveyId = data.surveyId ?? 'error';
  }
}
