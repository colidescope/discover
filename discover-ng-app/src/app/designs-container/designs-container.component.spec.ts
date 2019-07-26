import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {DesignsContainerComponent} from './designs-container.component';

describe('DesignsContainerComponent', () => {
  let component: DesignsContainerComponent;
  let fixture: ComponentFixture<DesignsContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DesignsContainerComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DesignsContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
