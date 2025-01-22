import { Component } from '@angular/core';
import { MessageComponent } from '../message/message.component';
import { TextInputComponent } from '../text-input/text-input.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [MessageComponent, TextInputComponent, NgClass],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  messages = [
    { username: "simsax", text: "Hi everyone" },
    { username: "rupert", text: "Hi how are you feeling today my guy EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE" },
    { username: "jon", text: "lol" },
    { username: "penis", text: "yogurt?" },
  ]

  // TODO: global property set on access
  username = "simsax"

  addMessage(message: string) {
    this.messages.push({
      "username": this.username,
      "text": message
    })
  }
}
