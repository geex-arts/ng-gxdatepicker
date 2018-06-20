import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import moment from 'moment';

import { MonthDisplay } from '../../models/month-display';
import { ComponentDestroyObserver } from '../../decorators/component-destroy-observer/component-destroy-observer';

@Component({
  selector: 'gxd-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ComponentDestroyObserver
export class CalendarComponent implements OnDestroy {

  @Output() change = new EventEmitter<moment.Moment>();

  value: moment.Moment;
  monthDisplay = new MonthDisplay(moment());

  constructor(private cd: ChangeDetectorRef) { }

  ngOnDestroy(): void { }

  select(day: moment.Moment) {
    this.value = day;
    this.monthDisplay.date = this.value;
    this.cd.detectChanges();
    this.change.emit(this.value);
  }

  parseValue(value: string) {
    this.value = moment(value, 'DD.MM.YYYY');
    this.value = moment(this.value.toISOString());
    this.monthDisplay.date = this.value;
    this.cd.detectChanges();
  }
}
