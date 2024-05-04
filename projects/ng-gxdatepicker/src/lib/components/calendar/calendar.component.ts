import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit,
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
export class CalendarComponent implements OnInit, OnDestroy {

  @Input() options: DatepickerOptions = {};
  @Input() dateRanges: DateRange[];
  @Input() defaultDate: string;
  @Output() change = new EventEmitter<moment.Moment>();

  value: moment.Moment;
  monthDisplay: MonthDisplay;

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
    const defaultDate = this.defaultDate
      ? moment(this.defaultDate, this.options.format)
      : moment();
    this.monthDisplay = new MonthDisplay(defaultDate);

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

    if (this.dateRanges) {
      this.fillEnabledDays();
    }
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
    const range = this.dateRanges.find(item => {
      const format = 'YYYY-MM-DD';
      const fromDate = moment(item.fromDate).format(format);
      const toDate = moment(item.toDate).format(format);
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

  goToPrevYear() {
    this.monthDisplay.prevYear();

    if (this.dateRanges) {
      this.fillEnabledDays();
    }
  }
  goToNextYear() {
    this.monthDisplay.nextYear();

    if (this.dateRanges) {
      this.fillEnabledDays();
    }
  }
}
