import { Injectable } from '@angular/core';
import { SurveyService } from '../services/survey.service';
import { AlertService } from '../services/alert.service';
import { Survey } from '../models/survey.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SurveyListController {
    private surveysSubject = new BehaviorSubject<Survey[]>([]);
    surveys$ = this.surveysSubject.asObservable();

    constructor(
        private surveyService: SurveyService,
        private alertService: AlertService
    ) { }

    loadSurveys() {
        this.surveyService.getSurveys().subscribe({
            next: (data) => this.surveysSubject.next(data),
            error: (err) => {
                console.error(err);
                this.alertService.error('Error al cargar las encuestas');
            }
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
                error: (err) => {
                    console.error(err);
                    this.alertService.error('Error al eliminar la encuesta');
                }
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
