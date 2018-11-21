import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy,
  Output
} from '@angular/core';
import moment from 'moment';

import { MonthDisplay } from '../../models/month-display';
import { ComponentDestroyObserver } from '../../decorators/component-destroy-observer/component-destroy-observer';
import { DatepickerOptions } from '../datepicker/datepicker.component';
import { DateRange } from '../../models/date-range';

@Component({
  selector: 'gxd-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ComponentDestroyObserver
export class CalendarComponent implements OnDestroy {

  @Input() options: DatepickerOptions = {};
  @Input() dateRanges: DateRange[];
  @Output() change = new EventEmitter<moment.Moment>();

  value: moment.Moment;
  monthDisplay = new MonthDisplay(moment());

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
    if (this.dateRanges) {
      this.fillEnabledDays();
    }
  }

  fillEnabledDays() {
    this.monthDisplay.weeks.forEach(week => {
      week.forEach(day => {
        if (this.isDateEnabled(day.date) !== null) {
          day.enabled = this.isDateEnabled(day.date);
        }
      });
    });
  }

  ngOnDestroy(): void { }

  public getValue() {
    return this.value;
  }

  select(day: moment.Moment) {
    this.value = day;
    this.monthDisplay.selectedDate = this.value.clone();
    this.monthDisplay.date = this.value.clone();
    this.cd.detectChanges();
    this.change.emit(this.value);
  }

  parseValue(value: string) {
    const result = moment(value, this.options.format);

    this.value = result.isValid() ? result : undefined;

    if (this.value) {
      this.monthDisplay.selectedDate = this.value.clone();
      this.monthDisplay.date = this.value.clone();
    }

    this.cd.detectChanges();
  }

  isDateEnabled(date: any) {
    let range = this.dateRanges.find(range => {
      const format = 'YYYY-MM-DD';
      const fromDate = moment(range.fromDate).format(format);
      const toDate = moment(range.toDate).format(format);
      const formattedDate = date.format(format);

      return formattedDate >= fromDate && formattedDate <= toDate;
    });

    if (range) {
      return range.enable;
    } else {
      return null;
    }
  }

  goToPrevMonth() {
    this.monthDisplay.prevMonth();

    if (this.dateRanges) {
      this.fillEnabledDays();
    }
  }
  goToNextMonth() {
    this.monthDisplay.nextMonth();

    if (this.dateRanges) {
      this.fillEnabledDays();
    }
  }
}
