import { Injectable, signal } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { Survey } from '../interfaces/survey';
import { SurveyModel } from '../models/survey.model';
import { createDBSubscriptionChannel, unsubscribeDBChannel } from '../utilities/utilities';

@Injectable({
  providedIn: 'root',
})
export class SurveyService {
  SUPABASE_KEY = 'sb_publishable_TW7-RS7aAVsNuGf8gF6-0Q_VV6S6-62';
  SUPABASE_URL = 'https://fkstlfwbnrkyxobmhzxe.supabase.co';
  supabase = createClient(this.SUPABASE_URL, this.SUPABASE_KEY);

  surveyAllEventsChannel;

  private surveyList = signal<Survey[]>([]);

  constructor() {
    // this.surveyAllEventsChannel = this.supabase
    //   .channel('custom-all-channel')
    //   .on('postgres_changes', { event: '*', schema: 'public', table: 'surveys' }, (payload) => {
    //     console.log('Change received!', payload);
    //   })
    //   .subscribe();

    this.surveyAllEventsChannel = createDBSubscriptionChannel(
      this.supabase,
      'custom-all-channel',
      '*',
      'surveys',
    );

    this.getAllSurveys();
  }

  ngOnDestroy() {
    unsubscribeDBChannel(this.surveyAllEventsChannel, this.supabase);
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

    if (error) {
      console.error({
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
    }
  }
}
