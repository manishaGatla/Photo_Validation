import { Component, Input, OnInit } from '@angular/core';
import { ImageCaptureServiceService } from '../image-capture-service.service';
import { ElementRef } from '@angular/core';
import { ViewChild } from '@angular/core';
@Component({
  selector: 'app-home-component',
  templateUrl: './home-component.component.html',
  styleUrls: ['./home-component.component.scss']
})
export class HomeComponentComponent implements OnInit {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  uploadImageLabel: string = 'Choose a file to upload';

  user: any = {
    name: null,
    email: null,
    password: null
  };
  public urlOfImage: string = '';
  public selectedFile: any;
  capturedImageUrl: any;
  confirmPassword: any;
  isPasswordVisible: boolean = false;
  isConfirmPasswordVisible: boolean = false;

  constructor(public service: ImageCaptureServiceService) { }
  ngOnInit(): void {
  }





  onFileSelected(event: any): void {
    this.urlOfImage = "";
    const selectedfile: File = event.target.files[0];
    this.selectedFile = {
      file: selectedfile
    };
    var reader = new FileReader();
    reader.readAsDataURL(selectedfile);
    reader.onload = (res: any) => {
      if (selectedfile.type !== "text/plain") {
        this.urlOfImage = res.target.result;
      }
    }
  }

  loginUser() {
    if (this.checkLoginEnable()) {
      this.startCamera();
      const payload = {
        "email": this.user.email,
        "username": this.user.name,
        "password": this.user.password
      }
      this.captureImage();
      this.service.callLambdaFunctionForLogin(payload).subscribe((res: any) => {
        if (res && res.statusCode == 200) {


        }
        else if (res && res.statusCode == 400) {
          alert("Error: Incorrect Password. Please reenter correct password");
          this.user.password = null;
          this.isPasswordVisible = false;
        }
        else if (res && res.statusCode == 404) {
          alert("Error: User Not Found. Please Register.");
          this.reset();
          this.service.isRegisterClicked = true;
        }
      })
    }
    else {
      alert('Warning: Please ensure all required fields are filled out.');
    }
  }

  startCamera(): void {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          this.videoElement.nativeElement.srcObject = stream;
          this.videoElement.nativeElement.play()
            .catch((error: any) => {
              if (error.name === "NotAllowedError") {
                alert('Warning: Please allow camera access and refresh the page.');
              }
              console.error('Error: Error trying to play the video stream', error);
            });
        })
        .catch(error => {
          console.error('Error getting user media:', error);
          if (error.name === "NotAllowedError") {
            alert('Warning: Please allow camera access and refresh the page.');
          }
        });
    } else {
      console.error('Error: Media devices are not supported by this browser.');
    }
  }

  registerUser() {
    if (this.checkRegisterEnable()) {
      var photoUrl = `https://verify-id-webapp.s3.amazonaws.com/profile_pictures/${this.user.name}/profile.jpg`;
      const payload = {
        "email": this.user.email,
        "username": this.user.name,
        "password": this.user.password,
        "profile_picture_url": photoUrl
      }
      this.service.uploadFile(this.selectedFile.file as File, photoUrl).subscribe({
        next: () => {
          this.service.callLambdaFunctionForRegister(payload).subscribe((res: any) => {
            if (res && res.statusCode == 200) {
              alert("Success: Registration successful! Welcome to our platform.");
              this.reset();
            }
          });
        },
        error: () => alert('Upload failed'),
      });
    }
    else {
      alert('Warning: Please ensure all required fields are filled out.');
    }
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email != null && email != "" ? emailRegex.test(email) : true;
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
  }

  isNullOrEmpty(value: string){
    return value == null || value == '';
  }

  checkRegisterEnable() {
    return this.user.password == this.confirmPassword
      && !this.isNullOrEmpty(this.user.email)
      && !this.isNullOrEmpty(this.user.password)
      && !this.isNullOrEmpty(this.user.name)
      && !this.isNullOrEmpty(this.urlOfImage);
  }

  checkLoginEnable() {
    return  !this.isNullOrEmpty(this.user.email)
      && !this.isNullOrEmpty(this.user.password);
  }


  backClicked() {
    this.service.isLoginClicked = false;
    this.service.isRegisterClicked = false;
    this.reset();
  }

  loginClicked() {
    this.reset();
    this.service.isLoginClicked = true;
  }

  registerClicked() {
    this.reset();
    this.service.isRegisterClicked = true;
  }


  reset() {
    this.user = {
      name: null,
      email: null,
      password: null
    };
    this.urlOfImage = '';
    this.service.isLoginClicked = false;
    this.service.isRegisterClicked = false;
    this.isConfirmPasswordVisible = false;
    this.isPasswordVisible = false;
    this.confirmPassword = null;
  }


  captureImage(): void {
    const context = this.canvas.nativeElement.getContext('2d');
    if (context) {
      const width = this.videoElement.nativeElement.videoWidth;
      const height = this.videoElement.nativeElement.videoHeight;
      this.canvas.nativeElement.width = width;
      this.canvas.nativeElement.height = height;
      context.drawImage(this.videoElement.nativeElement, 0, 0, width, height);
      this.capturedImageUrl = this.canvas.nativeElement.toDataURL('image/png');
    }
  }
}
