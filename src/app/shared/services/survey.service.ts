import { Injectable, signal } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { Survey } from '../interfaces/survey';
import { SurveyModel } from '../models/survey.model';
import {
  createDBSubscriptionChannel,
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

  private surveyList = signal<Survey[]>([]);

  constructor() {
    this.surveysAllEventsChannel = createDBSubscriptionChannel(
      this.supabase,
      'custom-all-channel',
      '*',
      'surveys',
    );
    this.getAllSurveys();
  }

  ngOnDestroy() {
    unsubscribeDBChannel(this.surveysAllEventsChannel, this.supabase);
  }

  async getAllSurveys() {
    let response = await this.supabase.from('surveys').select('*');
    console.log(response.data);
    this.surveyList.set((response.data ?? []) as Survey[]);
    console.log(this.surveyList());
  }

  async addSurvey(survey: SurveyModel) {
    const surveyData = survey.getCleanAddJson();
    const { data, error } = await this.supabase.from('surveys').insert([surveyData]).select();
    if (error) printPostgrestErrorMsg(error);
  }
}
