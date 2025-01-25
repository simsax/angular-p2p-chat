import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { chatGuardGuard } from './chat-guard.guard';

describe('chatGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => chatGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
