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
    this.startCamera();
    const payload = {
      "email": this.user.email,
      "username": this.user.name,
      "password": this.user.password
    }
    this.captureImage();
    console.log(this.capturedImageUrl);
    // this.service.callLambdaFunctionForLogin(payload).subscribe((res: any)=>{
    //   if(res){

    //   }
    // })
  }

  startCamera(): void {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          this.videoElement.nativeElement.srcObject = stream;
          this.videoElement.nativeElement.play()
            .catch((error: any) => {
              if (error.name === "NotAllowedError") {
                alert('Please allow camera access and refresh the page.');
              }
              console.error('Error trying to play the video stream', error);
            });
        })
        .catch(error => {
          console.error('Error getting user media:', error);
          if (error.name === "NotAllowedError") {
            alert('Please allow camera access and refresh the page.');
          }
        });
    } else {
      console.error('Media devices are not supported by this browser.');
    }
  }


  registerUser() {
    const payload = {
      "email": this.user.email,
      "username": this.user.name,
      "password": this.user.password,
      "profile_picture_url": `https://verify-id-webapp.s3.amazonaws.com/profile_pictures/${this.user.name}/profile.jpg`
    }
    this.service.callLambdaFunctionForRegister(payload).subscribe((res: any) => {
      if (res) {
        this.service.uploadFile(this.selectedFile.file as File, `https://verify-id-webapp.s3.amazonaws.com/profile_pictures/${this.user.name}/profile.jpg`).subscribe({
          next: () => {
            alert('Upload successful');
            this.reset();
          },
          error: () => alert('Upload failed'),
        });
      }
    })
  }

  backClicked() {
    this.service.isLoginClicked = false;
    this.service.isRegisterClicked = false;
    this.reset();
  }

  reset() {
    this.user = {
      name: null,
      email: null,
      password: null
    };
    this.urlOfImage = '';
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
