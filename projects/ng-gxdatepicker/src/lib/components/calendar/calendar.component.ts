import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit,
  Output
} from '@angular/core';
import moment from 'moment';
import range from 'lodash/range';

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
  @Input() classes: string[] = [];
  @Output() change = new EventEmitter<moment.Moment>();

  value: moment.Moment;
  monthDisplays: MonthDisplay[] = [];

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
    const defaultDateInput = this.defaultDate ? moment(this.defaultDate, this.options.format) : undefined;
    const defaultDate = defaultDateInput && defaultDateInput.isValid() ? defaultDateInput : moment();

    this.monthDisplays = range(this.options.months).map(i => {
      const date = defaultDate.clone().add(i, 'months');
      return new MonthDisplay(date);
    });

    if (this.dateRanges) {
      this.fillEnabledDays();
    }
  }

  fillEnabledDays() {
    this.monthDisplays.forEach(monthDisplay => {
      monthDisplay.weeks.forEach(week => {
        week.forEach(day => {
          if (this.isDateEnabled(day.date) !== null) {
            day.enabled = this.isDateEnabled(day.date);
          }
        });
      });
    });
  }

  ngOnDestroy(): void { }

  public getValue() {
    return this.value;
  }

  select(day: moment.Moment) {
    this.value = day;

    const monthDisplaysStart = this.monthDisplays[0].date.startOf('month');
    const monthDisplaysEnd = this.monthDisplays[this.monthDisplays.length - 1].date.endOf('month');

    this.monthDisplays.forEach((monthDisplay, i) => {
      monthDisplay.selectedDate = this.value ? this.value.clone() : undefined;

      if (this.value && !this.value.isBetween(monthDisplaysStart, monthDisplaysEnd, 'day', '[]')) {
        monthDisplay.date = this.value.clone().add(i, 'months');
      } else {
        monthDisplay.updateWeeks();
      }
    });

    this.cd.detectChanges();
    this.change.emit(this.value);

    if (this.dateRanges) {
      this.fillEnabledDays();
    }
  }

  parseValue(value: string, rangeValue?: string) {
    const valueDate = moment(value, this.options.format);
    const rangeDate = rangeValue !== undefined ? moment(rangeValue, this.options.format) : undefined;

    this.value = valueDate.isValid() ? valueDate : undefined;

    const monthDisplaysStart = this.monthDisplays[0].date.startOf('month');
    const monthDisplaysEnd = this.monthDisplays[this.monthDisplays.length - 1].date.endOf('month');

    this.monthDisplays.forEach((monthDisplay, i) => {
      monthDisplay.selectedDate = this.value ? this.value.clone() : undefined;
      monthDisplay.rangeDate = rangeDate && rangeDate.isValid() ? rangeDate.clone() : undefined;

      if (this.value && !this.value.isBetween(monthDisplaysStart, monthDisplaysEnd, 'day', '[]')) {
        monthDisplay.date = this.value.clone().add(i, 'months');
      } else {
        monthDisplay.updateWeeks();
      }
    });

    this.cd.detectChanges();
  }

  isDateEnabled(date: any) {
    const dateRange = this.dateRanges.find(item => {
      const format = 'YYYY-MM-DD';
      const fromDate = moment(item.fromDate).format(format);
      const toDate = moment(item.toDate).format(format);
      const formattedDate = date.format(format);

      return formattedDate >= fromDate && formattedDate <= toDate;
    });

    if (dateRange) {
      return dateRange.enable;
    } else {
      return null;
    }
  }

  goToPrevMonth() {
    this.monthDisplays.forEach(monthDisplay => {
      monthDisplay.prevMonth();
    });

    if (this.dateRanges) {
      this.fillEnabledDays();
    }
  }
  goToNextMonth() {
    this.monthDisplays.forEach(monthDisplay => {
      monthDisplay.nextMonth();
    });

    if (this.dateRanges) {
      this.fillEnabledDays();
    }
  }

  goToPrevYear() {
    this.monthDisplays.forEach(monthDisplay => {
      monthDisplay.prevYear();
    });

    if (this.dateRanges) {
      this.fillEnabledDays();
    }
  }
  goToNextYear() {
    this.monthDisplays.forEach(monthDisplay => {
      monthDisplay.nextYear();
    });

    if (this.dateRanges) {
      this.fillEnabledDays();
    }
  }
}
