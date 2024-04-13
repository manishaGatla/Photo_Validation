import { Component } from '@angular/core';
import { ImageCaptureServiceService } from '../image-capture-service.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  constructor(public service: ImageCaptureServiceService) { }

  loginClicked() {
    this.service.isLoginSuccessful  = false;
    this.service.isLoginClicked = true;
    this.service.isRegisterClicked = false;
  }

  registerClicked() {
    this.service.isLoginSuccessful = false;
    this.service.isLoginClicked = false;
    this.service.isRegisterClicked = true;
  }

  logoutClicked() {
    this.service.isLoginSuccessful = false;
    window.location.reload();
  }

}
