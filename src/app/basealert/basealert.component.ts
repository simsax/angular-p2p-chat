import { Component, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-basealert',
  standalone: true,
  imports: [],
  templateUrl: './basealert.component.html',
  styleUrl: './basealert.component.scss'
})
export class BaseAlertComponent {
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
