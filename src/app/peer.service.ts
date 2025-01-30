import { EventEmitter, Injectable } from '@angular/core';
import { DataConnection, Peer } from 'peerjs';
import { ChatComponent } from './chat/chat.component';
import { Subject } from 'rxjs';
import { Data } from '@angular/router';

export interface Message {
  username: string,
  text: string
};

export enum ConnectionEventType {
  OPEN,
  CLOSE,
  ERROR
};

export interface PeerEvent {
  type: ConnectionEventType,
  peerId?: string,
  error?: any
};

export interface ConnectionEvent {
  type: ConnectionEventType,
  peerId?: string,
  peerUsername?: string,
  peerConnection?: DataConnection,
  peerIsNew?: boolean,
  error?: any,
};

function validateMessage(data: any): boolean {
  return data !== null &&
      typeof data === "object" &&
      typeof data.username === "string" &&
      typeof data.text === "string";
}

@Injectable({
  providedIn: 'root'
})
export class PeerService {
  peer: Peer;
  username: string = "";
  myPeerId: string = "";
  connected = false;
  sendConnections: Array<DataConnection> = [];
  receiveConnections: Array<DataConnection> = [];
  connectionEvent$ = new Subject<ConnectionEvent>();
  peerEvent$ = new Subject<PeerEvent>();
  messageEvent$ = new Subject<Message>();

  constructor() {
    // TODO: handle refreshes, should save some state to local storage probably
    this.peer = new Peer();

    this.peer.on("open", (id) => {
      this.myPeerId = id;
      this.peerEvent$.next({
        type: ConnectionEventType.OPEN,
        peerId: id
      });
    });

    this.peer.on("close", () => {
      this.peerEvent$.next({
        type: ConnectionEventType.CLOSE,
      });
    });

    this.peer.on("error", (error) => {
      this.peerEvent$.next({
        type: ConnectionEventType.ERROR,
        error: error
      });
    });

    this.peer.on("connection", (connection: DataConnection) => {
      const peerId = connection.peer;
      const peerUsername = connection.metadata;
      connection.on("open", () => {
        this.connectionEvent$.next({
          type: ConnectionEventType.OPEN,
          peerId: peerId,
          peerUsername: peerUsername,
          peerConnection: connection,
          peerIsNew: this.peerIsNew(peerId)
        })
      });

      connection.on("close", () => {
        this.connectionEvent$.next({
          type: ConnectionEventType.CLOSE,
        });
      });

      connection.on("error", (error) => {
        this.connectionEvent$.next({
          type: ConnectionEventType.ERROR,
          error: error
        });
      });

      connection.on("data", (data: any) => {
        console.log("Received from peer: ", peerId);
        console.log(data);
        if (validateMessage(data)) {
          console.log("Validated");
          this.messageEvent$.next(data);
        } else {
          console.error(`Received invalid data: ${data}`);
        }
      });
    });
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

  connect(destPeerId: string) {
    const connection = this.peer.connect(destPeerId, { metadata: this.username });
    connection.on("close", () => {
      console.log(`${destPeerId} has closed the connection (send).`);
      var index = this.sendConnections.indexOf(connection);
      if (index !== -1) {
        this.sendConnections.splice(index, 1);
      }
      this.connectionEvent$.next({ type: ConnectionEventType.CLOSE });
    });

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

  closeConnection(connection: DataConnection) {
    connection.close();
  }

}

// TODO: handle peer disconnection (when other peers disconnect, this peer should now somehow)

