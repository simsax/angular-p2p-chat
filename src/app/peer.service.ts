import { EventEmitter, Injectable } from '@angular/core';
import { DataConnection, Peer } from 'peerjs';

export interface Message {
  username: string,
  text: string
};

@Injectable({
  providedIn: 'root'
})
export class PeerService {
  peer: Peer;
  connections: Array<DataConnection> = [];
  onMessageReceived = new EventEmitter<any>();

  constructor() {
    this.peer = new Peer();
    this.peer.on('open', (id) => {
      console.log('My peer ID is: ' + id);
    });

    // receive data
    this.peer.on('connection', (connection: DataConnection) => {
      const peerId = connection.peer;
      connection.on("data", (data) => {
        console.log("Received from peer ", peerId);
        this.onMessageReceived.emit(data);
      });
      connection.on("open", () => {
        console.log("Received connection from peer: ", peerId);
        // when peerId connects to use, we connect to him automatically if we don't have it
        if (this.peerIsNew(peerId)) {
          this.connect(peerId);
        }
      });
    });
  }

  connect(destPeerId: string) {
    this.connections.push(this.peer.connect(destPeerId));
  }

  send(message: Message) {
    // broadcast the message
    // could also implement private messages with a sendToPeer method
    for (const connection of this.connections) {
      connection.send(message);
    }
  }

  peerIsNew(peerId: string): boolean {
    // TODO: we could use a set
    if (peerId == this.peer.id)
        return false;
    for (const connection of this.connections) {
      if (connection.peer === peerId)
        return false;
    }
    return true;
  }
}

