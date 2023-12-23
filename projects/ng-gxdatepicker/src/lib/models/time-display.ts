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

export function isHourPm(hour: number): boolean {
  return hour >= 12 && hour <= 23;
}

export class TimeDisplay {

  options: TimeOption[];
  hours: TimeOptionItem[];
  minutes: TimeOptionItem[];
  seconds: TimeOptionItem[];
  periods: TimeOptionItem[];

  constructor(private _date: moment.Moment, private _clock12 = false) {
    this.updateTime();
  }

  get now() {
    return moment();
  }

  get date() {
    return this._date;
  }

  set clock12(value) {
    this._clock12 = value;
    this.updateTime();
  }

  get clock12() {
    return this._clock12;
  }

  set date(date) {
    this._date = date;
    this.updateTime();
  }

  private updateTime() {
    if (this.clock12) {
      this.hours = [12, ...range(1, 11 + 1)].map(hour => {
        const pm = this.date ? isHourPm(this.date.hour()) : false;
        const newHour = (pm ? 12 : 0) + (hour === 12 ? 0 : hour);
        const date = this.date.clone().hour(newHour);

        return {
          date: date,
          now: date.isSame(this.now, 'hour'),
          selected: date.isSame(this.date, 'hour'),
          str: date.format('hh')
        };
      });
    } else {
      this.hours = range(0, 23 + 1).map(hour => {
        const date = this.date.clone().hour(hour);

        return {
          date: date,
          now: date.isSame(this.now, 'hour'),
          selected: date.isSame(this.date, 'hour'),
          str: date.format('HH')
        };
      });
    }

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

    this.periods = this.clock12 ? [false, true].map(pm => {
      const hour = pm ? this.date.hour() % 12 + 12 : this.date.hour() % 12;
      const date = this.date.clone().hour(hour);

      return {
        date: date,
        now: pm === isHourPm(this.now.hour()),
        selected: this.date ? pm === isHourPm(this.date.hour()) : false,
        str: date.format('A')
      };
    }) : [];

    this.options = [
      { title: 'Hours', items: this.hours },
      { title: 'Minutes', items: this.minutes },
      { title: 'Seconds', items: this.seconds },
      ...(this.clock12 ? [{ title: 'AM/PM', items: this.periods }] : [])
    ];
  }
}
