import { Injectable, signal } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from '../constants/constants';
import { Answer } from '../interfaces/answer';
import {
  createDBSubscriptionChannel,
  unsubscribeDBChannel,
  printPostgrestErrorMsg,
} from '../utilities/utilities';
import { AnswerModel } from '../models/answer.model';

@Injectable({
  providedIn: 'root',
})
export class AnswerService {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  answersAllEventsChannel;

  private answersList = signal<Answer[]>([]);

  constructor() {
    this.answersAllEventsChannel = createDBSubscriptionChannel(
      this.supabase,
      'custom-all-channel',
      '*',
      'answers',
    );
  }

  ngOnDestroy() {
    unsubscribeDBChannel(this.answersAllEventsChannel, this.supabase);
  }

  async getAllAnswers() {
    let response = await this.supabase.from('answers').select('*');
    //console.log(response.data);
    this.answersList.set((response.data ?? []) as Answer[]);
    //console.log(this.answersList());
  }

  async addAnswer(answer: AnswerModel) {
    const answerData = answer.getCleanAddJson();
    const { data, error } = await this.supabase.from('questions').insert([answerData]).select();
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
}
