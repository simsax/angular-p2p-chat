import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConnectionEventType, PeerService } from '../peer.service';
import { Router } from '@angular/router';
import { AlertComponent } from '../alert/alert.component';
import { DataConnection } from 'peerjs';
import { LoaderComponent } from '../loader/loader.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [FormsModule, AlertComponent, LoaderComponent],
  templateUrl: './lobby.component.html',
  styleUrl: './lobby.component.scss'
})
export class LobbyComponent implements OnInit, OnDestroy {
  username = "";
  myPeerId = "";
  destPeerId = "";
  alertMessage = "";
  errorMessage = "";
  usernameState = true;
  peerIsNew = false;
  loading = false;
  connection!: DataConnection;
  peerSubscription!: Subscription;
  connectionSubscription!: Subscription;

  constructor(
    private peerService: PeerService,
    private router: Router,
    private ngZone: NgZone,
  ) {
  }

  ngOnInit(): void {
    this.username = this.peerService.username;
    if (this.username)
      this.usernameState = false;
    this.myPeerId = this.peerService.myPeerId;

    this.peerSubscription = this.peerService.peerEvent$.subscribe((event) => {
      switch (event.type) {
        case ConnectionEventType.OPEN:
          this.myPeerId = event.peerId!;
          break;
        case ConnectionEventType.CLOSE:
          console.log("Peer was closed");
          break;
        case ConnectionEventType.ERROR:
          console.error("Peer error:", event.error);
          this.loading = false;
          this.errorMessage = "Peer error.";
          break;
      }
    });

    this.connectionSubscription = this.peerService.connectionEvent$.subscribe((event) => {
      switch (event.type) {
        case ConnectionEventType.OPEN:
          console.log("Received connection from peer: ", event.peerId);
          this.processConnectionRequest(
            event.peerConnection!,
            event.peerId!,
            event.peerUsername!,
            event.peerIsNew!,
            event.peers!
          )
          break;
        case ConnectionEventType.CLOSE:
          console.log("Connection was closed");
          this.loading = false;
          this.errorMessage = "Connection was closed.";
          break;
        case ConnectionEventType.ERROR:
          console.error("Connection error:", event.error);
          this.loading = false;
          this.errorMessage = "Connection error.";
          break;
      }
    });
  }

  ngOnDestroy(): void {
    this.peerSubscription.unsubscribe();
    this.connectionSubscription.unsubscribe();
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
    this.errorMessage = "";
  }

  processConnectionRequest(
    connection: DataConnection, peerId: string, peerUsername: string, peerIsNew: boolean, peers: Array<string> | undefined) {
    this.peerIsNew = peerIsNew;
    this.connection = connection;
    this.destPeerId = peerId;
    if (peerIsNew) {
      this.alertMessage = peerUsername;
    } else {
      this.onConnectionAccept(peers);
    }
  }

  onConnectionAccept(peers?: Array<string>) {
    this.peerService.acceptConnection(this.destPeerId, this.peerIsNew, peers);
    this.ngZone.run(() => {
      this.router.navigate(["chat"]);
    });
    this.alertMessage = "";
    this.loading = false;
  }

  onConnectionDecline() {
    this.alertMessage = "";
    this.peerService.closeConnection(this.connection);
  }
}

// TODO: error handling; check data before accepting message...
