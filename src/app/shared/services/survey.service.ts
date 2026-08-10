import { Injectable, signal } from '@angular/core';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { Survey } from '../interfaces/survey';
import { SurveyModel } from '../models/survey.model';
import { printPostgrestErrorMsg, unsubscribeDBChannel } from '../utilities/utilities';
import { SUPABASE_URL, SUPABASE_KEY } from '../constants/constants';
import { QuestionModel } from '../models/question.model';
import { Question } from '../interfaces/question';
import { Answer } from '../interfaces/answer';
import { AnswerModel } from '../models/answer.model';

@Injectable({
  providedIn: 'root',
})
export class SurveyService {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  surveysAllEventsChannel;

  surveyList = signal<Survey[]>([]);

  constructor() {
    this.surveysAllEventsChannel = this.createSurveysDBSubscriptionChannel();
    this.getAllSurveys();
  }

  ngOnDestroy() {
    unsubscribeDBChannel(this.surveysAllEventsChannel, this.supabase);
  }

  async getAllSurveys(): Promise<void> {
    let response = await this.supabase.from('surveys').select('*');
    this.surveyList.set((response.data ?? []) as Survey[]);
  }

  async addSurvey(survey: SurveyModel): Promise<void> {
    const surveyData = survey;
    const { data, error } = await this.supabase.from('surveys').insert([surveyData]).select();
    if (error) printPostgrestErrorMsg(error);
  }

  createSurveysDBSubscriptionChannel(): RealtimeChannel {
    const channel = this.supabase
      .channel('custom-all-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'surveys' }, async () => {
        try {
          await this.getAllSurveys();
        } catch (error) {
          console.error(error);
        }
      })
      .subscribe();
    return channel;
  }

  async addQuestion(question: QuestionModel): Promise<void> {
    const questionData = question;
    const { data, error } = await this.supabase.from('questions').insert([questionData]).select();
    if (error) printPostgrestErrorMsg(error);
  }

  async getQuestionsBySurveyId(surveyId: string): Promise<Question[]> {
    let { data, error } = await this.supabase
      .from('questions')
      .select('*')
      .eq('surveyId', surveyId);
    if (error) throw error;
    return (data ?? []) as Question[];
  }

  async getAnswersByQuestionId(questionId: string): Promise<Answer[]> {
    let { data, error } = await this.supabase
      .from('answers')
      .select('*')
      .eq('questionId', questionId);
    if (error) throw error;
    return (data ?? []) as Answer[];
  }

  async addAnswer(answer: AnswerModel): Promise<void> {
    const answerData = answer;
    const { data, error } = await this.supabase.from('answers').insert([answerData]).select();
    if (error) printPostgrestErrorMsg(error);
  }

  getSelectorByNumber(number: number): string {
    switch (number) {
      case 0:
        return 'A';
      case 1:
        return 'B';
      case 2:
        return 'C';
      case 3:
        return 'D';
      case 4:
        return 'E';
      case 5:
        return 'F';
      default:
        return 'Error';
    }
  }

  async addParticipantToSurvey(surveyId: string): Promise<void> {
    const { data: survey, error } = await this.supabase
      .from('surveys')
      .select('participantsCount')
      .eq('id', surveyId)
      .single();
    if (error) throw error;
    const participantsCount = survey.participantsCount;
    const { data, error: updateError } = await this.supabase
      .from('surveys')
      .update({ participantsCount: participantsCount + 1 })
      .eq('id', surveyId)
      .select()
      .single();

    if (updateError) throw updateError;
  }

  async addResultCountToAnswer(answerId: string): Promise<void> {
    const { data: answer, error } = await this.supabase
      .from('answers')
      .select('resultCount')
      .eq('id', answerId)
      .single();
    if (error) throw error;

    const resultCount = answer.resultCount;

    const { data, error: updateError } = await this.supabase
      .from('answers')
      .update({ resultCount: resultCount + 1 })
      .eq('id', answerId)
      .select()
      .single();

    if (updateError) throw updateError;
  }
}
