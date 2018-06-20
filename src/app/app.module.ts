import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { NgGxDatepickerModule } from '../../projects/ng-gxdatepicker/src/lib/ng-gxdatepicker.module';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgGxDatepickerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
