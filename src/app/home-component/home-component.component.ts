import { Component, Input, OnInit } from '@angular/core';
import { ImageCaptureServiceService } from '../image-capture-service.service';
import { ElementRef } from '@angular/core';
import { ViewChild } from '@angular/core';
import { json } from 'stream/consumers';
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
  private stream: MediaStream | null = null;
  public selectedFile: any;
  capturedImageUrl: any;
  confirmPassword: any;
  isPasswordVisible: boolean = false;
  isConfirmPasswordVisible: boolean = false;
  capturedFile: any;
  

  isLoading = false;

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
      this.isLoading = true;
      var photoUrl = `https://capturedvalidationimages.s3.amazonaws.com/capturedimages/${this.user.email.split('@')[0]+ '_'+ this.user.name}.jpg`;
      this.startCamera();
      const payload = {
        "email": this.user.email,
        "password": this.user.password
      };
      this.service.callLambdaFunctionForLogin(payload).subscribe((res: any) => {
        if (res && !res.error) {
            this.captureImage();              
            this.service.uploadFiles(this.capturedFile as File, this.user.email.split('@')[0],'capturedvalidationimages', 'capturedimages/'+this.user.email.split('@')[0]).subscribe({
              next: () => {
                var validatePayload = {
                  "source_bucket": "capturedvalidationimages",
                  "source_key": "capturedimages/" + this.user.email.split('@')[0],
                  "target_bucket": "profilesids",
                  "target_key": "photoids/"+ this.user.email.split('@')[0] + '_'+ res.Name
                }
                this.service.callLambdaFunctionForValidate(validatePayload).subscribe((response: any) => {
                  if (response && response.statusCode == 200) {
                    var parsedResponse =JSON.parse(response.body);
                    if(parsedResponse.MatchPercentage > 80){
                      this.isLoading = false;
                      this.reset();
                      alert("Success: login successful! Welcome to our platform.");
                      this.stopCamera();
                    }
                    else{
                      alert("Match failed, please try logging again");
                      this.reset();
                    }
                    
                  }
                });
              },
              error: () => alert('Upload failed'),
            });
        }         
      },(error)=>{
        if (error) {
          alert('Error: ' +error.error.error);          
          this.user.password = null;
          if(error.error.error ==  'User Not Found. Please Register.')this.service.isRegisterClicked = true; 
          else this.isPasswordVisible = false;
        }
      })
    }
    else {
      alert('Warning: Please ensure all required fields are filled out.');
    }
  }


  stopCamera(): void {
    if (this.stream) {
      const tracks = this.stream.getTracks();
      tracks.forEach(track => {
        console.log(`Stopping track: ${track.kind}`);
        track.stop();
        track.enabled = false;
      });
      console.log('All tracks stopped.');
  
      if (this.videoElement && this.videoElement.nativeElement) {
        // This is just to remove the video stream from the video element.
        console.log('entered here');
        
        this.videoElement.nativeElement.srcObject = null;
        this.videoElement.nativeElement.pause()
      }
      console.log('exit');
  
      // Reset the stream
      this.stream = null;
      window.location.reload();
    } else {
      console.log('No stream available to stop.');
    }
  }
  

  startCamera(): void {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && this.service.isLoginClicked) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          this.stream = stream;
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
      var photoUrl = `https://profilesids.s3.amazonaws.com/photoids/${this.user.email.split('@')[0]+ '_'+ this.user.name}.jpg`;
      const payload = {
        "email": this.user.email,
        "username": this.user.name,
        "password": this.user.password,
        "profile_picture_url": photoUrl
      }
      this.service.uploadFiles(this.selectedFile.file as File, this.user.email.split('@')[0]+ '_'+ this.user.name,'profilesids', 'photoids/'+this.user.email.split('@')[0]+ '_'+ this.user.name).subscribe({
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

  convertBase64ToFile(base64String: string, filename: string): File |any {
    const parts = base64String.split(';base64,');
    const imageType = parts[0].split(':')[1];
    try{
      const decodedData = window.atob(parts[1]); 
      const uInt8Array = new Uint8Array(decodedData.length);
      for (let i = 0; i < decodedData.length; ++i) {
        uInt8Array[i] = decodedData.charCodeAt(i);
      }
    
      const blob = new Blob([uInt8Array], { type: imageType });
    
      return new File([blob], filename, { type: imageType });
    }
    catch{
      this.loginUser();
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
      this.capturedFile =this.convertBase64ToFile(this.capturedImageUrl, this.user.email.split('@')[0]);
    }
  }
}
