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

    activeTab: string = 'responses';
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
            if (q.type !== 'text') {
                const stats: any = {};
                if (q.options) {
                    q.options.forEach((opt: string) => {
                        stats[opt] = 0;
                    });
                }

                this.responses.forEach((res: any) => {
                    const answer = this.getAnswerForQuestion(res, q._id);
                    if (Array.isArray(answer)) {
                        answer.forEach((val: string) => {
                            if (stats[val] !== undefined) {
                                stats[val]++;
                            } else {
                                stats[val] = (stats[val] || 0) + 1;
                            }
                        });
                    } else if (answer && answer !== '-') {
                        if (stats[answer] !== undefined) {
                            stats[answer]++;
                        } else {
                            stats[answer] = (stats[answer] || 0) + 1;
                        }
                    }
                });

                this.questionStats[q._id] = stats;

                const labels = Object.keys(stats);
                const data = Object.values(stats) as number[];

                this.chartDataMap[q._id] = {
                    labels: labels,
                    datasets: [
                        {
                            data: data,
                            label: 'Cantidad',
                            backgroundColor: [
                                'rgba(54, 162, 235, 0.6)',
                                'rgba(255, 99, 132, 0.6)',
                                'rgba(75, 192, 192, 0.6)',
                                'rgba(255, 206, 86, 0.6)',
                                'rgba(153, 102, 255, 0.6)',
                                'rgba(255, 159, 64, 0.6)'
                            ],
                            borderColor: [
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 99, 132, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)'
                            ],
                            borderWidth: 1
                        }
                    ]
                };
            }
        });
    }

    getObjectKeys(obj: any): string[] {
        return obj ? Object.keys(obj) : [];
    }

    groupResponsesByUser() {
        this.responsesByUser = {};
        if (!this.survey || this.survey.isAnonymous) return;

        this.responses.forEach((res: any) => {
            const email = res.userEmail || 'Sin email';
            if (!this.responsesByUser[email]) {
                this.responsesByUser[email] = [];
            }
            this.responsesByUser[email].push(res);
        });
    }

    getUserEmails(): string[] {
        const emails = Object.keys(this.responsesByUser).sort();
        // Expand the first user by default
        if (emails.length > 0 && this.expandedUsers.size === 0) {
            this.expandedUsers.add(emails[0]);
        }
        return emails;
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

