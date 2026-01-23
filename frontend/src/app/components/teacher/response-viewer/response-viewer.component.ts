import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SurveyService } from '../../../services/survey.service';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
    selector: 'app-response-viewer',
    templateUrl: './response-viewer.component.html',
    styleUrls: ['./response-viewer.component.css']
})
export class ResponseViewerComponent implements OnInit {
    survey: any;
    responses: any[] = [];

    constructor(
        private route: ActivatedRoute,
        private surveyService: SurveyService
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.surveyService.getSurvey(id).subscribe({
                next: (data) => {
                    this.survey = data;
                    this.loadResponses(id);
                },
                error: (err) => console.error(err)
            });
        }
    }

    loadResponses(surveyId: string) {
        this.surveyService.getResponses(surveyId).subscribe({
            next: (data) => this.responses = data,
            error: (err) => console.error(err)
        });
    }

    getAnswerForQuestion(response: any, questionId: string): any {
        const answer = response.answers.find((a: any) => a.questionId === questionId);
        return answer ? answer.value : '-';
    }

    exportToPdf() {
        const doc = new jsPDF();

        const title = this.survey ? `Respuestas: ${this.survey.title}` : 'Respuestas de la Encuesta';
        doc.text(title, 14, 22);

        if (!this.survey) return;

        const head = [['Fecha', ...this.survey.questions.map((q: any) => q.text)]];

        const body = this.responses.map((res: any) => {
            const row = [new Date(res.submittedAt).toLocaleDateString()];
            this.survey.questions.forEach((q: any) => {
                let answer = this.getAnswerForQuestion(res, q._id);
                if (Array.isArray(answer)) {
                    answer = answer.join(', ');
                }
                row.push(answer);
            });
            return row;
        });

        autoTable(doc, {
            head: head,
            body: body,
            startY: 30,
        });

        doc.save(`respuestas_${this.survey.title.replace(/\s+/g, '_')}.pdf`);
    }
}

