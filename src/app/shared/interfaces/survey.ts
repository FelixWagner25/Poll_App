import { Category } from '../types/category';

export interface Survey {
  id: string;
  name: string;
  description: string;
  category: Category;
  questionIds: string[];
}
