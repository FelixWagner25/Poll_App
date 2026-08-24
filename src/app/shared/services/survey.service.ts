import { Injectable, signal, computed } from '@angular/core';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { Survey } from '../interfaces/survey';
import { SurveyModel } from '../models/survey.model';
import { printPostgrestErrorMsg, unsubscribeDBChannel } from '../utilities/utilities';
import { SUPABASE_URL, SUPABASE_KEY } from '../constants/constants';
import { QuestionModel } from '../models/question.model';
import { AnswerModel } from '../models/answer.model';
import { SurveyWithResults } from '../interfaces/suvery-with-results';
import { GET_SURVEY_RESULTS_QUERY } from '../queries/queries';

@Injectable({
  providedIn: 'root',
})
export class SurveyService {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  surveysAllEventsChannel;

  surveyList = signal<Survey[]>([]);
  survey = signal<SurveyWithResults | null>(null);
  submittedSurveyIds = signal<string[]>(this.loadSubmittedSurveyIds());

  surveyQuestions = computed(() => this.survey()?.questions ?? []);
  participantsCount = computed(() => this.survey()?.participantsCount ?? 0);

  /**
   * Creates supabase subscription chanel and initializes survey list.
   *
   */
  constructor() {
    this.surveysAllEventsChannel = this.createSurveysDBSubscriptionChannel();
    this.getAllSurveys();
  }

  ngOnDestroy() {
    unsubscribeDBChannel(this.surveysAllEventsChannel, this.supabase);
  }

  /**
   * Pull all surveys from backend and write it to survey list.
   *
   */
  async getAllSurveys(): Promise<void> {
    let response = await this.supabase.from('surveys').select('*');
    this.surveyList.set((response.data ?? []) as Survey[]);
  }

  /**
   * Load results of selected survey.
   *
   * @param surveyId - survey id
   */
  async loadSurveyWithResults(surveyId: string): Promise<void> {
    const survey = await this.getSurveyWithQuestionsAndAnswers(surveyId);
    this.survey.set(survey);
  }

  /**
   * Loads the surveyIds of already submitted surveys.
   *
   */
  loadSubmittedSurveyIds(): string[] {
    const ids = localStorage.getItem('submittedSurveyIds');
    if (!ids) return [];
    return JSON.parse(ids);
  }

  /**
   * Adds survey id of submitted survey to submittedSurveyIds array and pushes array to localstorage.
   *
   */
  addSubmittedSurveyId(surveyId: string) {
    this.submittedSurveyIds.update((ids) => [...ids, surveyId]);
    localStorage.setItem('submittedSurveyIds', JSON.stringify(this.submittedSurveyIds()));
  }

  /**
   * Inserts survey data to backend table.
   *
   * @param survey - survey id
   */
  async addSurvey(survey: SurveyModel): Promise<void> {
    const surveyData = survey;
    const { data, error } = await this.supabase.from('surveys').insert([surveyData]).select();
    if (error) printPostgrestErrorMsg(error);
  }

  /**
   * Creates supabase realtime channle on surveys table in backend.
   *
   * @returns supabase realtime channel
   */
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

  /**
   * Inserts question data to question table at supabase backend.
   *
   * @param question - question data model
   */
  async addQuestion(question: QuestionModel): Promise<void> {
    const questionData = question;
    const { data, error } = await this.supabase.from('questions').insert([questionData]).select();
    if (error) printPostgrestErrorMsg(error);
  }

  /**
   * Inserts answer data to answer table at supabase backend.
   *
   * @param answer - answer data model
   */
  async addAnswer(answer: AnswerModel): Promise<void> {
    const answerData = answer;
    const { data, error } = await this.supabase.from('answers').insert([answerData]).select();
    if (error) printPostgrestErrorMsg(error);
  }

  /**
   * Returns Answer selector depending on answer number in question.
   *
   * @param number - answer number in question
   * @returns answer selector
   */
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

  /**
   * Selects complete results of selected survey from backend.
   *
   * @param surveyId - survey id
   * @returns
   */
  async getSurveyWithQuestionsAndAnswers(surveyId: string): Promise<SurveyWithResults> {
    const { data, error } = await this.supabase
      .from('surveys')
      .select(GET_SURVEY_RESULTS_QUERY)
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
    if (error) throw error;
    return data as SurveyWithResults;
  }

  /**
   * Returns relative result of answer in percent.
   *
   * @param resultCount - answer result count
   * @returns relative result of answer in percent
   */
  getAnswerPercentage(resultCount: number, participantsCount: number): number {
    if (participantsCount == 0) return 0;
    return Math.round((resultCount / participantsCount) * 100);
  }

  /**
   * Pushes survey answer selections to supabase backend.
   *
   * @param surveyId - survey id
   * @param answerIds - answer ids
   */
  async submitSurveyResults(surveyId: string, answerIds: string[]): Promise<void> {
    const { error } = await this.supabase.rpc('submit_survey_vote', {
      p_survey_id: surveyId,
      p_answer_ids: answerIds,
    });

    if (error) throw error;

    await this.loadSurveyWithResults(surveyId);
  }
}
