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
    chartDataMap: { [key: string]: ChartData } = {};

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

    getQuestionTypeLabel(type: string): string {
        const typeLabels: { [key: string]: string } = {
            'short': 'Respuesta corta',
            'paragraph': 'Párrafo',
            'test': 'Varias opciones (Radio)',
            'multi': 'Casillas (Checkboxes)',
            'dropdown': 'Desplegable',
            'file': 'Subir archivos',
            'scale': 'Escala lineal (1-5)',
            'rating': 'Calificación (Estrellas)',
            'grid_radio': 'Cuadrícula de varias opciones',
            'grid_check': 'Cuadrícula de casillas',
            'date': 'Fecha',
            'time': 'Hora'
        };
        return typeLabels[type] || type;
    }

    exportToPdf() {
        if (!this.survey) return;

        // Use landscape orientation if there are many questions
        const orientation = this.survey.questions.length > 3 ? 'landscape' : 'portrait';
        const doc = new jsPDF({
            orientation: orientation as any,
            unit: 'mm',
            format: 'a4'
        });

        // Define color scheme
        const primaryColor = '#2c3e50';
        const headerColor = '#5dade2'; // Lighter blue for table headers
        const lightGray = '#ecf0f1';
        const darkGray = '#7f8c8d';

        const pageWidth = doc.internal.pageSize.getWidth();

        // Add header background
        doc.setFillColor(18, 150, 214); // Primary light blue from app
        doc.rect(0, 0, pageWidth, 45, 'F');

        // Add title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('Sistema de Encuestas', pageWidth / 2, 20, { align: 'center' });

        // Add survey title
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text(this.survey.title, pageWidth / 2, 30, { align: 'center' });

        // Add metadata
        doc.setFontSize(9);
        doc.setTextColor(200, 200, 200);
        const currentDate = new Date().toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        doc.text(`Generado el: ${currentDate}`, pageWidth / 2, 38, { align: 'center' });

        // Reset text color for body
        doc.setTextColor(0, 0, 0);

        // Add summary statistics box
        const statsY = 52;
        const boxWidth = pageWidth - 28;
        doc.setFillColor(236, 240, 241); // lightGray
        doc.roundedRect(14, statsY, boxWidth, 20, 3, 3, 'F');

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(44, 62, 80);
        doc.text('Resumen:', 20, statsY + 7);

        doc.setFont('helvetica', 'normal');
        doc.text(`Total de respuestas: ${this.responses.length}`, 20, statsY + 14);
        doc.text(`Tipo: ${this.survey.isAnonymous ? 'Anónima' : 'Identificada'}`, pageWidth / 3, statsY + 14);
        doc.text(`Preguntas: ${this.survey.questions.length}`, (pageWidth / 3) * 2, statsY + 14);

        // Prepare table headers
        const head = this.survey.isAnonymous
            ? [['Fecha', ...this.survey.questions.map((q: any) => q.text)]]
            : [['Fecha', 'Correo', ...this.survey.questions.map((q: any) => q.text)]];

        // Prepare table body
        const body = this.responses.map((res: any) => {
            const row = [new Date(res.submittedAt).toLocaleDateString('es-ES')];

            if (!this.survey.isAnonymous) {
                row.push(res.userEmail || 'N/A');
            }

            this.survey.questions.forEach((q: any) => {
                const answer = this.getAnswerForQuestion(res, q._id);
                row.push(this.formatAnswer(answer));
            });
            return row;
        });

        // Calculate available width for question columns
        const totalColumns = head[0].length;
        const dateWidth = 22;
        const emailWidth = this.survey.isAnonymous ? 0 : 40;
        const availableWidth = pageWidth - 28 - dateWidth - emailWidth;
        const questionColumnWidth = availableWidth / (totalColumns - (this.survey.isAnonymous ? 1 : 2));

        // Build column styles dynamically
        const columnStyles: any = {
            0: { cellWidth: dateWidth, halign: 'center', fontSize: 7 }
        };

        if (!this.survey.isAnonymous) {
            columnStyles[1] = { cellWidth: emailWidth, fontSize: 7 };
        }

        // Set width for question columns
        const startCol = this.survey.isAnonymous ? 1 : 2;
        for (let i = startCol; i < totalColumns; i++) {
            columnStyles[i] = { cellWidth: questionColumnWidth, fontSize: 7 };
        }

        // Add table with enhanced styling
        autoTable(doc, {
            head: head,
            body: body,
            startY: statsY + 25,
            theme: 'striped',
            headStyles: {
                fillColor: [93, 173, 226], // headerColor - lighter blue
                textColor: [255, 255, 255],
                fontSize: 8,
                fontStyle: 'bold',
                halign: 'center',
                cellPadding: 3
            },
            bodyStyles: {
                fontSize: 7,
                cellPadding: 2,
                textColor: [44, 62, 80]
            },
            alternateRowStyles: {
                fillColor: [245, 247, 250]
            },
            columnStyles: columnStyles,
            styles: {
                overflow: 'linebreak',
                cellWidth: 'wrap',
                lineColor: [189, 195, 199],
                lineWidth: 0.1
            },
            margin: { top: 10, left: 14, right: 14 },
            didDrawPage: (data) => {
                // Add footer with page numbers
                const pageCount = (doc as any).internal.getNumberOfPages();
                const pageNumber = (doc as any).internal.getCurrentPageInfo().pageNumber;

                doc.setFontSize(8);
                doc.setTextColor(127, 140, 141); // darkGray
                doc.text(
                    `Página ${pageNumber} de ${pageCount}`,
                    pageWidth / 2,
                    doc.internal.pageSize.height - 10,
                    { align: 'center' }
                );

                // Add footer line
                doc.setDrawColor(189, 195, 199);
                doc.setLineWidth(0.5);
                doc.line(14, doc.internal.pageSize.height - 15, pageWidth - 14, doc.internal.pageSize.height - 15);
            }
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
            const row = [new Date(res.submittedAt).toLocaleDateString('es-ES')];

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

