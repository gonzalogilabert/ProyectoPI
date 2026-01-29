import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { SurveyService } from '../../../services/survey.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../../../services/alert.service';

@Component({
    selector: 'app-survey-creator',
    templateUrl: './survey-creator.component.html',
    styleUrls: ['./survey-creator.component.css']
})
export class SurveyCreatorComponent implements OnInit {
    surveyForm: FormGroup;
    isEditMode = false;
    surveyId: string | null = null;

    constructor(
        private fb: FormBuilder,
        private surveyService: SurveyService,
        private router: Router,
        private route: ActivatedRoute,
        private alertService: AlertService
    ) {
        this.surveyForm = this.fb.group({
            title: ['', [Validators.required, Validators.maxLength(50)]],
            description: ['', Validators.maxLength(250)],
            timeLimit: [0], // 0 means no limit
            isAnonymous: [true],
            questions: this.fb.array([])
        });
    }

    ngOnInit(): void {
        this.surveyId = this.route.snapshot.paramMap.get('id');
        if (this.surveyId) {
            this.isEditMode = true;
            this.loadSurvey(this.surveyId);
        } else {
            this.addQuestion();
        }
    }

    loadSurvey(id: string) {
        this.surveyService.getSurvey(id).subscribe({
            next: (data) => {
                this.surveyForm.patchValue({
                    title: data.title,
                    description: data.description,
                    timeLimit: data.timeLimit,
                    isAnonymous: data.isAnonymous
                });

                // Clear default question if any
                while (this.questions.length !== 0) {
                    this.questions.removeAt(0);
                }

                // Add questions from data
                data.questions.forEach((q: any) => {
                    this.questions.push(this.createQuestion(q));
                });
            },
            error: (err) => {
                console.error(err);
                this.alertService.error('No se pudo cargar la encuesta para editar');
                this.router.navigate(['/list']);
            }
        });
    }

    get questions(): FormArray {
        return this.surveyForm.get('questions') as FormArray;
    }

    createQuestion(initialData: any = null): FormGroup {
        const questionGroup = this.fb.group({
            text: [initialData?.text || '', Validators.required],
            description: [initialData?.description || ''],
            type: [initialData?.type || 'short', Validators.required],
            required: [initialData?.required || false],
            options: this.fb.array([]),
            rows: this.fb.array([]),
            columns: this.fb.array([])
        });

        // Initialize Options
        if (initialData?.options) {
            initialData.options.forEach((opt: string) => {
                (questionGroup.get('options') as FormArray).push(this.fb.control(opt, Validators.required));
            });
        }

        // Initialize Rows (for grids)
        if (initialData?.rows) {
            initialData.rows.forEach((row: string) => {
                (questionGroup.get('rows') as FormArray).push(this.fb.control(row, Validators.required));
            });
        }

        // Initialize Columns (for grids)
        if (initialData?.columns) {
            initialData.columns.forEach((col: string) => {
                (questionGroup.get('columns') as FormArray).push(this.fb.control(col, Validators.required));
            });
        }

        return questionGroup;
    }

    addQuestion() {
        this.questions.push(this.createQuestion());
    }

    removeQuestion(index: number) {
        this.questions.removeAt(index);
    }

    duplicateQuestion(index: number) {
        const question = this.questions.at(index).value;
        this.questions.insert(index + 1, this.createQuestion(question));
    }

    moveQuestion(index: number, direction: 'up' | 'down') {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= this.questions.length) return;

        const control = this.questions.at(index);
        this.questions.removeAt(index);
        this.questions.insert(newIndex, control);
    }

    getOptions(questionIndex: number): FormArray {
        return this.questions.at(questionIndex).get('options') as FormArray;
    }

    addOption(questionIndex: number) {
        this.getOptions(questionIndex).push(this.fb.control('', Validators.required));
    }

    removeOption(questionIndex: number, optionIndex: number) {
        this.getOptions(questionIndex).removeAt(optionIndex);
    }

    // Grid Management
    getRows(questionIndex: number): FormArray {
        return this.questions.at(questionIndex).get('rows') as FormArray;
    }

    addRow(questionIndex: number) {
        this.getRows(questionIndex).push(this.fb.control('', Validators.required));
    }

    removeRow(questionIndex: number, rowIndex: number) {
        this.getRows(questionIndex).removeAt(rowIndex);
    }

    getColumns(questionIndex: number): FormArray {
        return this.questions.at(questionIndex).get('columns') as FormArray;
    }

    addColumn(questionIndex: number) {
        this.getColumns(questionIndex).push(this.fb.control('', Validators.required));
    }

    removeColumn(questionIndex: number, colIndex: number) {
        this.getColumns(questionIndex).removeAt(colIndex);
    }

    onTypeChange(index: number) {
        const question = this.questions.at(index);
        const options = question.get('options') as FormArray;
        const rows = question.get('rows') as FormArray;
        const columns = question.get('columns') as FormArray;
        const type = question.get('type')?.value;

        // Limpiar todas si es necesario, pero mejor ser específico
        const needsOptions = ['test', 'multi', 'dropdown', 'scale'];
        const needsGrid = ['grid_radio', 'grid_check'];

        // Reset arrays based on new type
        if (!needsOptions.includes(type)) {
            while (options.length !== 0) options.removeAt(0);
        } else if (options.length === 0) {
            options.push(this.fb.control(type === 'scale' ? 'Etiqueta Min' : '', Validators.required));
            if (type === 'scale') {
                options.push(this.fb.control('Etiqueta Max', Validators.required));
            }
        }

        if (!needsGrid.includes(type)) {
            while (rows.length !== 0) rows.removeAt(0);
            while (columns.length !== 0) columns.removeAt(0);
        } else {
            if (rows.length === 0) rows.push(this.fb.control('', Validators.required));
            if (columns.length === 0) columns.push(this.fb.control('', Validators.required));
        }
    }

    onSubmit() {
        if (this.surveyForm.valid) {
            const surveyData = this.surveyForm.value;

            if (this.isEditMode && this.surveyId) {
                this.surveyService.updateSurvey(this.surveyId, surveyData).subscribe({
                    next: (res) => {
                        this.alertService.success('Encuesta actualizada con éxito');
                        this.router.navigate(['/list']);
                    },
                    error: (err) => {
                        console.error(err);
                        this.alertService.error('Hubo un error al actualizar la encuesta');
                    }
                });
            } else {
                this.surveyService.createSurvey(surveyData).subscribe({
                    next: (res) => {
                        this.alertService.success('Encuesta creada con éxito');
                        this.router.navigate(['/list']);
                    },
                    error: (err) => {
                        console.error(err);
                        this.alertService.error('Hubo un error al crear la encuesta');
                    }
                });
            }
        } else {
            this.alertService.error('Por favor, rellena todos los campos obligatorios.');
        }
    }
}
