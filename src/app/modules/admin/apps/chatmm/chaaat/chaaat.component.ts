import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth/auth.service';
import Pusher from 'pusher-js';

@Component({
  selector: 'app-chaaat',
  templateUrl: './chaaat.component.html',
  styleUrls: ['./chaaat.component.scss']
})
export class ChaaatComponent implements OnInit {
  message = '';
  messages = [];
  users_list = [];
  name: any;
  Email: any;

  constructor(
    private http: HttpClient,
    private _authService: AuthService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this._authService.getEmail().then((email) => {
      this.Email = email;
    });
    this.showUserData();

    Pusher.logToConsole = true;

    const pusher = new Pusher('0c393b681dfba8a636d6', {
      cluster: 'eu'
    });

    const channel = pusher.subscribe('chat');
    channel.bind('messages', (data) => {
      this.messages.push(data);
    });
  }

  showUserData() {
    this._authService.getusers().subscribe((data) => {
      console.log('Fetched user data:', data);

      this.users_list = data.filter((us) => us.email === this.Email);

      if (this.users_list && this.users_list.length > 0) {
        const username = this.users_list[0].username;
        this.name = username;
        console.log('This is username: ', this.name);
        this._changeDetectorRef.detectChanges();
      }
    });
  }

  submit(): void {
    const role = "student";
    const recipientEmail ="ramzirihane0@gmail.com"; // replace with the actual student's email
    this.http.post('http://localhost:61860/api/chat', {
      username: this.name,
      message: this.message,
      role,
      recipientEmail
    }).subscribe(() => (this.message = ''));
  }
}