import moment from 'moment';
import range from 'lodash/range';

export interface TimeOptionItem {
  date: moment.Moment;
  now: boolean;
  selected: boolean;
  str: string;
}

export interface TimeOption {
  items: TimeOptionItem[];
  title: string;
}

export class TimeDisplay {

  options: TimeOption[];
  hours: TimeOptionItem[];
  minutes: TimeOptionItem[];
  seconds: TimeOptionItem[];

  constructor(private _date: moment.Moment) {
    this.updateTime();
  }

  get now() {
    return moment();
  }

  get date() {
    return this._date;
  }

  set date(date) {
    this._date = date;
    this.updateTime();
  }

  private updateTime() {
    this.hours = range(0, 23 + 1).map(hour => {
      const date = this.date.clone().hour(hour);

      return {
        date: date,
        now: date.isSame(this.now, 'hour'),
        selected: date.isSame(this.date, 'hour'),
        str: date.format('HH')
      };
    });

    this.minutes = range(0, 59 + 1).map(minute => {
      const date = this.date.clone().minute(minute);

      return {
        date: date,
        now: date.isSame(this.now, 'minute'),
        selected: date.isSame(this.date, 'minute'),
        str: date.format('mm')
      };
    });

    this.seconds = range(0, 59 + 1).map(second => {
      const date = this.date.clone().second(second);

      return {
        date: date,
        now: date.isSame(this.now, 'second'),
        selected: date.isSame(this.date, 'second'),
        str: date.format('ss')
      };
    });

    this.options = [
      { title: 'Hours', items: this.hours },
      { title: 'Minutes', items: this.minutes },
      { title: 'Seconds', items: this.seconds }
    ];
  }
}
