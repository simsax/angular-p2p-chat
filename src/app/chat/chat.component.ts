import { Component } from '@angular/core';
import { MessageComponent } from '../message/message.component';
import { TextInputComponent } from '../text-input/text-input.component';
import { NgClass } from '@angular/common';
import { PeerService } from '../peer.service';
import { Message } from '../peer.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [MessageComponent, TextInputComponent, NgClass],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  messages: Array<Message> = []

  // TODO: global property set on access
  username = "simsax"

  constructor(private peerService: PeerService) {
    this.peerService.onMessageReceived.subscribe((data) => {
      this.messages.push(data);
    });
  }

  addMessage(message: string) {
    let messageObj = {
      "username": this.username,
      "text": message
    };
    this.messages.push(messageObj);
    this.peerService.send(messageObj);
  }

  addPeer(peerId: string) {
    this.peerService.connect(peerId);
  }
}
