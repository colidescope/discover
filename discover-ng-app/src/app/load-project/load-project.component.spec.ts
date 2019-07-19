import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {LoadProjectComponent} from './load-project.component';

describe('LoadProjectComponent', () => {
  let component: LoadProjectComponent;
  let fixture: ComponentFixture<LoadProjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoadProjectComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
