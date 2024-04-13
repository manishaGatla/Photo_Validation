import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as aws from 'aws-sdk';
import * as S3 from 'aws-sdk/clients/s3';

@Injectable({
  providedIn: 'root'
})
export class ImageCaptureServiceService {
  isLoginClicked: boolean = false;
  isRegisterClicked: boolean= false;
  isLoginSuccessful: boolean = false;
  bucket = new S3(
    {
        accessKeyId: 'AKIA32H2RUQYFRXNESGB',
        secretAccessKey: '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',
        region: 'us-east-1'
    }
   );

   

  private apiGatewayEndpointForValidate = 'https://nrmmf02dsj.execute-api.us-east-1.amazonaws.com/dev';
  private apiGatewayEndpointForRegister = 'https://nrmmf02dsj.execute-api.us-east-1.amazonaws.com/dev/Users';
  private apiGatewayEndpointForLogin = 'https://nrmmf02dsj.execute-api.us-east-1.amazonaws.com/dev/Users';

  constructor(private http: HttpClient) { }

  public callLambdaFunctionForRegister(payload: any) {
    return this.http.post(this.apiGatewayEndpointForRegister, payload);
  }

  public callLambdaFunctionForLogin(payload: any) {
    return this.http.get(this.apiGatewayEndpointForLogin+ '?email='+ payload.email + '&password='+ payload.password );
  }

  public callLambdaFunctionForValidate(payload: any) {
    return this.http.post(this.apiGatewayEndpointForValidate, payload );
  }



  uploadFiles(file: File,userId: any, bucketName: any, Key : any) {
    var params = { Bucket: bucketName , Key: Key, Expires: 3600,ContentType:file.type };
    var url=this.bucket.getSignedUrl('putObject',params);
    const formData: FormData = new FormData();
    formData.append('file', file);
    const headers = new HttpHeaders({
      'Content-Type': file.type
    });
     return this.http.put(url, file, {headers: headers});
  }

  uploadFile(file: File, url: string) {
    const formData: FormData = new FormData();
    formData.append('file', file);
    const headers = new HttpHeaders({
      'Content-Type': file.type
    });
    return this.http.put(url, file, { headers }); 
  }
}

