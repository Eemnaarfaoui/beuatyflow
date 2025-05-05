import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatbootComponent } from './chatboot.component';

describe('ChatbootComponent', () => {
  let component: ChatbootComponent;
  let fixture: ComponentFixture<ChatbootComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatbootComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatbootComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
