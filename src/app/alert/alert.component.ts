import { Component, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss'
})
export class AlertComponent {
  @Input() message = "";
  @Output() acceptEvent = new EventEmitter<void>();
  @Output() declineEvent = new EventEmitter<void>();

  accept() {
    this.acceptEvent.emit();
  }

  decline() {
    this.declineEvent.emit();
  }
}
