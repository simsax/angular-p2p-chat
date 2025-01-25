import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PeerService } from '../peer.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './lobby.component.html',
  styleUrl: './lobby.component.scss'
})
export class LobbyComponent implements OnInit {
  username = "";
  myPeerId = "";
  destPeerId = "";

  constructor(
    private peerService: PeerService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // TODO: on error show something to the user I guess
    this.initializePeerConnection()
      .then(() => console.log("Initialization completed"))
      .catch(error => console.log("Initialization failed"));
  }

  async initializePeerConnection(): Promise<void> {
    try {
      this.myPeerId = await this.peerService.onPeerOpen();
      console.log("My Peer id is", this.myPeerId);

      const connection = await this.peerService.onPeerConnection();

      this.peerService.listenForData(connection);
      const navigateResult = await this.router.navigate(["chat"]);
      console.log("Navigated to chat:", navigateResult);
    } catch (error) {
      console.error("[initializePeerConnection] Error:", error);
      throw error;
    }
  }

  login() {
    this.connectToPeer(this.destPeerId);
    // TODO: we need a way to detect for invalid peer and non connections...
  }

  connectToPeer(peerId: string) {
    this.peerService.connect(peerId);
  }
}

