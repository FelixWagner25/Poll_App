import { Survey } from '../interfaces/survey';
import { Category } from '../types/category';

export class SurveyModel implements Survey {
  id: string;
  name: string;
  description: string;
  endDate: string;
  category: Category;

  constructor(data: Partial<Survey> = {}) {
    let randomId = crypto.randomUUID();
    console.log(randomId);

    this.id = data.id ?? randomId;
    this.name = data.name ?? 'n/a';
    this.description = data.description ?? '';
    this.endDate = data.endDate ?? '';
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
