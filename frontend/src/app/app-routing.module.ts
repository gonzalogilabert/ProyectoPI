import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SurveyCreatorComponent } from './components/teacher/survey-creator/survey-creator.component';
import { SurveyListComponent } from './components/teacher/survey-list/survey-list.component';
import { ResponseViewerComponent } from './components/teacher/response-viewer/response-viewer.component';
import { SurveyTakerComponent } from './components/student/survey-taker/survey-taker.component';
import { LoginComponent } from './components/auth/login/login.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'list', component: SurveyListComponent, canActivate: [AuthGuard] },
  { path: 'create', component: SurveyCreatorComponent, canActivate: [AuthGuard] },
  { path: 'edit/:id', component: SurveyCreatorComponent, canActivate: [AuthGuard] },
  { path: 'responses/:id', component: ResponseViewerComponent, canActivate: [AuthGuard] },
  { path: 'survey/:id', component: SurveyTakerComponent }, // Public access for students
  { path: '', redirectTo: '/list', pathMatch: 'full' },
  { path: '**', redirectTo: '/list' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
