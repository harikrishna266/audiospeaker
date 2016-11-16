/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ContextMenuServiceService } from './context-menu-service.service';

describe('Service: ContextMenuService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ContextMenuServiceService]
    });
  });

  it('should ...', inject([ContextMenuServiceService], (service: ContextMenuServiceService) => {
    expect(service).toBeTruthy();
  }));
});
