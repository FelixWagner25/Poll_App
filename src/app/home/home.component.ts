import { Component, inject, signal, computed, Renderer2, WritableSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SurveyService } from '../shared/services/survey.service';
import { Category } from '../shared/types/category';
import { calcDateDiffDays, getTodaysShortISOString } from '../shared/utilities/utilities';
import { NewSurveyComponent } from '../new-survey/new-survey.component';

type SurveyStatusFilter = 'active' | 'past';

@Component({
  selector: 'app-home',
  imports: [RouterLink, NewSurveyComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  readonly surveyService = inject(SurveyService);

  dropdownOpened = signal<boolean>(false);
  selectedCategory = signal<Category>(null);

  selectedSurveyStatus = signal<SurveyStatusFilter>('active');
  overlayOpen = signal(false);

  constructor(private renderer: Renderer2) {}

  yourSurveys = computed(() => {
    let surveys = this.surveyService.surveyList();
    let category = this.selectedCategory();
    let status = this.selectedSurveyStatus();
    const today = getTodaysShortISOString();
    return surveys.filter((survey) => {
      const matchedCategory = category === null || survey.category === category;
      if (!survey.endDate) return matchedCategory && status === 'active';
      const remainingDays = calcDateDiffDays(today, survey.endDate);
      const matchedStatus =
        (status === 'active' && remainingDays >= 0) || (status === 'past' && remainingDays < 0);
      return matchedCategory && matchedStatus;
    });
  });

  endingSoonSurveys = computed(() => {
    return this.surveyService
      .surveyList()
      .filter((survey) => {
        if (!survey.endDate) return false;
        const remainingDays = calcDateDiffDays(getTodaysShortISOString(), survey.endDate);
        return remainingDays >= 0;
      })
      .sort((a, b) => a.endDate.localeCompare(b.endDate))
      .slice(0, 3);
  });

  /**
   * Toggles category dropdown.
   *
   */
  toggleDropdown(): void {
    this.dropdownOpened.update((value) => !value);
  }

  /**
   * Sets selected category.
   *
   * @param value - selectable category
   */
  setSelectedCategory(value: Category): void {
    this.selectedCategory.set(value);
    this.toggleDropdown();
  }

  /**
   * Returns remaining days of a survey untill end date is reached.
   *
   * @param endDate - survey end date
   * @returns remaining days untill survey end date
   */
  getRemainingDaysString(endDate: string): string {
    if (endDate == '') return 'Active';
    const todayStr = getTodaysShortISOString();
    const diffDays = calcDateDiffDays(todayStr, endDate);

    if (diffDays < 0) {
      return 'Ended';
    } else if (diffDays == 0) {
      return 'Ends today';
    } else if (diffDays == 1) {
      return 'Ends in 1 day';
    } else {
      return 'Ends in ' + diffDays.toString() + ' days';
    }
  }

  /**
   * Checks whether user is filtering on acitve surveys.
   *
   * @returns true, if survey filter is acitive, otherwise false
   */
  activeSurveyFilter(): boolean {
    return this.selectedSurveyStatus() === 'active';
  }

  /**
   * Checks whether user is filtering on past surveys.
   *
   * @returns true, if survey filter is past, otherwise false
   */
  pastSurveyFilter(): boolean {
    return this.selectedSurveyStatus() === 'past';
  }

  /**
   * Opens add new survey overlay.
   *
   */
  openOverlay(): void {
    this.overlayOpen.set(true);
    this.renderer.addClass(document.body, 'overflow-hidden');
  }

  /**
   * Closes add new survey overlay.
   *
   */
  closeOverlay(): void {
    this.overlayOpen.set(false);
    this.renderer.removeClass(document.body, 'overflow-hidden');
  }
}
