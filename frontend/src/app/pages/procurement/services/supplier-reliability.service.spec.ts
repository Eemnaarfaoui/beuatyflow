import { TestBed } from '@angular/core/testing';

import { SupplierReliabilityService } from './suppliers.service';

describe('SupplierReliabilityService', () => {
  let service: SupplierReliabilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupplierReliabilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
