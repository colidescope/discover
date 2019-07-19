import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {StepperInputComponent} from './stepper-input.component';

describe('StepperInputComponent', () => {
  let component: StepperInputComponent;
  let fixture: ComponentFixture<StepperInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StepperInputComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepperInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
