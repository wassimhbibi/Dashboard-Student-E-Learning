import { Component, Input, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NgForm, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import {  Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  @ViewChild('contactNgForm') contactNgForm: NgForm;
  

  constructor( private _authservice:AuthService,
   private _formBuilder: UntypedFormBuilder,private router:Router, private _authService: AuthService)
{
}
@Input() 
contactForm: UntypedFormGroup;
list:any=[]
Email
email_List
  ngOnInit():void{

    this._authService.getemailfooter().subscribe(data => {
      this.email_List = data;

    })
    this._authservice.getEmail().then(email => {
      this.Email = email;
  this.contactForm = this._formBuilder.group({
    full_name: ['', [Validators.required,Validators.pattern('[a-zA-Z" "]*')]],
    email: [this.Email],
    subjectt: ['',[Validators.required]],
    detail: ['', [Validators.required]],
    answer:[null]
  });
})
  this.getsocial();
}
getsocial(){
  this._authService.get_social().subscribe(data=>{
    this.list=data;})
}

about(){
  this.router.navigate(['/apps/about'])
}
partner(){
  this.router.navigate(['/apps/partners'])
}
meet(){
  this.router.navigate(['/apps/metting'])
}
cour(){
  this.router.navigate(['/apps/home'])
}
profil(){
  this.router.navigate(['/apps/profil'])
}

get currentYear(): number
{
    return new Date().getFullYear();
}

  add_contact(): void {
    
    const val = this.contactForm.value;

    this._authservice.addcontact(val).subscribe(response => {
      
    
       alert('Register Contact success ');
       this.contactNgForm.reset();

    });
  }

}
