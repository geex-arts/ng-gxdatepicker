import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy,
  Output
} from '@angular/core';
import moment from 'moment';

import { MonthDisplay } from '../../models/month-display';
import { ComponentDestroyObserver } from '../../decorators/component-destroy-observer/component-destroy-observer';
import { DatepickerOptions } from '../datepicker/datepicker.component';

@Component({
  selector: 'gxd-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ComponentDestroyObserver
export class CalendarComponent implements OnDestroy {

  @Input() options: DatepickerOptions = {};
  @Output() change = new EventEmitter<moment.Moment>();

  value: moment.Moment;
  monthDisplay = new MonthDisplay(moment());

  constructor(private cd: ChangeDetectorRef) { }

  ngOnDestroy(): void { }

  public getValue() {
    return this.value;
  }

  select(day: moment.Moment) {
    this.value = day;
    this.monthDisplay.date = this.value;
    this.cd.detectChanges();
    this.change.emit(this.value);
  }

  parseValue(value: string) {
    const result = moment(value, this.options.format);

    this.value = result.isValid() ? result : undefined;

    if (this.value) {
      this.monthDisplay.date = this.value;
    }

    this.cd.detectChanges();
  }
}
