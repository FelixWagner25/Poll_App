import { Answer } from '../interfaces/answer';

export class AnswerModel implements Answer {
  id: string;
  text: string;
  resultCount: number;
  positionIndex: number;
  questionId: string;

  /**
   * Initializes the answer model with provided data.
   *
   * @param data - input data used to initialize the model.
   */
  constructor(data: Partial<Answer> = {}) {
    let randomId = crypto.randomUUID();

    this.id = data.id ?? randomId;
    this.text = data.text ?? '';
    this.resultCount = data.resultCount ?? 0;
    this.positionIndex = data.positionIndex ?? 0;
    this.questionId = data.questionId ?? 'error';
  }
}
