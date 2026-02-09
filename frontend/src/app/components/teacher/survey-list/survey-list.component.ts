import { Component, OnInit } from '@angular/core';
import { SurveyListController } from '../../../controllers/survey-list.controller';

@Component({
    selector: 'app-survey-list',
    templateUrl: './survey-list.component.html',
    styleUrls: ['./survey-list.component.css'],
    providers: [SurveyListController]
})
export class SurveyListComponent implements OnInit {

    constructor(public vm: SurveyListController) { }

    ngOnInit(): void {
        this.vm.loadSurveys();
    }

    deleteSurvey(id: string) {
        this.vm.deleteSurvey(id);
    }

    copyUrl(id: string) {
        this.vm.copyUrl(id);
    }
}
