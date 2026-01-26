import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SurveyService } from '../../../services/survey.service';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

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

        // Include email column if survey is not anonymous
        const head = this.survey.isAnonymous
            ? [['Fecha', ...this.survey.questions.map((q: any) => q.text)]]
            : [['Fecha', 'Correo', ...this.survey.questions.map((q: any) => q.text)]];

        const body = this.responses.map((res: any) => {
            const row = [new Date(res.submittedAt).toLocaleDateString()];

            // Add email if survey is not anonymous
            if (!this.survey.isAnonymous) {
                row.push(res.userEmail || 'N/A');
            }

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

    exportToExcel() {
        if (!this.survey) return;

        // Prepare headers - include email if survey is not anonymous
        const headers = this.survey.isAnonymous
            ? ['Fecha', ...this.survey.questions.map((q: any) => q.text)]
            : ['Fecha', 'Correo', ...this.survey.questions.map((q: any) => q.text)];

        // Prepare data rows
        const data = this.responses.map((res: any) => {
            const row = [new Date(res.submittedAt).toLocaleDateString()];

            // Add email if survey is not anonymous
            if (!this.survey.isAnonymous) {
                row.push(res.userEmail || 'N/A');
            }

            this.survey.questions.forEach((q: any) => {
                let answer = this.getAnswerForQuestion(res, q._id);
                if (Array.isArray(answer)) {
                    answer = answer.join(', ');
                }
                row.push(answer);
            });
            return row;
        });

        // Create worksheet
        const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

        // Auto-size columns
        const colWidths = headers.map((header, i) => {
            const maxLength = Math.max(
                header.length,
                ...data.map(row => String(row[i] || '').length)
            );
            return { wch: Math.min(maxLength + 2, 50) }; // Max width of 50
        });
        ws['!cols'] = colWidths;

        // Create workbook and add worksheet
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Respuestas');

        // Generate and download file
        XLSX.writeFile(wb, `respuestas_${this.survey.title.replace(/\s+/g, '_')}.xlsx`);
    }
}

