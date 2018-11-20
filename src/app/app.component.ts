import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'app';

  dateRanges = [{fromDate: "2018-11-12T00:00:00", toDate: "2018-11-16T00:00:00", enable: true},{fromDate: "2018-11-19T00:00:00", toDate: "2018-11-21T00:00:00", enable: false},{fromDate: "2018-12-10T00:00:00", toDate: "2018-12-12T00:00:00", enable: false}];

  onChanged() {
    console.log('onChanged');
  }
}
