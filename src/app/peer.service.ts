import { EventEmitter, Injectable } from '@angular/core';
import { DataConnection, Peer } from 'peerjs';
import { ChatComponent } from './chat/chat.component';

export interface Message {
  username: string,
  text: string
};

@Injectable({
  providedIn: 'root'
})
export class PeerService {
  peer: Peer;
  username: string = "";
  connected = false;
  sendConnections: Array<DataConnection> = [];
  receiveConnections: Array<DataConnection> = [];
  listener: (data: any) => void = () => null;

  constructor() {
    // TODO: handle refreshes, should save some state to local storage probably
    this.peer = new Peer();
  }

  subscribe(listener: (data: any) => void) {
    this.listener = listener;
  }

  async onPeerOpen(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.peer.on("open", (id) => resolve(id));
      this.peer.on("error", (error) => {
        console.log("Peer error");
        reject(error);
      });
    });
  }

  // with this implementation it only works for 2 peers but I want to extend to multiple peers
  // this promise is going to change
  // first get it working in the simple 2 peers case
  async onPeerConnection(): Promise<DataConnection> {
    return new Promise((resolve, reject) => {
      this.peer.on("connection", (connection: DataConnection) => {
        const peerId = connection.peer;
        connection.on("open", () => {
          console.log("Received connection from peer: ", peerId);
          if (!this.connected) {
            this.connected = true;
          }
          if (this.peerIsNew(peerId)) {
            this.connect(peerId, this.username);
          }
          this.receiveConnections.push(connection);
          resolve(connection);
        });

        connection.on("error", (error) => {
          reject(error);
        });
      });

      this.peer.on("error", (error) => {
          reject(error);
      });
    })
  }

  listenForData() {
    for (const connection of this.receiveConnections) {
      const peerId = connection.peer;
      connection.on("data", (data) => {
        console.log("Received from peer: ", peerId);
        console.log(data);
        this.listener(data);
      });
    }
  }

  connect(destPeerId: string, username: string) {
    this.username = username;
    const connection = this.peer.connect(destPeerId);
    this.sendConnections.push(connection);
  }

  send(message: Message) {
    // broadcast the message
    // could also implement private messages with a sendToPeer method
    for (const connection of this.sendConnections) {
      connection.send(message);
    }
  }

  peerIsNew(peerId: string): boolean {
    // TODO: we could use a set
    if (peerId == this.peer.id)
        return false;
    for (const connection of this.sendConnections) {
      if (connection.peer === peerId)
        return false;
    }
    return true;
  }
}

// TODO: handle peer disconnection (when other peers disconnect, this peer should now somehow)

