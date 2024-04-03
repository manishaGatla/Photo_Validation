import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageCaptureServiceService {
  isLoginClicked: boolean = false;
  isRegisterClicked: boolean= false;
  isLoginSuccessful: boolean = false;

  private apiGatewayEndpointForRegister = 'https://xlxhu4v6r9.execute-api.us-east-1.amazonaws.com/stage1/';
  private apiGatewayEndpointForLogin = 'https://xlxhu4v6r9.execute-api.us-east-1.amazonaws.com/stage1/';

  constructor(private http: HttpClient) { }

  public callLambdaFunctionForRegister(payload: any) {
    return this.http.post(this.apiGatewayEndpointForRegister, payload);
  }

  public callLambdaFunctionForLogin(payload: any) {
    return this.http.post(this.apiGatewayEndpointForLogin, payload);
  }

  getPresignedUrl(fileName: string) {
    return this.http.get<{ url: string, key: string }>('https:localhost:3200/api/getPresignedUrl', { params: { fileName } });
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

