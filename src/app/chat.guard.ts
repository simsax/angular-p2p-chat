import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { PeerService } from './peer.service';

export const chatGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const peerService = inject(PeerService);

  if (peerService.connected) {
    return true;
  } else {
    return router.parseUrl("/lobby");
  }
};

