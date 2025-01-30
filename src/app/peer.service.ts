import { EventEmitter, Injectable } from '@angular/core';
import { DataConnection, Peer } from 'peerjs';
import { ChatComponent } from './chat/chat.component';
import { Subject } from 'rxjs';

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
  dataListener: (data: any) => void = () => null;
  connectionListener: (connection: DataConnection, peerId: string, peerUsername: string, peerIsNew: boolean) => void = () => null;
  //peerOpen$ = new Subject<any>();
  //PeerError$ = new Subject<any>();

  constructor() {
    // TODO: handle refreshes, should save some state to local storage probably
    this.peer = new Peer();
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
  // TODO: are these void promises weird?
  async onPeerConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.peer.on("connection", (connection: DataConnection) => {
        const peerId = connection.peer;
        console.log(connection.metadata);
        const peerUsername = connection.metadata;
        connection.on("open", () => {
          console.log("Received connection from peer: ", peerId);
          this.connectionListener(connection, peerId, peerUsername, this.peerIsNew(peerId));
          resolve();
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

  acceptConnection(connection: DataConnection, peerId: string, peerIsNew: boolean) {
      if (!this.connected) {
        this.connected = true;
      }
      if (peerIsNew) {
        this.connect(peerId);
      }
      this.receiveConnections.push(connection);
  }

  listenForData() {
    for (const connection of this.receiveConnections) {
      const peerId = connection.peer;
      connection.on("data", (data) => {
        console.log("Received from peer: ", peerId);
        console.log(data);
        this.dataListener(data);
      });
    }
  }

  checkSendConnection() {
    for (const connection of this.sendConnections) {
      const peerId = connection.peer;
      connection.on("close", () => {
        console.log(`${peerId} has closed the connection.`);
        // remove from connection list
        // also, this should run constantly i think
      });
    }
  }

  connect(destPeerId: string) {
    const connection = this.peer.connect(destPeerId, { metadata: this.username });
    this.sendConnections.push(connection);
    this.checkSendConnection();
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

  closeConnection(connection: DataConnection) {
    connection.close();
  }

}

// TODO: handle peer disconnection (when other peers disconnect, this peer should now somehow)

