import { Component, Input, OnInit } from '@angular/core';
import { ImageCaptureServiceService } from '../image-capture-service.service';

@Component({
  selector: 'app-home-component',
  templateUrl: './home-component.component.html',
  styleUrls: ['./home-component.component.scss']
})
export class HomeComponentComponent implements OnInit{
  uploadImageLabel: string = 'Choose a file to upload';
  user: any ={
    name : null,
    email : null,
  };  
  public urlOfImage:string = '';
  public selectedFile:any ;

  constructor(public service: ImageCaptureServiceService){}
  ngOnInit():void{

  }



  

  onFileSelected(event : any): void {
      this.urlOfImage="";
      const selectedfile: File = event.target.files[0];
      this.selectedFile = {
        file :selectedfile
      };
      var reader = new FileReader();
      reader.readAsDataURL(selectedfile);
      reader.onload = (res :any)=>{
        if(selectedfile.type !== "text/plain"){
          this.urlOfImage = res.target.result;
        }
      }
  }

  loginUser(){

  }

  registerUser(){

  }

  backClicked(){
    this.service.isLoginClicked= false;
    this.service.isRegisterClicked = false;
    this.reset();
  }

  reset(){
    this.user ={
      name : null,
      email : null,
    };  
    this.urlOfImage = '';
  }

}
