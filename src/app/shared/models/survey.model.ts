import { Survey } from '../interfaces/survey';
import { Category } from '../types/category';
import { Question } from '../interfaces/question';

export class SurveyModel implements Survey {
  id: string;
  name: string;
  description: string;
  category: Category;
  questions: Question[];

  constructor(data: Partial<Survey> = {}) {
    this.id = data.id ?? '0';
    this.name = data.name ?? '';
    this.description = data.description ?? '';
    this.category = data.category ?? 'not assigned';
    this.questions = data.questions ?? [];
  }
}
