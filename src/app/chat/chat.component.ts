import { Component } from '@angular/core';
import { MessageComponent } from '../message/message.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [MessageComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  messages = [
    { username: "simsax", text: "Hi everyone" },
    { username: "rupert", text: "Hi lkajsdddddddddddddddddddddddddddddd" },
    { username: "simsax", text: "lol" },
  ]
}
