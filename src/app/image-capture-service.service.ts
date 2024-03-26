import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageCaptureServiceService {
  isLoginClicked: boolean = false;
  isRegisterClicked: boolean= false;
  isLoginSuccessful: boolean = false;
  
  constructor() { }

 
}
