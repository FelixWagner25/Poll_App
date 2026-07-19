import { Injectable, signal } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_KEY, SUPABASE_URL } from '../constants/constants';
import {
  createDBSubscriptionChannel,
  unsubscribeDBChannel,
  printPostgrestErrorMsg,
} from '../utilities/utilities';
import { Question } from '../interfaces/question';
import { QuestionModel } from '../models/question.model';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  questionsAllEventsChannel;

  private questionList = signal<Question[]>([]);

  constructor() {
    this.questionsAllEventsChannel = createDBSubscriptionChannel(
      this.supabase,
      'custom-all-channel',
      '*',
      'questions',
    );
  }

  ngOnDestroy() {
    unsubscribeDBChannel(this.questionsAllEventsChannel, this.supabase);
  }

  async getAllQuestions() {
    let response = await this.supabase.from('questions').select('*');
    //console.log(response.data);
    this.questionList.set((response.data ?? []) as Question[]);
    //console.log(this.questionList());
  }

  async addQuestion(question: QuestionModel) {
    const questionData = question.getCleanAddJson();
    const { data, error } = await this.supabase.from('questions').insert([questionData]).select();
    if (error) printPostgrestErrorMsg(error);
  }
}
