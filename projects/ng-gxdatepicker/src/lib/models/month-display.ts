import moment from 'moment';
import range from 'lodash/range';

export interface WeeksDay {
  date: moment.Moment;
  today: boolean;
  currentMonth: boolean;
  weekend: boolean;
  rangeBound: boolean;
  rangeBoundStart: boolean;
  rangeBoundEnd: boolean;
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
        const isSelectedDate = this.selectedDate && this.isSameDay(date, this.selectedDate);
        const isRangeDate = this.rangeDate && this.isSameDay(date, this.rangeDate);

        return {
          date: date,
          today: this.isSameDay(date, this.now),
          currentMonth: this.isSameMonth(date, this.date),
          weekend: [6, 0].indexOf(date.day()) !== -1,
          rangeBound: isRangeDate || (this.rangeDate && isSelectedDate),
          rangeBoundStart: rangeDates && this.isSameDay(date, rangeDates[0]),
          rangeBoundEnd: rangeDates && this.isSameDay(date, rangeDates[1]),
          rangeInside: rangeDates && date.isBetween(rangeDates[0], rangeDates[1], 'date', '()'),
          selected: isSelectedDate
        };
      });
    });
  }

  isSameDay(lhs: moment.Moment, rhs: moment.Moment): boolean {
    return lhs.isSame(rhs, 'day')
      && lhs.isSame(rhs, 'month')
      && lhs.isSame(rhs, 'year');
  }

  isSameMonth(lhs: moment.Moment, rhs: moment.Moment): boolean {
    return lhs.isSame(rhs, 'month')
      && lhs.isSame(rhs, 'year');
  }
}
