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
  text = "";
  maxLength = 5000;
  @Output() addInputEvent = new EventEmitter<string>();

  emitText() {
    const text = this.text.trim();
    if (text) {
      this.addInputEvent.emit(text);
      this.text = "";
    }
  }
}
