import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigBuilderComponent } from './config-builder.component';

describe('ConfigBuilderComponent', () => {
  let component: ConfigBuilderComponent;
  let fixture: ComponentFixture<ConfigBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigBuilderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
