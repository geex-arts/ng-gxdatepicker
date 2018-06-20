import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, Output, ViewChild } from '@angular/core';
import moment from 'moment';

import { TimeDisplay, TimeOption } from '../../models/time-display';
import { ScrollableDirective } from 'ng-gxscrollable';

@Component({
  selector: 'app-clock',
  templateUrl: './clock.component.html',
  styleUrls: ['./clock.component.scss']
})
export class ClockComponent implements OnDestroy {

  @Output() change = new EventEmitter<moment.Moment>();
  @ViewChild(ScrollableDirective) scrollable: ScrollableDirective;

  value: moment.Moment;
  timeDisplay = new TimeDisplay(moment());

  constructor(private cd: ChangeDetectorRef) { }

  ngOnDestroy(): void { }

  select(value: moment.Moment) {
    this.value = value;
    this.timeDisplay.date = this.value;
    this.cd.detectChanges();
    this.change.emit(this.value);
  }

  parseValue(value: string) {
    this.value = moment(value, 'DD.MM.YYYY');
    this.value = moment(this.value.toISOString());
    this.timeDisplay.date = this.value;
    this.cd.detectChanges();
  }

  trackByFn(_: any, item: TimeOption) {
    return item.title;
  }
}
