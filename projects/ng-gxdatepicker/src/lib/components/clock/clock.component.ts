import {
  ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, QueryList, ViewChildren
} from '@angular/core';
import moment from 'moment';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ScrollableDirective } from 'ng-gxscrollable';

import { TimeDisplay, TimeOption, TimeOptionItem } from '../../models/time-display';
import { DatepickerOptions } from '../datepicker/datepicker.component';
import { getOffset } from '../../utils/document-utils/document-utils';
import {
ComponentDestroyObserver,
whileComponentNotDestroyed
} from '../../decorators/component-destroy-observer/component-destroy-observer';

@Component({
  selector: 'gxd-clock',
  templateUrl: './clock.component.html',
  styleUrls: ['./clock.component.scss']
})
@ComponentDestroyObserver
export class ClockComponent implements OnInit, OnDestroy {

  @Input() options: DatepickerOptions = {};
  @Output() change = new EventEmitter<moment.Moment>();
  @ViewChildren(ScrollableDirective) scrollable = new QueryList<ScrollableDirective>();
  @ViewChildren('scrollable_inner') scrollableInner = new QueryList<ElementRef>();

  value: moment.Moment;
  timeDisplay = new TimeDisplay(moment().set({ minute: 0, second: 0, millisecond: 0 }));
  updateSelection = new Subject<number>();

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.updateSelection
      .pipe(
        debounceTime(160),
        whileComponentNotDestroyed(this)
      )
      .subscribe(i => this.onUpdateSelection(i));
  }

  ngOnDestroy(): void { }

  public getValue() {
    return this.value;
  }

  select(value: moment.Moment, scroll = false) {
    this.value = value;
    this.timeDisplay.date = this.value;
    this.cd.detectChanges();

    if (scroll) {
      this.scrollToSelected();
    }

    this.change.emit(this.value);
  }

  parseValue(value: string) {
    const result = moment(value, this.options.format);

    this.value = result.isValid() ? result : undefined;

    if (this.value) {
      this.timeDisplay.date = this.value;
    }

    this.cd.detectChanges();
    this.scrollToSelected();
  }

  trackByFn(_: any, item: TimeOption) {
    return item.title;
  }

  scrollToSelected() {
    this.timeDisplay.options.forEach((option, i) => {
      const index = option.items.findIndex(item => item.selected);

      if (index == -1) {
        return;
      }

      const scrollable: ScrollableDirective = this.scrollable.toArray()[i];
      const viewportEl: HTMLElement = scrollable['el'].nativeElement;
      const container: HTMLElement = this.scrollableInner.toArray()[i].nativeElement;
      const itemEl: HTMLElement = <HTMLElement>container.children[index];

      container.style.paddingTop = `${(viewportEl.offsetHeight - itemEl.offsetHeight) / 2}px`;
      container.style.paddingBottom = `${(viewportEl.offsetHeight - itemEl.offsetHeight) / 2}px`;

      const parentOffset = getOffset(container, viewportEl);
      const itemOffset = getOffset(itemEl, viewportEl);
      const itemTop = itemOffset.top - parentOffset.top;

      const position = itemTop + itemEl.offsetHeight / 2 - viewportEl.offsetHeight / 2;

      scrollable.scrollTo(position);
    });
  }

  selectedItem(i) {
    return this.timeDisplay.options[i].items.find(item => item.selected);
  }

  searchValue(i, e) {
    const value = e.target.value;
    const item = this.timeDisplay.options[i].items.find(item => item.str == value);

    if (item && !item.selected) {
      this.select(item.date, true);
    }

    return item != undefined;
  }

  checkSearchValue(i, e) {
    if (!this.searchValue(i, e)) {
      const selected = this.selectedItem(i);

      if (selected) {
        e.target.value = selected.str;
      }
    }
  }

  onUpdateSelection(i) {
    const scrollable: ScrollableDirective = this.scrollable.toArray()[i];
    const viewportEl: HTMLElement = scrollable['el'].nativeElement;
    const container: HTMLElement = this.scrollableInner.toArray()[i].nativeElement;
    const center = viewportEl.scrollTop + viewportEl.offsetHeight / 2;
    const children = Array.prototype.slice.call(container.children);

    const index = children.findIndex(item => {
      const parentOffset = getOffset(container, viewportEl);
      const itemOffset = getOffset(item, viewportEl);
      const itemTop = itemOffset.top - parentOffset.top;

      return itemTop <= center && itemTop + item.offsetHeight >= center;
    });

    const items = this.timeDisplay.options[i].items;
    const oldIndex = items.findIndex(item => item.selected);

    if (oldIndex == index) {
      return;
    }

    this.select(items[index].date, true);
  }
}
