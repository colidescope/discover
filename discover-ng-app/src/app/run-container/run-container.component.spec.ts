import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {RunContainerComponent} from './run-container.component';

describe('RunContainerComponent', () => {
  let component: RunContainerComponent;
  let fixture: ComponentFixture<RunContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RunContainerComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RunContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
