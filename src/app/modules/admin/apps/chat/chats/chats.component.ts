import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { Chat, Profile } from 'app/modules/admin/apps/chat/chat.types';
import { ChatService } from 'app/modules/admin/apps/chat/chat.service';
import { AuthService } from 'app/core/auth/auth.service';
import { Router } from '@angular/router';
import Pusher from 'pusher-js';
import { HttpClient } from '@angular/common/http';

@Component({
    selector       : 'chat-chats',
    templateUrl    : './chats.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatsComponent implements OnInit
{
  PhotoUrl = "http://localhost:61860/photo/";
  chats: Chat[];
  drawerComponent: 'profile' | 'new-chat';
  drawerOpened: boolean = false;
  filteredChats: Chat[];
  profile: Profile;
  selectedChat: Chat;
  users_list:any=[]
  name: string = '';
  userEmail: string = '';
  Teachers:any = [];
  channelName: any;
  senderID: number;
  channelN:any;
  recieverID: any;
  PhotoSrc:any;
  private _unsubscribeAll: Subscription[] = [];
  private pusher: any;
  private channel: any;
  searchTerm: string = '';

  message='';
  messages=[]


  /**
   * Constructor
   */
  constructor(
      private _chatService: ChatService,
      private _changeDetectorRef: ChangeDetectorRef,
      private _authservice:AuthService,
      private router: Router,
      private http:HttpClient
  )
  {
   
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
 

  currentChannelSubscription: any;
  ngOnInit(): void {
    this.ShowTeacherOfThisStudent();
    this.fetchUserEmail();
    this.showUserData();

    // Chats
    this._chatService.chats$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((chats: Chat[]) => {
            this.chats = this.filteredChats = chats;
            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
      

    this.getPhoto();
    this.getsenderId();
    this.subscribeToPusherChannel()
      
  }



  getsenderId() {
    this._authservice.getusers().subscribe(data => {
        const user = data.find(user => user.email === this.userEmail);
        this.senderID = user.id;
        console.log(this.senderID, "senderID");

        // Call getChannelName here since senderID is available now
        this.getChannelName();

        // Subscribe to Pusher channel
        this.subscribeToPusherChannel();
    });
  }

  storeTeacherId(teacherId: any) {
    this.recieverID = teacherId;
    console.log('Clicked on teacher with id:', this.recieverID);
    
    // Call getChannelName here since recieverID is available now
    this.getChannelName();

    // Subscribe to Pusher channel
    this.subscribeToPusherChannel();
  }

  previousChannelName: string = '';

  subscribeToPusherChannel() {
    // Unsubscribe from the previous Pusher channel if it exists
    if (this.channel) {
      this.channel.unbind();
    }
  
    // Initialize Pusher instance if not already initialized
    if (!this.pusher) {
      this.pusher = new Pusher('02f00b67a471e862d72e', {
        cluster: 'eu'
      });
  
      // Log Pusher connection events for debugging
      this.pusher.connection.bind('state_change', states => {
        console.log('Pusher connection state changed:', states.current);
      });
  
      this.pusher.connection.bind('error', err => {
        console.error('Pusher error:', err);
      });
    }
  
    // Subscribe to the new Pusher channel
    this.channel = this.pusher.subscribe(this.channelN);
    console.log('Subscribed to channel:', this.channelN);
  
    this.channel.bind('messages', data => {
      this.channelName = this.channel.name;
      console.log("name channel from back : ", this.channelName, data);
  
      
    if (this.channelName !== this.previousChannelName) {
        // Clear messages array if the channelName changes
        this.messages = [data];
        this.previousChannelName = this.channelName;
      } else {
        this.messages.push(data);
      }
  
      console.log('Received message:', data);
      this._changeDetectorRef.detectChanges();
    });
  }
  
 
  

  submit(): void {
    const currentTime = new Date(); // Get current time
    const hour = currentTime.getHours(); // Get current hour
    const minute = currentTime.getMinutes(); // Get current minute
    const time = `${hour}:${minute}`; // Format time
    // Prepare message data including the current time
    const messageData = {
      message: this.message,
      senderId: this.senderID,
      recipientId: this.recieverID,
      username: this.name,
      Image: this.PhotoSrc,
      channelName: this.channelN,
      time: time
       // Include the current time in the message data
    };

    console.log("from submit:", messageData);

    // Send the message data to the server
    this.http.post('http://localhost:61860/api/chats/message', messageData).subscribe(() => {
      this.message = ''; // Clear the message input after successful submission
    });
  }

  getChannelName() {
    // Generate the channel name based on the sender and recipient IDs
    this.channelN = `user_channel_${Math.min(this.senderID, this.recieverID)}_${Math.max(this.senderID, this.recieverID)}`;
    console.log("this is the channel name : ", this.channelN);
  }

  async fetchUserEmail(): Promise<void> {
      try {
        // Fetch the user email from your service
        const email = await this._authservice.getEmail();
        this.userEmail = email;
        console.log('Email fetched:', this.userEmail);
      } catch (error) {
        console.error('Error fetching email:', error);
      }
    }
    
    

    
    showUserData() {
      this._authservice.getusers().subscribe((data) => {
        // Log the fetched data for debugging purposes
        console.log('Fetched user data:', data);
    
        this.users_list = data.filter((us) => us.email === this.userEmail);
    
        if (this.users_list && this.users_list.length > 0) {
          const username = this.users_list[0].username;
          console.log('This is username: ', username);
          this.name = username;
          this._changeDetectorRef.detectChanges(); // is called to update the view, which will display the user's image and name without requiring a page refresh
        }
      });
    }

   
    getPhoto() {
      this._authservice.getusers().subscribe(data => {
        // Find the user by email
        const user = data.find(user => user.email === this.userEmail);
    
        if (user) {
          // If user is found, set the image source
          this.PhotoSrc = user.image;
          console.log(this.PhotoSrc, "photo src");
        } else {
          console.log("User not found");
        }
      });
    }

    

    search() {
      if (this.searchTerm.trim() === '') {
        // If the search term is empty, show all courses
        this.ShowTeacherOfThisStudent();
      } else {
        
    this.Teachers =  this.Teachers.filter(p => {
          const username = p.username.toLowerCase().includes(this.searchTerm);
      
          
          return username;
        });
      }
    }
   

    ShowTeacherOfThisStudent(){
      this.Teachers = [];
      this._authservice.getPayment().subscribe(data=>{
          const s = data.filter(c=>c.student_email===this.userEmail)
          const teacherEmails = [...new Set(s.map(item => item.teatcher_email))];
          console.log('Teacher Emails:', teacherEmails);
          
          teacherEmails.forEach(teacherEmails=>{   
      this._authservice.getusers().subscribe(d=>{


          const u = d.filter(us=>us.email===teacherEmails)
         this.Teachers.push(...u);
         
         this._changeDetectorRef.markForCheck();

      })})})

           console.log('Teacherssss:', this.Teachers);
 
            return this.Teachers;
    }
   


    isChatVisible = false;
    toggleChat() {
      this.isChatVisible = !this.isChatVisible;
    }



  
  

 
 
 


 

  /**
   * Track by function for ngFor loops
   *
   * @param index 
   * @param item
   */
  trackByFn(index: number, item: any): any
  {
      return item.id || index;
  }

  

 


}