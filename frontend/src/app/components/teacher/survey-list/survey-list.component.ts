import { Component, OnInit } from '@angular/core';
import { SurveyService } from '../../../services/survey.service';

@Component({
    selector: 'app-survey-list',
    templateUrl: './survey-list.component.html',
    styleUrls: ['./survey-list.component.css']
})
export class SurveyListComponent implements OnInit {
    surveys: any[] = [];

    constructor(private surveyService: SurveyService) { }

    ngOnInit(): void {
        this.loadSurveys();
    }

    loadSurveys() {
        this.surveyService.getSurveys().subscribe({
            next: (data) => this.surveys = data,
            error: (err) => console.error(err)
        });
    }

    deleteSurvey(id: string) {
        if (confirm('¿Estás seguro de que quieres eliminar esta encuesta?')) {
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
            alert('URL copiada al portapapeles');
        });
    }
}
