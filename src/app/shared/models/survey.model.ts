import { Survey } from '../interfaces/survey';
import { Category } from '../types/category';

export class SurveyModel implements Survey {
  id: string;
  name: string;
  description: string;
  endDate: string;
  category: Category;
  participantsCount: number;

  /**
   * Initializes the survey model with the provided data.
   *
   * @param data - input data to initialize the survey model.
   */
  constructor(data: Partial<Survey> = {}) {
    let randomId = crypto.randomUUID();

    this.id = data.id ?? randomId;
    this.name = data.name ?? 'n/a';
    this.description = data.description ?? '';
    this.endDate = data.endDate ?? '';
    this.category = data.category ?? null;
    this.participantsCount = data.participantsCount ?? 0;
  }
}
