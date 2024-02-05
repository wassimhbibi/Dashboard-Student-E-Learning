import { Component, Input, ViewChild } from '@angular/core';
import { FormGroup, NgForm, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
  selector: 'app-show-note',
  templateUrl: './show-note.component.html',
  styleUrls: ['./show-note.component.scss']
})
export class ShowNoteComponent {
  emailStudent:any;
  NoteList:any[];
  idStudent:number;
  list:any=[]
  email_List
  listapp:any=[]

  constructor(  private _authService: AuthService,
    private router:Router,private route: ActivatedRoute){}

    ngOnInit(): void {
      this._authService.getemailfooter().subscribe(data => {
        this.email_List = data;
      })
      this.getsocial();

      this.route.queryParams.subscribe(params => {
       
        this.idStudent = +params.id;
        this.showNote();
      });
      this.NoteList = [];
    }









showNote() {
  this._authService.getexercice().subscribe(data => {
    this.NoteList = data.filter(a => a.id_exercice === this.idStudent);
  });
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