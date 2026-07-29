import { Answer } from '../interfaces/answer';

export class AnswerModel implements Answer {
  id: string;
  selector: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | '';
  text: string;
  resultCount: number;

  constructor(data: Partial<Answer> = {}) {
    let randomId = crypto.randomUUID();
    console.log(randomId);

    this.id = data.id ?? randomId;
    this.selector = data.selector ?? '';
    this.text = data.text ?? '';
    this.resultCount = data.resultCount ?? 0;
  }

  getCleanAddJson() {
    return {
      selector: this.selector,
      text: this.text,
      resultCount: this.resultCount,
    };
  }
}
