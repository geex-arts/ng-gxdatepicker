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

export interface DatepickerOptions {
  theme?: string;
  format?: string;
}

export const DefaultDatepickerOptions: DatepickerOptions = {
  theme: 'default',
  format: 'DD.MM.YYYY HH:mm:ss'
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

    // fromEvent(this.input, 'blur')
    //   .pipe(whileComponentNotDestroyed(this))
    //   .subscribe(() => this.close());

    fromEvent(document, 'click')
      .pipe(whileComponentNotDestroyed(this))
      .subscribe((e: MouseEvent) => {
        if (!this.opened || e.target == this.input || this.isInside(e.target, this.root.nativeElement)) {
          return;
        }

        this.close();
      });

    // fromEvent(this.input, 'change')
    //   .pipe(whileComponentNotDestroyed(this))
    //   .subscribe(() => this.calendar.parseValue(this.input.value));

    fromEvent(this.input, 'key')
      .pipe(whileComponentNotDestroyed(this))
      .subscribe(() => this.calendar.parseValue(this.input.value));

    this.datepickerService.opened$
      .pipe(
        filter(opened => opened !== this),
        whileComponentNotDestroyed(this)
      )
      .subscribe(() => this.close());
  }

  ngOnDestroy(): void { }

  get currentOptions() {
    return _.defaults(this.options, DefaultDatepickerOptions);
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

  open() {
    this.opened = true;
    this.cd.detectChanges();
    this.datepickerService.opened = this;
  }

  close() {
    this.opened = false;
    this.cd.detectChanges();

    if (this.datepickerService.opened === this) {
      this.datepickerService.opened = undefined;
    }
  }

  onDateChange(value) {
    if (!value) {
      return;
    }

    this.input.value = value.format(this.currentOptions.format);
    this.close();
    this.input.dispatchEvent(new Event('change'));
    this.change.emit(value);
  }

  onTimeChange(value) {
    if (!value) {
      return;
    }

    this.input.value = value.format(this.currentOptions.format);
    // this.close();
    this.input.dispatchEvent(new Event('change'));
    this.change.emit(value);
  }
}
