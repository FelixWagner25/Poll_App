import { Injectable, signal } from '@angular/core';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { Survey } from '../interfaces/survey';
import { SurveyModel } from '../models/survey.model';
import {
  //createDBSubscriptionChannel,
  printPostgrestErrorMsg,
  unsubscribeDBChannel,
} from '../utilities/utilities';
import { SUPABASE_URL, SUPABASE_KEY } from '../constants/constants';

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
    console.log(response.data);
    this.surveyList.set((response.data ?? []) as Survey[]);
    console.log('getAllSurveys');
    console.log(this.surveyList());
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
}
