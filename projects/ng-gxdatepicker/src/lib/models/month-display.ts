import moment from 'moment';
import range from 'lodash/range';

export interface WeeksDay {
  date: moment.Moment;
  today: boolean;
  currentMonth: boolean;
  weekend: boolean;
  rangeBound: boolean;
  rangeInside: boolean;
  selected: boolean;
  enabled: boolean;
}

export interface DayOfWeek {
  date: moment.Moment;
  weekend: boolean;
}

export class MonthDisplay {

  selectedDate: moment.Moment;
  rangeDate: moment.Moment;
  weekDays: DayOfWeek[] = [];
  weeks: WeeksDay[][] = [];

  constructor(private _date: moment.Moment) {
    this.updateWeeks();
  }

  get now() {
    return moment();
  }

  get date() {
    return this._date;
  }

  set date(date) {
    this._date = date;
    this.updateWeeks();
  }

  get monthFirstDay() {
    return this.date.clone().date(1);
  }

  get displayFirstDay() {
    if (this.monthFirstDay.clone().day() === 0) {
      return this.monthFirstDay.clone().subtract(1, 'day').day(1);
    } else {
      return this.monthFirstDay.clone().day(1);
    }
  }

  get monthLastDay() {
    return this.date.clone().date(1).add(1, 'month').subtract(1, 'day');
  }

  get displayLastDay() {
    if (this.monthLastDay.clone().day() === 0) {
      return this.monthLastDay.clone();
    } else {
      return this.monthLastDay.clone().day(6).add(1, 'day');
    }
  }

  prevMonth() {
    this.date.subtract(1, 'month');
    this.updateWeeks();
  }

  nextMonth() {
    this.date.add(1, 'month');
    this.updateWeeks();
  }

  prevYear() {
    this.date.subtract(1, 'year');
    this.updateWeeks();
  }

  nextYear() {
    this.date.add(1, 'year');
    this.updateWeeks();
  }

  updateWeeks() {
    const firstDay = this.displayFirstDay;
    const weeks = Math.ceil(this.displayLastDay.diff(this.displayFirstDay, 'weeks', true));

    this.weekDays = range(0, 6 + 1).map(day => {
      const date = firstDay.clone().add(day, 'days');

      return {
        date: date,
        weekend: [6, 0].indexOf(date.day()) !== -1
      };
    });

    const rangeDates = this.selectedDate && this.rangeDate
      ? [this.selectedDate, this.rangeDate].sort((lhs, rhs) => lhs.diff(rhs))
      : undefined;

    this.weeks = range(0, weeks).map(week => {
      return range(0, 7).map(day => {
        const date = firstDay.clone().add(week, 'weeks').add(day, 'days');
        const isSelectedDate = this.selectedDate
          && date.isSame(this.selectedDate, 'day')
          && date.isSame(this.selectedDate, 'month')
          && date.isSame(this.selectedDate, 'year');
        const isRangeDate = this.rangeDate
          && date.isSame(this.rangeDate, 'day')
          && date.isSame(this.rangeDate, 'month')
          && date.isSame(this.rangeDate, 'year');

        return {
          date: date,
          today: date.isSame(this.now, 'day') && date.isSame(this.now, 'month') && date.isSame(this.now, 'year'),
          currentMonth: date.isSame(this.date, 'month') && date.isSame(this.date, 'year'),
          weekend: [6, 0].indexOf(date.day()) !== -1,
          rangeBound: isRangeDate || (this.rangeDate && isSelectedDate),
          rangeInside: rangeDates && date.isBetween(rangeDates[0], rangeDates[1], 'date', '()'),
          selected: isSelectedDate
        };
      });
    });
  }
}
