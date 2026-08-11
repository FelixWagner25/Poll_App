import { Injectable, signal, computed } from '@angular/core';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { Survey } from '../interfaces/survey';
import { SurveyModel } from '../models/survey.model';
import { printPostgrestErrorMsg, unsubscribeDBChannel } from '../utilities/utilities';
import { SUPABASE_URL, SUPABASE_KEY } from '../constants/constants';
import { QuestionModel } from '../models/question.model';
import { Question } from '../interfaces/question';
import { Answer } from '../interfaces/answer';
import { AnswerModel } from '../models/answer.model';
import { SurveyWithResults } from '../interfaces/suvery-with-results';

@Injectable({
  providedIn: 'root',
})
export class SurveyService {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  surveysAllEventsChannel;

  surveyList = signal<Survey[]>([]);
  survey = signal<SurveyWithResults | null>(null);

  surveyQuestions = computed(() => this.survey()?.questions ?? []);
  participantsCount = computed(() => this.survey()?.participantsCount ?? 0);

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

  async loadSurveyWithResults(surveyId: string): Promise<void> {
    const survey = await this.getSurveyWithQuestionsAndAnswers(surveyId);
    this.survey.set(survey);
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

  async getSurveyWithQuestionsAndAnswers(surveyId: string): Promise<SurveyWithResults> {
    const { data, error } = await this.supabase
      .from('surveys')
      .select(
        `
      id,
      name,
      description,
      category,
      endDate,
      participantsCount,
      questions (
        id,
        text,
        multipleAnswers,
        positionIndex,
        surveyId,
        answers (
          id,
          text,
          resultCount,
          positionIndex,
          questionId
        )
      )
    `,
      )
      .eq('id', surveyId)
      .order('positionIndex', {
        referencedTable: 'questions',
        ascending: true,
      })
      .order('positionIndex', {
        referencedTable: 'questions.answers',
        ascending: true,
      })
      .single();

    if (error) {
      throw error;
    }

    return data as SurveyWithResults;
  }

  getAnswerPercentage(resultCount: number): number {
    const participants = this.participantsCount();
    if (participants == 0) return 0;
    return Math.round((resultCount / participants) * 100);
  }

  async submitSurveyResults(surveyId: string, answerIds: string[]): Promise<void> {
    const { error } = await this.supabase.rpc('submit_survey_vote', {
      p_survey_id: surveyId,
      p_answer_ids: answerIds,
    });

    if (error) throw error;

    await this.loadSurveyWithResults(surveyId);
  }
}
