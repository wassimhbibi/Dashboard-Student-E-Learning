import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostBinding, HostListener, Inject, NgZone, OnDestroy, OnInit, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ScrollStrategy, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { QuickChatService } from 'app/layout/common/quick-chat/quick-chat.service';
import { Chat } from 'app/layout/common/quick-chat/quick-chat.types';
import { Profile } from 'app/modules/admin/apps/chat/chat.types';
import { AuthService } from 'app/core/auth/auth.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Pusher from 'pusher-js';

@Component({
    selector     : 'quick-chat',
    templateUrl  : './quick-chat.component.html',
    styleUrls    : ['./quick-chat.component.scss'],
    encapsulation: ViewEncapsulation.None,
    exportAs     : 'quickChat'
})
export class QuickChatComponent implements OnInit, AfterViewInit
{
    @ViewChild('messageInput') messageInput: ElementRef;
    chat: Chat;
    chats: Chat[];
    opened: boolean = false;
    selectedChat: Chat;
    private _mutationObserver: MutationObserver;
    private _scrollStrategy: ScrollStrategy = this._scrollStrategyOptions.block();
    private _overlay: HTMLElement;
    //private _unsubscribeAll: Subject<any> = new Subject<any>();
    PhotoUrl = "http://localhost:61860/photo/";

    drawerComponent: 'profile' | 'new-chat';
    drawerOpened: boolean = false;
    filteredChats: Chat[];
    profile: Profile;

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
    Reciverdata:any[];
    /**
     * Constructor
     */
    constructor(
        @Inject(DOCUMENT) private _document: Document,
        private _elementRef: ElementRef,
        private _renderer2: Renderer2,
        private _ngZone: NgZone,
        private _quickChatService: QuickChatService,
        private _scrollStrategyOptions: ScrollStrategyOptions,
     
        private _changeDetectorRef: ChangeDetectorRef,
        private _authservice:AuthService,
        private router: Router,
        private http:HttpClient
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Decorated methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Host binding for component classes
     */
    @HostBinding('class') get classList(): any
    {
        return {
            'quick-chat-opened': this.opened
        };
    }

    /**
     * Resize on 'input' and 'ngModelChange' events
     *
     * @private
     */
    @HostListener('input')
    @HostListener('ngModelChange')
    private _resizeMessageInput(): void
    {
        // This doesn't need to trigger Angular's change detection by itself
        this._ngZone.runOutsideAngular(() => {

            setTimeout(() => {

                // Set the height to 'auto' so we can correctly read the scrollHeight
                this.messageInput.nativeElement.style.height = 'auto';

                // Get the scrollHeight and subtract the vertical padding
                this.messageInput.nativeElement.style.height = `${this.messageInput.nativeElement.scrollHeight}px`;
            });
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Chat
        this._quickChatService.chat$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((chat: Chat) => {
                this.chat = chat;
            });

        // Chats
        this._quickChatService.chats$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((chats: Chat[]) => {
                this.chats = chats;
            });

        // Selected chat
        this._quickChatService.chat$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((chat: Chat) => {
                this.selectedChat = chat;
            });

    }

    /**
     * After view init
     */
    ngAfterViewInit(): void
    {

      this.ShowTeacherOfThisStudent();
      this.fetchUserEmail();
      this.showUserData();
  
        
  
      this.getPhoto();
      this.getsenderId();
      this.subscribeToPusherChannel()
        // Fix for Firefox.
        //
        // Because 'position: sticky' doesn't work correctly inside a 'position: fixed' parent,
        // adding the '.cdk-global-scrollblock' to the html element breaks the navigation's position.
        // This fixes the problem by reading the 'top' value from the html element and adding it as a
        // 'marginTop' to the navigation itself.
        this._mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                const mutationTarget = mutation.target as HTMLElement;
                if ( mutation.attributeName === 'class' )
                {
                    if ( mutationTarget.classList.contains('cdk-global-scrollblock') )
                    {
                        const top = parseInt(mutationTarget.style.top, 10);
                        this._renderer2.setStyle(this._elementRef.nativeElement, 'margin-top', `${Math.abs(top)}px`);
                    }
                    else
                    {
                        this._renderer2.setStyle(this._elementRef.nativeElement, 'margin-top', null);
                    }
                }
            });
        });
        this._mutationObserver.observe(this._document.documentElement, {
            attributes     : true,
            attributeFilter: ['class']
        });
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
    
      openn:boolean=false;
      storeTeacherId(teacherId: any) {
        this._toggleOpened(true);
        this.openn=true;
        this.recieverID = teacherId;
        console.log('Clicked on teacher with id:', this.recieverID);
        
        // Call getChannelName here since recieverID is available now
        this.showReciverData(this.recieverID)
      
        this.getChannelName();
    
        // Subscribe to Pusher channel
        this.subscribeToPusherChannel();
      }
      showReciverData(ID:any){
     
        this._authservice.getusers().subscribe(data=>{

          this.Reciverdata = data.find(r=> r.id ===ID )
          console.log("...........",this.Reciverdata)

        })
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
       
   
  





    /**
     * Open the panel
     */
    open(): void
    {
        // Return if the panel has already opened
        if ( this.opened )
        {
            return;
        }

        // Open the panel
        this._toggleOpened(true);
    }

    /**
     * Close the panel
     */
    close(): void
    {
        // Return if the panel has already closed
        if ( !this.opened )
        {
            return;
        }

        // Close the panel
        this._toggleOpened(false);
    }

    /**
     * Toggle the panel
     */
    toggle(): void
    {
        if ( this.opened )
        {
            this.close();
        }
        else
        {
            this.open();
        }
    }

    /**
     * Select the chat
     *
     * @param id
     */
    selectChat(id: string): void
    {
        // Open the panel
        this._toggleOpened(true);

        // Get the chat data
        this._quickChatService.getChatById(id).subscribe();
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

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Show the backdrop
     *
     * @private
     */
    private _showOverlay(): void
    {
        // Try hiding the overlay in case there is one already opened
        this._hideOverlay();

        // Create the backdrop element
        this._overlay = this._renderer2.createElement('div');

        // Return if overlay couldn't be create for some reason
        if ( !this._overlay )
        {
            return;
        }

        // Add a class to the backdrop element
        this._overlay.classList.add('quick-chat-overlay');

        // Append the backdrop to the parent of the panel
        this._renderer2.appendChild(this._elementRef.nativeElement.parentElement, this._overlay);

        // Enable block scroll strategy
        this._scrollStrategy.enable();

        // Add an event listener to the overlay
        this._overlay.addEventListener('click', () => {
            this.close();
        });
    }

    /**
     * Hide the backdrop
     *
     * @private
     */
    private _hideOverlay(): void
    {
        if ( !this._overlay )
        {
            return;
        }

        // If the backdrop still exists...
        if ( this._overlay )
        {
            // Remove the backdrop
            this._overlay.parentNode.removeChild(this._overlay);
            this._overlay = null;
        }

        // Disable block scroll strategy
        this._scrollStrategy.disable();
    }

    /**
     * Open/close the panel
     *
     * @param open
     * @private
     */
    private _toggleOpened(open: boolean): void
    {
        // Set the opened
        this.opened = open;

        // If the panel opens, show the overlay
        if ( open )
        {
            this._showOverlay();
        }
        // Otherwise, hide the overlay
        else
        {
            this._hideOverlay();
        }
    }
}