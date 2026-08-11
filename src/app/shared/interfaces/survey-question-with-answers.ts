import { Answer } from './answer';
import { Question } from './question';
export interface SurveyQuestionWithAnswers extends Question {
  answers: Answer[];
}
