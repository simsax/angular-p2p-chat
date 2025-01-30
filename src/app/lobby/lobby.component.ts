import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PeerService } from '../peer.service';
import { Router } from '@angular/router';
import { AlertComponent } from '../alert/alert.component';
import { DataConnection } from 'peerjs';
import { LoaderComponent } from '../loader/loader.component';
import { NgZone } from '@angular/core';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [FormsModule, AlertComponent, LoaderComponent],
  templateUrl: './lobby.component.html',
  styleUrl: './lobby.component.scss'
})
export class LobbyComponent implements OnInit {
  username = "";
  myPeerId = "";
  destPeerId = "";
  alertMessage = "";
  showAlert = false;
  usernameState = true;
  peerIsNew = false;
  loading = false;
  connectionError = false;
  connection!: DataConnection;

  constructor(
    private peerService: PeerService,
    private router: Router,
    private zone: NgZone,
  ) {
  }

  ngOnInit(): void {
    // TODO: on error show something to the user I guess
    this.initializePeerConnection()
      .then(() => console.log("Initialization completed"))
      .catch(error => {
        console.log("Connection failed");
        this.loading = false;
        this.connectionError = true;
      });

    this.peerService.connectionListener = (connection, peerId, peerUsername, peerIsNew) =>
      this.zone.run(() => this.processConnectionRequest(connection, peerId, peerUsername, peerIsNew));
  }

  async initializePeerConnection(): Promise<void> {
    try {
      this.myPeerId = await this.peerService.onPeerOpen();
      console.log("My Peer id is", this.myPeerId);

      await this.peerService.onPeerConnection();
      // are promises useless in this case??
      // I do nthing with the connection apparently
      // But I await it

    } catch (error) {
      console.error("[initializePeerConnection] Error:", error);
      throw error;
    }
  }

  addUsername() {
    let cleanUsername = this.username.trim();
    if (cleanUsername) {
      this.usernameState = false;
      this.peerService.username = cleanUsername;
    }
  }

  connectToPeer() {
    this.peerService.connect(this.destPeerId);
    this.loading = true;
    this.connectionError = false;
  }

  processConnectionRequest(connection: DataConnection, peerId: string, peerUsername: string, peerIsNew: boolean) {
    this.peerIsNew = peerIsNew;
    this.connection = connection;
    this.destPeerId = peerId;
    if (peerIsNew) {
      this.alertMessage = peerUsername;
      this.showAlert = true;
    } else {
      this.onConnectionAccept();
    }
  }

  onConnectionAccept() {
    this.peerService.acceptConnection(this.connection, this.destPeerId, this.peerIsNew);
    this.router.navigate(["chat"]);
    this.showAlert = false;
    this.loading = false;
  }

  onConnectionDecline() {
    this.showAlert = false;
    this.peerService.closeConnection(this.connection);
  }
}

// TODO: error handling; check data before accepting message...
