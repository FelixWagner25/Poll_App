import { Survey } from '../interfaces/survey';
import { Category } from '../types/category';

export class SurveyModel implements Survey {
  id: string;
  name: string;
  description: string;
  endDate: string;
  category: Category;

  constructor(data: Partial<Survey> = {}) {
    this.id = data.id ?? '0';
    this.name = data.name ?? 'n/a';
    this.description = data.description ?? '';
    this.endDate = data.endDate ?? '9999-12-31';
    this.category = data.category ?? null;
  }

  getCleanAddJson() {
    return {
      name: this.name,
      description: this.description,
      endDate: this.endDate,
      category: this.category,
    };
  }
}
