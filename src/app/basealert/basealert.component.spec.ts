import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseAlertComponent } from './basealert.component';

describe('BasealertComponent', () => {
  let component: BaseAlertComponent;
  let fixture: ComponentFixture<BaseAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseAlertComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaseAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
