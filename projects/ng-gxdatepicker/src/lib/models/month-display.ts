import moment from 'moment';
import * as _ from 'lodash';

export interface WeeksDay {
  date: moment.Moment;
  today: boolean;
  currentMonth: boolean;
  weekend: boolean;
  selected: boolean;
}

export interface DayOfWeek {
  date: moment.Moment;
  weekend: boolean;
}

export class MonthDisplay {

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
    return this.monthFirstDay.clone().day(1);
  }

  get monthLastDay() {
    return this.date.clone().date(1).add(1, 'month').subtract(1, 'day');
  }

  get displayLastDay() {
    return this.monthLastDay.clone().day(6).add(1, 'day');
  }

  prevMonth() {
    this.date.subtract(1, 'month');
    this.updateWeeks();
  }

  nextMonth() {
    this.date.add(1, 'month');
    this.updateWeeks();
  }

  private updateWeeks() {
    const firstDay = this.displayFirstDay;
    const weeks = Math.ceil(this.displayLastDay.diff(this.displayFirstDay, 'weeks', true));

    this.weekDays = _.range(0, 6 + 1).map(day => {
      const date = firstDay.clone().add(day, 'days');

      return {
        date: date,
        weekend: [6, 0].indexOf(date.day()) != -1
      };
    });

    this.weeks = _.range(0, weeks).map(week => {
      return _.range(0, 7).map(day => {
        const date = firstDay.clone().add(week, 'weeks').add(day, 'days');

        return {
          date: date,
          today: date.isSame(this.now, 'day'),
          currentMonth: date.isSame(this.date, 'month'),
          weekend: [6, 0].indexOf(date.day()) != -1,
          selected: date.isSame(this.date, 'day')
        };
      });
    });
  }
}
