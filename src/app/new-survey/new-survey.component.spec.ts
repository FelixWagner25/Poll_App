import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewSurveyComponent } from './new-survey.component';

describe('NewSurveyComponent', () => {
  let component: NewSurveyComponent;
  let fixture: ComponentFixture<NewSurveyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewSurveyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewSurveyComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
