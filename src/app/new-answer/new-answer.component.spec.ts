import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewAnswerComponent } from './new-answer.component';

describe('NewAnswerComponent', () => {
  let component: NewAnswerComponent;
  let fixture: ComponentFixture<NewAnswerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewAnswerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewAnswerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
