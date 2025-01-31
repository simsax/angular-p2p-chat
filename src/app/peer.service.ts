import { EventEmitter, Injectable } from '@angular/core';
import { DataConnection, Peer } from 'peerjs';
import { ChatComponent } from './chat/chat.component';
import { Subject } from 'rxjs';
import { Data } from '@angular/router';

export interface Message {
  username: string,
  text: string,
  mine?: boolean
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
  peers?: Array<string>,
  error?: any,
};

export interface ConnectionMetadata {
  username: string,
  peers?: Array<string>
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
      const metadata: ConnectionMetadata = connection.metadata;
      connection.on("open", () => {
        this.connectionEvent$.next({
          type: ConnectionEventType.OPEN,
          peerId: peerId,
          peerUsername: metadata.username,
          peerConnection: connection,
          peerIsNew: this.peerIsNew(peerId),
          peers: metadata.peers
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
        if (validateMessage(data)) {
          this.messageEvent$.next(data);
        } else {
          console.error(`Received invalid data: ${data}`);
        }
      });
    });
  }

  acceptConnection(peerId: string, peerIsNew: boolean, peers?: Array<string> | undefined) {
    if (!this.connected) {
      this.connected = true;

      if (peers) {
        // in this case we got accepted in a chat room, so send connection to all other peers
        for (const peer of peers) {
          this.connect(peer);
        }
      }
    }
    if (peerIsNew) {
      const myPeers = this.sendConnections.map(connection => connection.peer);
      this.connect(peerId, myPeers);
    }
  }

  connect(destPeerId: string, peersToSend?: Array<string>) {
    const metadata: ConnectionMetadata = {
      username: this.username,
    };
    if (peersToSend) {
      metadata.peers = peersToSend;
    }
    const connection = this.peer.connect(destPeerId, { metadata: metadata });
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

