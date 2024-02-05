import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {
  constructor( private _authService: AuthService,private router:Router){}

about_list:any=[]
list:any=[]
a:string;
email_List
ngOnInit():void{

  this._authService.getemailfooter().subscribe(data => {
    this.email_List = data;
  })
    this.subject_show();
    this.getsocial();
  }
  subject_show(){
    this._authService.get_about().subscribe(data=>{
      this.about_list=data;
    })
  }
  get currentYear(): number
  {
      return new Date().getFullYear();
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
  cour(){
    this.router.navigate(['/apps/home'])
  }
  profil(){
    this.router.navigate(['/apps/profil'])
  }
}
