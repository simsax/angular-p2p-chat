import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './text-input.component.html',
  styleUrl: './text-input.component.scss'
})
export class TextInputComponent {
  message = "";
  maxLength = 5000;
  @Output() addMessageEvent = new EventEmitter<string>();

  sendMessage() {
    const message = this.message.trim();
    if (message) {
      this.addMessageEvent.emit(message);
      this.message = "";
    }
  }
}
