import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { MessageComponent } from '../message/message.component';
import { TextInputComponent } from '../text-input/text-input.component';
import { NgClass } from '@angular/common';
import { PeerService } from '../peer.service';
import { Message } from '../peer.service';
import { Subscription } from 'rxjs';
import { ConnectionEventType } from '../peer.service';
import { Router } from '@angular/router';
import { BaseAlertComponent } from '../basealert/basealert.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [MessageComponent, TextInputComponent, NgClass, BaseAlertComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit, OnDestroy {
  messageSubscription!: Subscription;
  messages: Array<Message> = [];
  username: string = "";
  alertMessage: string = "";

  constructor(
    private peerService: PeerService,
    private router: Router,
    private ngZone: NgZone,
  ) {
    this.username = this.peerService.username;
  }

  ngOnInit(): void {
    this.messageSubscription = this.peerService.messageEvent$.subscribe((message: Message) => {
      this.receiveMessage(message);
    });

    this.peerService.peerEvent$.subscribe((event) => {
      switch (event.type) {
        case ConnectionEventType.CLOSE:
          this.alertMessage = "Peer was closed. Go back to lobby?"
          break;
        case ConnectionEventType.ERROR:
          this.alertMessage = "Peer error. Go back to lobby?"
          break;
      }
    });

    this.peerService.connectionEvent$.subscribe((event) => {
      switch (event.type) {
        case ConnectionEventType.OPEN:
          //console.log("Received connection from peer: ", event.peerId);
          //this.processConnectionRequest(
          //  event.peerConnection!,
          //  event.peerId!,
          //  event.peerUsername!,
          //  event.peerIsNew!)
          break;
        case ConnectionEventType.CLOSE:
          console.log("Connection was closed");
          if (this.peerService.sendConnections.length === 0) {
            this.alertMessage = "Everyone left the chat. Go back to lobby?"
          }
          break;
        case ConnectionEventType.ERROR:
          console.error("Connection error:", event.error);
          this.alertMessage = "Connection error. Go back to lobby?"
          break;
      }
    });
  }

  ngOnDestroy(): void {
      this.messageSubscription.unsubscribe();
  }

  addMessage(message: string) {
    let messageObj = {
      "username": this.peerService.username,
      "text": message
    };
    this.messages.push(messageObj);
    this.peerService.send(messageObj);
  }

  receiveMessage(message: Message) {
    this.messages.push(message);
  }

  onAlertOk() {
    this.alertMessage = "";
    this.ngZone.run(() => this.router.navigate(["lobby"]));
  }

  onAlertCancel() {
    this.alertMessage = "";
  }
}
