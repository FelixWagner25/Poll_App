import { FormControl, FormArray } from '@angular/forms';

export interface QuestionForm {
  text: FormControl<string>;
  multipleAnswers: FormControl<boolean>;
  answers: FormArray<FormControl<string>>;
}
