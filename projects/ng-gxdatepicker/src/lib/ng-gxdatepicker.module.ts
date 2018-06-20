import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgXScrollableModule } from 'ng-xscrollable';

import 'hammerjs';

import { DatepickerComponent } from './components/datepicker/datepicker.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { ClockComponent } from './components/clock/clock.component';

@NgModule({
  imports: [
    CommonModule,
    NgXScrollableModule
  ],
  declarations: [
    DatepickerComponent,
    CalendarComponent,
    ClockComponent
  ],
  exports: [
    DatepickerComponent
  ]
})
export class NgGxDatepickerModule { }
