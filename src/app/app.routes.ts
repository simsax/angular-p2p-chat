import { Routes } from '@angular/router';
import { LobbyComponent } from './lobby/lobby.component';
import { ChatComponent } from './chat/chat.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { chatGuard } from './chat.guard';

export const routes: Routes = [
  {
    path: "chat",
    title: "P2P chat",
    component: ChatComponent,
    canActivate: [chatGuard]
  },
  {
    path: "lobby",
    title: "Lobby",
    component: LobbyComponent
  },
  {
    path: "",
    redirectTo: "lobby",
    pathMatch: "full"
  },
  {
    path: "**",
    title: "Not Found",
    component: PagenotfoundComponent
  },
];
