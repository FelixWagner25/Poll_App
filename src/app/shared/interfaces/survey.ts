import { Category } from '../types/category';

export interface Survey {
  id: string;
  name: string;
  description: string;
  endDate: string;
  category: Category;
}
