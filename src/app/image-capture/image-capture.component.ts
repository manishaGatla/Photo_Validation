import { Component,ChangeDetectionStrategy , ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Import HttpClient


@Component({
  selector: 'app-image-capture',
  templateUrl: './image-capture.component.html',
  styleUrls: ['./image-capture.component.scss']
})
export class ImageCaptureComponent {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  imagePreview: any;
  isUploadClicked: boolean = false;
  capturedImagePreview: any;
  showCamera: boolean = false;
  imageCaptured: boolean = false;
  uploadImageLabel: string = 'Choose a file to upload';
  startCameraLabel: string = 'Start the camera for live verification';
  StartCameraActionName : string  ='Start Camera';
  constructor(private cdr: ChangeDetectorRef) {}

  onFileSelected(event : any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => this.imagePreview = reader.result;
      reader.readAsDataURL(file);
    }
  }

  startCamera(): void {
    this.showCamera = true;
    this.imageCaptured = false;
  
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          this.videoElement.nativeElement.srcObject = stream;
          this.videoElement.nativeElement.play()
            .catch(error => {
              console.error('Error trying to play the video stream', error);
            });
        })
        .catch(error => {
          console.error('Error getting user media:', error);
        });
    } else {
      console.error('Media devices are not supported by this browser.');
    }
  }
  

  captureImage(): void {
    const context = this.canvas.nativeElement.getContext('2d');
    if (context) {
      const width = this.videoElement.nativeElement.videoWidth;
      const height = this.videoElement.nativeElement.videoHeight;
      this.canvas.nativeElement.width = width;
      this.canvas.nativeElement.height = height;
      context.drawImage(this.videoElement.nativeElement, 0, 0, width, height);
      this.capturedImagePreview = this.canvas.nativeElement.toDataURL('image/png');
      this.showCamera = false;
      this.imageCaptured = true;
      this.StartCameraActionName ="Retake";
    }
  }

  retakeImage(): void {
    this.startCamera(); // Restart the camera to take another picture
  }

//  uploadImages(): void {
//     const uploadData = new FormData();
//     uploadData.append('file', this.imagePreview, 'file.png');
//     this.http.post('http://your-nodejs-server.com/upload', uploadData).subscribe(response => {
//       console.log(response);
//       // Handle response
//     });
//  }
  
//    verifyImages(): void {
//     this.http.get('http://your-nodejs-server.com/verify').subscribe(response => {
//       console.log(response);
//       // Handle verification response
//     });
//   }

open(){
  window.open('https://i.pinimg.com/originals/ac/b8/bd/acb8bd2146ce943c223b369a26815a7e.png','_blank');
}
}
