import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MessageComponent } from './message/message.component';
import { ChatComponent } from './chat/chat.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [RouterOutlet, RouterLink, RouterLinkActive, MessageComponent, ChatComponent],
})
export class AppComponent {
  title = 'angular-p2p-chat';
}
