import { FormControl, FormArray } from '@angular/forms';

export interface QuestionSelectionForm {
  selectedAnswers: FormArray<FormControl<boolean>>;
}
