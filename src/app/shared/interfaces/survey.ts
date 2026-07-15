import { Category } from '../types/category';
import { Question } from './question';

export interface Survey {
  id: string;
  name: string;
  description: string;
  category: Category;
  questions: Question[];
}
