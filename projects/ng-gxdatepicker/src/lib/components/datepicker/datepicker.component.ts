import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Inject, Input, OnDestroy, OnInit,
  Output, PLATFORM_ID, ViewChild
} from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import { fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';
import moment from 'moment';
import defaults from 'lodash/defaults';

import { CalendarComponent } from '../calendar/calendar.component';
import {
  ComponentDestroyObserver,
  whileComponentNotDestroyed
} from '../../decorators/component-destroy-observer/component-destroy-observer';
import { DatepickerService } from '../../services/datepicker.service';
import { ClockComponent } from '../clock/clock.component';
import { DateRange } from '../../models/date-range';

export interface DatepickerOptions {
  theme?: string;
  format?: string;
  date?: boolean;
  time?: boolean;
  static?: boolean;
  margin?: number;
}

export const DefaultDatepickerOptions: DatepickerOptions = {
  theme: 'default',
  date: true,
  time: true,
  static: false,
  margin: 0
};

@Component({
  selector: 'gxd-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@ComponentDestroyObserver
export class DatepickerComponent implements OnInit, OnDestroy {

  @Input() input: any;
  @Input() origin: CdkOverlayOrigin;
  @Input() options: DatepickerOptions = {};
  @Input() dateRanges: DateRange[];
  @ViewChild('root') root: ElementRef;
  @ViewChild(CalendarComponent) calendar: CalendarComponent;
  @ViewChild(ClockComponent) clock: ClockComponent;
  @Output() change = new EventEmitter<moment.Moment>();

  opened = false;

  constructor(private cd: ChangeDetectorRef,
              @Inject(PLATFORM_ID) private platformId: Object,
              private datepickerService: DatepickerService) { }

  ngOnInit() {
    if (this.isPlatformServer()) {
      return;
    }

    fromEvent(this.input, 'focus')
      .pipe(whileComponentNotDestroyed(this))
      .subscribe(() => this.open());

    fromEvent(window, 'click')
      .pipe(whileComponentNotDestroyed(this))
      .subscribe((e: MouseEvent) => {
        if (!this.opened || e.target === this.input || this.isInside(e.target, this.root.nativeElement) || this.options.static) {
          return;
        }

        this.close();
        this.input.blur();
      });

    fromEvent(window, 'touchend')
      .pipe(whileComponentNotDestroyed(this))
      .subscribe((e: TouchEvent) => {
        if (!this.opened || e.target === this.input || this.isInside(e.target, this.root.nativeElement) || this.options.static) {
          return;
        }

        this.close();
        this.input.blur();
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

    if (this.options.static) {
      this.open();
    }
  }

  ngOnDestroy(): void { }

  isPlatformServer() {
    return isPlatformServer(this.platformId);
  }

  get currentOptions() {
    const options = defaults(this.options, DefaultDatepickerOptions);
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
      if (node === container) {
        return true;
      } else {
        node = node.parentElement;
      }
    }

    return false;
  }

  updateValue() {
    if (this.currentOptions.date && this.calendar) {
      this.calendar.parseValue(this.input.value);
    }

    if (this.currentOptions.time && this.clock) {
      this.clock.parseValue(this.input.value);
    }
  }

  open() {
    if (!this.options.static) {
      this.opened = true;
      this.datepickerService.opened = this;
    }

    this.cd.detectChanges();
    this.updateValue();
  }

  close() {
    if (this.options.static) {
      return;
    }

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

    if (!this.currentOptions.time && !this.options.static) {
      this.close();
    }

    const event = document.createEvent('Event');

    event.initEvent('input', true, true);
    this.input.dispatchEvent(event);
    this.change.emit(value);
  }

  onTimeChange() {
    const value = this.constructValue();
    const event = document.createEvent('Event');

    this.input.value = value.format(this.currentOptions.format);

    event.initEvent('input', true, true);
    this.input.dispatchEvent(event);
    this.change.emit(value);
  }
}
