import { Survey } from './survey';
import { SurveyQuestionWithAnswers } from './survey-question-with-answers';
export interface SurveyWithResults extends Survey {
  questions: SurveyQuestionWithAnswers[];
}
