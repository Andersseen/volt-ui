import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Volt } from './volt';

describe('Volt', () => {
  let component: Volt;
  let fixture: ComponentFixture<Volt>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Volt],
    }).compileComponents();

    fixture = TestBed.createComponent(Volt);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
