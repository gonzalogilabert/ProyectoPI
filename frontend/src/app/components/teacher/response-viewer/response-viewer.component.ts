import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SurveyService } from '../../../services/survey.service';
import { ChartConfiguration, ChartData } from 'chart.js';

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

    activeTab: string = 'byUser';
    questionStats: any = {};
    responsesByUser: { [email: string]: any[] } = {};
    expandedUsers: Set<string> = new Set();
    chartDataMap: { [key: string]: ChartData<'bar'> } = {};

    public barChartOptions: ChartConfiguration['options'] = {
        responsive: true,
        scales: {
            x: {},
            y: {
                min: 0,
                ticks: {
                    stepSize: 1
                }
            }
        },
        plugins: {
            legend: {
                display: false,
            }
        }
    };

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
            next: (data) => {
                this.responses = data;
                this.calculateStats();
                this.groupResponsesByUser();
            },
            error: (err) => console.error(err)
        });
    }

    calculateStats() {
        this.questionStats = {};
        this.chartDataMap = {};
        if (!this.survey || !this.responses) return;

        this.survey.questions.forEach((q: any) => {
            // Solo calculamos estadísticas para tipos que no sean texto libre, fecha o hora
            // Fecha y hora es mejor verlas en la tabla individual
            const chartTypes = ['test', 'multi', 'scale', 'dropdown', 'rating'];

            if (chartTypes.includes(q.type)) {
                const stats = new Map<string, number>();

                // 1. Inicializar las opciones esperadas
                if (q.type === 'scale') {
                    ['1', '2', '3', '4', '5'].forEach(v => stats.set(v, 0));
                } else if (q.options && q.options.length > 0) {
                    q.options.forEach((opt: string) => {
                        if (opt) stats.set(opt.toString().trim(), 0);
                    });
                }

                // 2. Procesar respuestas
                this.responses.forEach((res: any) => {
                    const val = this.getAnswerForQuestion(res, q._id);

                    if (Array.isArray(val)) {
                        val.forEach((item: any) => {
                            if (item !== undefined && item !== null) {
                                const normalized = item.toString().trim();
                                if (normalized && normalized !== '-') {
                                    stats.set(normalized, (stats.get(normalized) || 0) + 1);
                                }
                            }
                        });
                    } else if (val !== undefined && val !== null && val !== '-') {
                        const normalized = val.toString().trim();
                        if (normalized) {
                            stats.set(normalized, (stats.get(normalized) || 0) + 1);
                        }
                    }
                });

                // 3. Generar Chart
                const labels = Array.from(stats.keys());
                const data = Array.from(stats.values());

                this.questionStats[q._id] = Object.fromEntries(stats);

                const backgroundColors = labels.map((_, i) => [
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)',
                    'rgba(201, 203, 207, 0.7)'
                ][i % 7]);

                this.chartDataMap[q._id] = {
                    labels: labels,
                    datasets: [
                        {
                            data: data,
                            label: 'Votos',
                            backgroundColor: backgroundColors,
                            borderColor: backgroundColors.map(c => c.replace('0.7', '1')),
                            borderWidth: 1
                        }
                    ]
                };
            }
        });
    }

    isChartable(type: string): boolean {
        return ['test', 'multi', 'scale', 'dropdown', 'rating'].includes(type);
    }

    getObjectKeys(obj: any): string[] {
        return obj ? Object.keys(obj) : [];
    }

    groupResponsesByUser() {
        this.responsesByUser = {};
        if (!this.survey) return;

        this.responses.forEach((res: any, index: number) => {
            const email = (this.survey.isAnonymous || !res.userEmail)
                ? `Respuesta #${index + 1}`
                : res.userEmail;

            if (!this.responsesByUser[email]) {
                this.responsesByUser[email] = [];
            }
            this.responsesByUser[email].push(res);
        });

        // Expand the first user by default if emails exist
        const emails = Object.keys(this.responsesByUser).sort();
        if (emails.length > 0 && this.expandedUsers.size === 0) {
            this.expandedUsers.add(emails[0]);
        }
    }

    getUserEmails(): string[] {
        return Object.keys(this.responsesByUser).sort();
    }

    toggleUserExpansion(email: string) {
        if (this.expandedUsers.has(email)) {
            this.expandedUsers.delete(email);
        } else {
            this.expandedUsers.add(email);
        }
    }

    isUserExpanded(email: string): boolean {
        return this.expandedUsers.has(email);
    }

    getAnswerForQuestion(response: any, questionId: string): any {
        const answer = response.answers.find((a: any) => a.questionId === questionId);
        return answer ? answer.value : '-';
    }

    formatAnswer(val: any): string {
        if (val === undefined || val === null || val === '-') return '-';
        if (Array.isArray(val)) return val.join(', ');
        if (typeof val === 'object') {
            return Object.entries(val)
                .map(([row, col]) => `${row}: ${Array.isArray(col) ? col.join(', ') : col}`)
                .join(' | ');
        }
        return val.toString();
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
                const answer = this.getAnswerForQuestion(res, q._id);
                row.push(this.formatAnswer(answer));
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
                const answer = this.getAnswerForQuestion(res, q._id);
                row.push(this.formatAnswer(answer));
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

