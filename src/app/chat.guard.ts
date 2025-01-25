import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';

export const chatGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  return router.parseUrl("/lobby");
};
