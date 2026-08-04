import { Injectable, signal, WritableSignal } from '@angular/core';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { Survey } from '../interfaces/survey';
import { SurveyModel } from '../models/survey.model';
import { printPostgrestErrorMsg, unsubscribeDBChannel } from '../utilities/utilities';
import { SUPABASE_URL, SUPABASE_KEY } from '../constants/constants';
import { QuestionModel } from '../models/question.model';
import { Question } from '../interfaces/question';

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
}
