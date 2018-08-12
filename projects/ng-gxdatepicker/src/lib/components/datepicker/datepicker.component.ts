import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output,
  ViewChild
} from '@angular/core';
import { fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';
import moment from 'moment';
import * as _ from 'lodash';

import { CalendarComponent } from '../calendar/calendar.component';
import {
  ComponentDestroyObserver,
  whileComponentNotDestroyed
} from '../../decorators/component-destroy-observer/component-destroy-observer';
import { DatepickerService } from '../../services/datepicker.service';
import { ClockComponent } from '../clock/clock.component';

export interface DatepickerOptions {
  theme?: string;
  format?: string;
  date?: boolean;
  time?: boolean;
}

export const DefaultDatepickerOptions: DatepickerOptions = {
  theme: 'default',
  date: true,
  time: true
};

export enum DatepickerPosition {
  BottomLeft,
  BottomRight,
  TopLeft,
  TopRight
}

@Component({
  selector: 'gxd-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ComponentDestroyObserver
export class DatepickerComponent implements OnInit, OnDestroy {

  @Input() input: any;
  @Input() options: DatepickerOptions = {};
  @ViewChild('root') root: ElementRef;
  @ViewChild(CalendarComponent) calendar: CalendarComponent;
  @ViewChild(ClockComponent) clock: ClockComponent;
  @Output() change = new EventEmitter<moment.Moment>();

  opened = false;
  position = DatepickerPosition.BottomLeft;
  positions = DatepickerPosition;

  constructor(private cd: ChangeDetectorRef,
              private datepickerService: DatepickerService) { }

  ngOnInit() {
    fromEvent(this.input, 'focus')
      .pipe(whileComponentNotDestroyed(this))
      .subscribe(() => this.open());

    fromEvent(document, 'click')
      .pipe(whileComponentNotDestroyed(this))
      .subscribe((e: MouseEvent) => {
        if (!this.opened || e.target == this.input || this.isInside(e.target, this.root.nativeElement)) {
          return;
        }

        this.close();
      });

    fromEvent(this.input, 'keydown')
      .pipe(whileComponentNotDestroyed(this))
      .subscribe(() => this.close());

    this.datepickerService.opened$
      .pipe(
        filter(opened => opened !== this),
        whileComponentNotDestroyed(this)
      )
      .subscribe(() => this.close());
  }

  ngOnDestroy(): void { }

  get currentOptions() {
    const options = _.defaults(this.options, DefaultDatepickerOptions);
    if (!options.format) {
      if (options.date && options.time) {
        options.format = 'DD.MM.YYYY HH:mm:ss';
      } else if (options.date) {
        options.format = 'DD.MM.YYYY';
      } else if (options.time) {
        options.format = 'HH:mm:ss';
      } else {
        options.format = '';
      }
    }
    return options;
  }

  isInside(el, container) {
    let node = el;

    while (node) {
      if (node == container) {
        return true;
      } else {
        node = node.parentElement;
      }
    }

    return false;
  }

  updateValue() {
    if (this.currentOptions.date) {
      this.calendar.parseValue(this.input.value);
    }

    if (this.currentOptions.time) {
      this.clock.parseValue(this.input.value);
    }
  }

  open() {
    this.opened = true;
    this.cd.detectChanges();
    this.updateValue();
    this.datepickerService.opened = this;
  }

  close() {
    this.opened = false;
    this.cd.detectChanges();

    if (this.datepickerService.opened === this) {
      this.datepickerService.opened = undefined;
    }
  }

  constructValue() {
    const date = this.currentOptions.date && this.calendar.getValue() ? this.calendar.getValue() : moment();
    const time = this.currentOptions.time &&  this.clock.getValue() ? this.clock.getValue() : moment();

    return moment().set({
      year: date.get('year'),
      month: date.get('month'),
      date: date.get('date'),
      hour: time.get('hour'),
      minute: time.get('minute'),
      second: time.get('second'),
      millisecond: time.get('millisecond')
    });
  }

  onDateChange() {
    const value = this.constructValue();

    this.input.value = value.format(this.currentOptions.format);

    if (!this.currentOptions.time) {
      this.close();
    }

    this.input.dispatchEvent(new Event('change'));
    this.change.emit(value);
  }

  onTimeChange() {
    const value = this.constructValue();

    this.input.value = value.format(this.currentOptions.format);
    this.input.dispatchEvent(new Event('change'));
    this.change.emit(value);
  }
}
