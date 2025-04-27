import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, NotificationState } from '../../services/notification.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-connection-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="(connectionState$ | async)?.offline" class="connection-status offline">
      <i class="bi bi-wifi-off"></i> {{ (connectionState$ | async)?.message }}
    </div>
  `,
  styles: [`
    .connection-status {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 10px 15px;
      border-radius: 4px;
      font-size: 14px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s ease;
      max-width: 300px;
    }
    
    .offline {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
    
    .connection-status i {
      font-size: 18px;
    }
  `]
})
export class ConnectionStatusComponent implements OnInit {
  connectionState$: Observable<NotificationState>;

  constructor(private notificationService: NotificationService) { 
    this.connectionState$ = this.notificationService.getConnectionState();
  }

  ngOnInit(): void {
  }
}
