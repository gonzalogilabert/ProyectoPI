import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SurveyCreatorComponent } from './components/teacher/survey-creator/survey-creator.component';
import { SurveyListComponent } from './components/teacher/survey-list/survey-list.component';
import { ResponseViewerComponent } from './components/teacher/response-viewer/response-viewer.component';
import { SurveyTakerComponent } from './components/student/survey-taker/survey-taker.component';

@NgModule({
  declarations: [
    AppComponent,
    SurveyCreatorComponent,
    SurveyListComponent,
    ResponseViewerComponent,
    SurveyTakerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
