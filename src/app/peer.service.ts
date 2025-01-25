import { EventEmitter, Injectable } from '@angular/core';
import { Data } from '@angular/router';
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
  connected = false;
  connections: Array<DataConnection> = [];

  constructor() {
    this.peer = new Peer();
    //this.peer.on('open', (id) => {
    //  this.onPeerInit.emit(id);
    //});

    // receive data
    //this.peer.on('connection', (connection: DataConnection) => {
    //  const peerId = connection.peer;
    //  connection.on("data", (data) => {
    //    console.log("Received from peer ", peerId);
    //  });
    //  connection.on("open", () => {
    //    console.log("Received connection from peer: ", peerId);
    //    if (!this.connected) {
    //      this.connected = true;
    //      this.onConnectionReceived.emit(true);
    //    }
    //    // when peerId connects to use, we connect to him automatically if we don't have it
    //    if (this.peerIsNew(peerId)) {
    //      this.connect(peerId);
    //    }
    //  });
    //});
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

  async onPeerConnection(): Promise<DataConnection> {
    return new Promise((resolve, reject) => {
      this.peer.on("connection", (connection: DataConnection) => {
        const peerId = connection.peer;
        connection.on("open", () => {
          console.log("Received connection from peer: ", peerId);
          if (this.peerIsNew(peerId)) {
            this.connect(peerId);
          }
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

  listenForData(connection: DataConnection) {
    // TODO: receive some parameter to trigger an action when data is received
    const peerId = connection.peer;
    connection.on("data", (data) => {
      console.log("Received from peer: ", peerId);
      console.log(data);
    });
  }

  connect(destPeerId: string) {
    const connection = this.peer.connect(destPeerId);
    this.connections.push(connection);
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

