import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SurveyCreatorComponent } from './components/teacher/survey-creator/survey-creator.component';
import { SurveyListComponent } from './components/teacher/survey-list/survey-list.component';
import { ResponseViewerComponent } from './components/teacher/response-viewer/response-viewer.component';
import { SurveyTakerComponent } from './components/student/survey-taker/survey-taker.component';

const routes: Routes = [
  { path: '', redirectTo: '/list', pathMatch: 'full' },
  { path: 'create', component: SurveyCreatorComponent },
  { path: 'list', component: SurveyListComponent },
  { path: 'responses/:id', component: ResponseViewerComponent },
  { path: 'survey/:id', component: SurveyTakerComponent },
  { path: '**', redirectTo: '/list' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
