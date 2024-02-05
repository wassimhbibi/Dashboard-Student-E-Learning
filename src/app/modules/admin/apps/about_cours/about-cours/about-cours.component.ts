import { Component, Input, ViewChild } from '@angular/core';
import { FormGroup, NgForm, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
  selector: 'app-about-cours',
  templateUrl: './about-cours.component.html',
  styleUrls: ['./about-cours.component.scss']
})
export class AboutCoursComponent {
  @ViewChild('paymentNgForm') paymentNgForm: NgForm;
  

  constructor( private _authservice:AuthService,
    private route: ActivatedRoute , private _authService: AuthService, private router:Router,private _formBuilder: UntypedFormBuilder,)
{
}
@Input() 
list:any=[]
isSubmitted: boolean = false;
paymentForm: UntypedFormGroup;
Email: any = '';
cour:any
user:any
cours_list=[]
about_List=[]
email_List
listapp:any=[]
  ngOnInit():void{
     // Filter the courses
  
    this._authService.getemailfooter().subscribe(data => {
      this.email_List = data;
    })
    this.getsocial()

  this.route.queryParams.subscribe(params => {
    this.cour = params.courname;
    this.user = params.user;

    // Ensure that the form is initialized only after cour and user are set
    this.initializePaymentForm();
    
  });
  this.showabout(this.cour);
}
get currentYear(): number
    {
        return new Date().getFullYear();
    }

submit(form: FormGroup) {
  if (form.valid) {
  } else form.markAllAsTouched();
}

initializePaymentForm() {
  if (this.cour !== null && this.user !== null) {
    this.paymentForm = this._formBuilder.group({

   

      courname: [this.cour], // Set courname here

    });
  }
}
showabout(course: string) {
  this._authService.getabout().subscribe(data => {
    this.about_List = data.filter(c => c.courname === course);
 

  })}
SendCourNameToPaymentPage(courname: string,user: string) {
  this.router.navigate(['/apps/payment'], { queryParams: { courname: this.cour ,user: this.user} });
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

}
