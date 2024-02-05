import { Component, Input, ViewChild } from '@angular/core';
import { FormControl, FormGroup, NgForm, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';



@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent {
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

email_List
  ngOnInit():void{
  
    this._authService.getemailfooter().subscribe(data => {
      this.email_List = data;

      
    })
  this._authservice.getEmail().then(email => {
    this.Email = email;
    // Assign the email value to the Email variable
    this.getsocial();

  this.route.queryParams.subscribe(params => {
    this.cour = params.courname;
    this.user = params.user;

    // Ensure that the form is initialized only after cour and user are set
    this.initializePaymentForm();
    
  });
});
this.subject_show(this.cour)
}
subject_show(cour_name: string){
  this._authService.get_cours().subscribe(data=>{
    
    const filteredData = data.filter(Data => Data.courname === this.cour);
    this.cours_list=filteredData;
  
    
  })
}
initializePaymentForm() {
  if (this.cour !== null && this.user !== null) {
    this.paymentForm = this._formBuilder.group({
      method_of_payment: new FormControl('', [Validators.required]),
      student_name: ['', [Validators.required ,Validators.pattern('[a-zA-Z" "]*')]],
      student_email: [this.Email],
      rib: new FormControl('',[Validators.required, Validators.pattern(/^[0-9]+$/), Validators.maxLength(16), Validators.minLength(16)]),
      cart_code: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]+$/), Validators.maxLength(4), Validators.minLength(4)]),
      teatcher_email: [this.user], // Set teatcher_email here
      courname: [this.cour], // Set courname here
      expiration_year: ['', [Validators.required]],
      expiration_month: ['', [Validators.required]],
    });

  
  }
}




 

  submit(form: FormGroup) {
    if (form.valid) {
    } else form.markAllAsTouched();
  }

  add_payment(): void {
    
    const val = this.paymentForm.value;

    this._authservice.addpayment(val).subscribe(response => {
      
    
       alert('Register Payment success ');
       const courname = val.courname; 
    this.SendCourNameToChapterPage(courname);
    });
  }
  get currentYear(): number
  {
      return new Date().getFullYear();
  }

  SendCourNameToChapterPage(courname?: string) {
      this.router.navigate(['/apps/show_all_chapter'], { queryParams: { courname: courname } });
  }
  getsocial(){
    this._authService.get_social().subscribe(data=>{
      this.list=data;})
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
