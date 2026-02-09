import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { SurveyService } from '../services/survey.service';
import { AlertService } from '../services/alert.service';
import { Router } from '@angular/router';
import { Survey } from '../models/survey.model';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SurveyCreatorController {
    surveyForm: FormGroup;
    isEditMode = false;
    surveyId: string | null = null;

    constructor(
        private fb: FormBuilder,
        private surveyService: SurveyService,
        private alertService: AlertService,
        private router: Router
    ) {
        this.surveyForm = this.fb.group({
            title: ['', [Validators.required, Validators.maxLength(50)]],
            description: ['', Validators.maxLength(250)],
            timeLimit: [0],
            isAnonymous: [true],
            questions: this.fb.array([])
        });
    }

    get questions(): FormArray {
        return this.surveyForm.get('questions') as FormArray;
    }

    init(surveyId: string | null) {
        this.surveyId = surveyId;
        if (this.surveyId) {
            this.isEditMode = true;
            this.loadSurvey(this.surveyId);
        } else {
            this.addQuestion();
        }
    }

    loadSurvey(id: string) {
        this.surveyService.getSurvey(id).subscribe({
            next: (data: Survey) => {
                this.surveyForm.patchValue({
                    title: data.title,
                    description: data.description,
                    timeLimit: data.timeLimit,
                    isAnonymous: data.isAnonymous
                });

                while (this.questions.length !== 0) {
                    this.questions.removeAt(0);
                }

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

        if (initialData?.options) {
            initialData.options.forEach((opt: string) => {
                (questionGroup.get('options') as FormArray).push(this.fb.control(opt, Validators.required));
            });
        }

        if (initialData?.rows) {
            initialData.rows.forEach((row: string) => {
                (questionGroup.get('rows') as FormArray).push(this.fb.control(row, Validators.required));
            });
        }

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

    getOptions(questionIndex: number): FormArray {
        return this.questions.at(questionIndex).get('options') as FormArray;
    }

    addOption(questionIndex: number) {
        this.getOptions(questionIndex).push(this.fb.control('', Validators.required));
    }

    removeOption(questionIndex: number, optionIndex: number) {
        this.getOptions(questionIndex).removeAt(optionIndex);
    }

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

        const needsOptions = ['test', 'multi', 'dropdown', 'scale'];
        const needsGrid = ['grid_radio', 'grid_check'];

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

    submit(): Observable<any> {
        if (this.surveyForm.valid) {
            const surveyData = this.surveyForm.value as Survey;

            if (this.isEditMode && this.surveyId) {
                return this.surveyService.updateSurvey(this.surveyId, surveyData);
            } else {
                return this.surveyService.createSurvey(surveyData);
            }
        } else {
            this.alertService.error('Por favor, rellena todos los campos obligatorios.');
            throw new Error('Form invalid');
        }
    }
}
