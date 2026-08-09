import { Answer } from '../interfaces/answer';

export class AnswerModel implements Answer {
  id: string;
  text: string;
  resultCount: number;
  positionIndex: number;
  questionId: string;
  userSelected: boolean;

  constructor(data: Partial<Answer> = {}) {
    let randomId = crypto.randomUUID();

    this.id = data.id ?? randomId;
    this.text = data.text ?? '';
    this.resultCount = data.resultCount ?? 0;
    this.positionIndex = data.positionIndex ?? 0;
    this.questionId = data.questionId ?? 'error';
    this.userSelected = false; // Always false. There is no user managment but this attribute is needed for selection steering.
  }

  getCleanAddJson() {
    return {
      text: this.text,
      resultCount: this.resultCount,
    };
  }
}
