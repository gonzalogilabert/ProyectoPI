import { Injectable } from '@angular/core';
import { SurveyService } from '../services/survey.service';
import { AlertService } from '../services/alert.service';
import { Survey } from '../models/survey.model';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class SurveyListController {
    private surveysSubject = new BehaviorSubject<Survey[]>([]);
    private searchTermSubject = new BehaviorSubject<string>('');

    surveys$: Observable<Survey[]> = combineLatest([
        this.surveysSubject.asObservable(),
        this.searchTermSubject.asObservable()
    ]).pipe(
        map(([surveys, searchTerm]) => {
            if (!searchTerm.trim()) {
                return surveys;
            }
            const term = searchTerm.toLowerCase();
            return surveys.filter(survey =>
                survey.title.toLowerCase().includes(term) ||
                (survey.description && survey.description.toLowerCase().includes(term))
            );
        })
    );

    constructor(
        private surveyService: SurveyService,
        private alertService: AlertService
    ) { }

    loadSurveys() {
        this.surveyService.getSurveys().subscribe({
            next: (data) => {
                this.surveysSubject.next(data);
            },
            error: (err) => {
                console.error(err);
                this.alertService.error('Error al cargar las encuestas: ' + (err.message || 'Desconocido'));
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

    setSearchTerm(term: string) {
        this.searchTermSubject.next(term);
    }
}
