import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { DatepickerComponent } from '../components/datepicker/datepicker.component';

@Injectable({
  providedIn: 'root'
})
export class DatepickerService {

  _opened = new BehaviorSubject<DatepickerComponent>(undefined);

  constructor() { }

  get opened(): DatepickerComponent {
    return this._opened.value;
  }

  get opened$(): Observable<DatepickerComponent> {
    return this._opened.asObservable();
  }

  set opened(value: DatepickerComponent) {
    this._opened.next(value);
  }
}
