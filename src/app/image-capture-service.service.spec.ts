import { TestBed } from '@angular/core/testing';

import { ImageCaptureServiceService } from './image-capture-service.service';

describe('ImageCaptureServiceService', () => {
  let service: ImageCaptureServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageCaptureServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
