import { Answer } from '../interfaces/answer';

export class AnswerModel implements Answer {
  id: string;
  text: string;
  resultCount: number;
  positionIndex: number;
  questionId: string;

  constructor(data: Partial<Answer> = {}) {
    let randomId = crypto.randomUUID();

    this.id = data.id ?? randomId;
    this.text = data.text ?? '';
    this.resultCount = data.resultCount ?? 0;
    this.positionIndex = data.positionIndex ?? 0;
    this.questionId = data.questionId ?? 'error';
  }

  getCleanAddJson() {
    return {
      text: this.text,
      resultCount: this.resultCount,
    };
  }
}
