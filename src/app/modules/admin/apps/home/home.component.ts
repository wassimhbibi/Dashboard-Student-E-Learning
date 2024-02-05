import { Component, Directive } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseAlertService } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  styles         : [
    `
        cards fuse-card {
            margin: 16px;
        }
    `
],

})

export class HomeComponent {
  
  filters: {
    categorySlug$: BehaviorSubject<string>;
    query$: BehaviorSubject<string>;
    hideCompleted$: BehaviorSubject<boolean>;
} = {
    categorySlug$ : new BehaviorSubject('all'),
    query$        : new BehaviorSubject(''),
    hideCompleted$: new BehaviorSubject(false)
};
  constructor( private _fuseAlertService: FuseAlertService,private _authService: AuthService , private router:Router,  private route: ActivatedRoute){}
  list:any=[]
  searchTerm: string = ''; 
  cours_list:any=[]
  PhotoUrl = "http://localhost:61860/photo";
  Email:any
  courname:any
  selectedCourseType:string="all";
  uniqueCourseTypes:any[]
  listapp:any=[]
  email_List
ngOnInit():void{
  this.route.queryParams.subscribe(params => {
    if (params.email) {
      const email = params.email;
      this._authService.setEmail(email);

    }
  });
  this._authService.getemailfooter().subscribe(data => {
    this.email_List = data;

  })
 
        this._authService.getappname().subscribe(res=>{
            this.listapp=res})
    this._authService.getEmail().then(email => {
      this.Email = email; // Assign the email value to the Email variable
    });

  this.subject_show();
  this.showCoursTypes();
  this.getsocial();
   // Filter the courses

  }
  get currentYear(): number
    {
        return new Date().getFullYear();
    }

 
 filterByQuery(query: string): void
 {
     this.filters.query$.next(query);
 }
 /**
 * Show the alert via the service
 *
 * @param name
 */
show(name: string): void
{
    this._fuseAlertService.show(name);
}

 searchCours() {
  if (this.searchTerm.trim() === '') {
    // If the search term is empty, show all courses
    this.subject_show();
  } else {
    // Filter courses based on the search term
    this.cours_list = this.cours_list.filter(cour => {
      const cournameMatch = cour.courname.toLowerCase().includes(this.searchTerm);
      const sub_titleMatch = cour.sub_title.toLowerCase().includes(this.searchTerm);
      
      return cournameMatch || sub_titleMatch;
    });
  }
}
shouldHideElement(cour: any): boolean {
  return this.selectedCourseType !== 'all' && cour.type_cour !== this.selectedCourseType;
}
showCoursTypes() {
  this._authService.get_cours().subscribe(data => {
    const uniqueCourseTypesSet = new Set(data.map(ct => ct.type_cour));
    this.uniqueCourseTypes = Array.from(uniqueCourseTypesSet);


   
  });
}

filterByCategory(event: MatSelectChange): void {
  this.selectedCourseType = event.value;
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
 

 

  subject_show(){
    this._authService.get_cours().subscribe(data=>{
      this.cours_list=data;

    })
  }

  SendCourNameToAboutCourPage(courname: string, user: string) {
   
    this._authService.getcourname().subscribe(data => {
 
      const chapiterr = data.find(chapitre => chapitre.courname === courname && chapitre.user === user);
      
      // check if the student has made a payment for the course
      this._authService.getPayment().subscribe(paymentData => {

  
        const isPayment = paymentData.some(pay => pay.couname === courname && pay.student_email===this.Email);

  
        if (isPayment===true) {
         
          alert('You are already Buy this course.');
          this.router.navigate(['/apps/show_all_chapter'], { queryParams: { courname: courname, user: user, chapitre: JSON.stringify(chapiterr) } });
        } else {
         
          this.router.navigate(['/apps/about_cours'], { queryParams: { courname: courname, user: user, chapitre: JSON.stringify(chapiterr) } });
        }
      });
    });
  }
  getsocial(){
    this._authService.get_social().subscribe(data=>{
      this.list=data;
})
  }
  contact(){
    this.router.navigate(['/apps/contact'])
  }
  partner(){
    this.router.navigate(['/apps/partners'])
  }
  meet(){
    this.router.navigate(['/apps/metting'])
  }
  about(){
    this.router.navigate(['/apps/about'])
  }
  profil(){
    this.router.navigate(['/apps/profil'])
  }
  SendCourNameToTestPage(courname: string) {
    this._authService.getcertif().subscribe(data => {
      const a = data.some(certif => certif.email_student === this.Email && certif.cour_name === courname);

  
      if (a === true) {
        alert('You Already Passed this Test Successfully');
      
      } else {
    
        this._authService.getPayment().subscribe(paymentData => {
          const c = paymentData.filter(p => p.student_email === this.Email);
      
  
          const paymentInfo = c.find(w => w.couname === courname);
   
  
          if (paymentInfo) {
            alert("Welcome to the Test! When you click 'OK', the Timer will begin! Good Luck");
            this._authService.getcourname().subscribe(courseData => {
              const cour_name = courseData.find(c => c.courname === courname);
              if (cour_name) {
                this.router.navigate(['/apps/show_test'], {
                  queryParams: { courname: courname, c: JSON.stringify(cour_name) }
                });
              } else {
  
              }
            });
          } else {
            alert('You must buy this course first!');
            this.router.navigate(['/apps/home']);
          }
        });
      }
    });
  }
  
}
