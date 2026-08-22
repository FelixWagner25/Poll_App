import { SurveyWithResults } from './suvery-with-results';
import { SurveyQuestionWithAnswers } from './survey-question-with-answers';

export interface SurveyQuestionResultsPreview extends SurveyQuestionWithAnswers {
  previewParticipantsCount: number;
}

export interface SurveyResultsPreview extends Omit<SurveyWithResults, 'questions'> {
  questions: SurveyQuestionResultsPreview[];
}
