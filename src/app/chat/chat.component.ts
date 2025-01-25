import { Component, OnInit } from '@angular/core';
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
export class ChatComponent implements OnInit {
  messages: Array<Message> = [];

  constructor(private peerService: PeerService) {
    this.peerService.subscribe((data) => this.receiveMessage(data));
  }

  ngOnInit(): void {
    this.peerService.listenForData();
  }

  addMessage(message: string) {
    let messageObj = {
      "username": this.peerService.username,
      "text": message
    };
    this.messages.push(messageObj);
    this.peerService.send(messageObj);
  }

  receiveMessage(data: any) {
    this.messages.push(data);
  }
}
