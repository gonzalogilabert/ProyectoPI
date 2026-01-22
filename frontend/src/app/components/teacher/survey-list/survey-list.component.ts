import { Component, OnInit } from '@angular/core';
import { SurveyService } from '../../../services/survey.service';
import { AlertService } from '../../../services/alert.service';

@Component({
    selector: 'app-survey-list',
    templateUrl: './survey-list.component.html',
    styleUrls: ['./survey-list.component.css']
})
export class SurveyListComponent implements OnInit {
    surveys: any[] = [];

    constructor(private surveyService: SurveyService, private alertService: AlertService) { }

    ngOnInit(): void {
        this.loadSurveys();
    }

    loadSurveys() {
        this.surveyService.getSurveys().subscribe({
            next: (data) => this.surveys = data,
            error: (err) => console.error(err)
        });
    }

    async deleteSurvey(id: string) {
        const confirmed = await this.alertService.confirm(
            '¿Estás seguro de que quieres eliminar esta encuesta?',
            'Confirmar eliminación'
        );
        if (confirmed) {
            this.surveyService.deleteSurvey(id).subscribe({
                next: () => this.loadSurveys(),
                error: (err) => console.error(err)
            });
        }
    }

    getSurveyUrl(id: string): string {
        return `${window.location.origin}/survey/${id}`;
    }

    copyUrl(id: string) {
        const url = this.getSurveyUrl(id);
        navigator.clipboard.writeText(url).then(() => {
            this.alertService.success('URL copiada al portapapeles', 'Copiado');
        });
    }
}
