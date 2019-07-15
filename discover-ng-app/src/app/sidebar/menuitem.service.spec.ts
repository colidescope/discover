import {TestBed} from '@angular/core/testing';

import {MenuitemService} from './menuitem.service';

describe('MenuitemService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MenuitemService = TestBed.get(MenuitemService);
    expect(service).toBeTruthy();
  });
});
