export interface Question {
  id: string;
  text: string;
  multipleAnswers: boolean;
  positionIndex: number;
  surveyId: string;
}
