import { Survey } from '../interfaces/survey';
import { Category } from '../types/category';

export class SurveyModel implements Survey {
  id: string;
  name: string;
  description: string;
  category: Category;
  questionIds: string[];

  constructor(data: Partial<Survey> = {}) {
    this.id = data.id ?? '0';
    this.name = data.name ?? '';
    this.description = data.description ?? '';
    this.category = data.category ?? 'not assigned';
    this.questionIds = data.questionIds ?? [];
  }
}
