import { ClassPropertyMapping } from '@angular/compiler';
import { Answer } from '../interfaces/answer';

export class AnswerModel implements Answer {
  id: string;
  selector: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | '';
  text: string;
  resultCount: number;

  constructor(data: Partial<Answer> = {}) {
    this.id = data.id ?? '0';
    this.selector = data.selector ?? '';
    this.text = data.text ?? '';
    this.resultCount = data.resultCount ?? 0;
  }
}
