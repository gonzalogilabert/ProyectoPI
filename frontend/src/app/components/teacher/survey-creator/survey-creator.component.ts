import { Component, OnInit } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SurveyCreatorController } from '../../../controllers/survey-creator.controller';
import { AlertService } from '../../../services/alert.service';

@Component({
    selector: 'app-survey-creator',
    templateUrl: './survey-creator.component.html',
    styleUrls: ['./survey-creator.component.css'],
    providers: [SurveyCreatorController]
})
export class SurveyCreatorComponent implements OnInit {

    constructor(
        public vm: SurveyCreatorController,
        private route: ActivatedRoute,
        private router: Router,
        private alertService: AlertService
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        this.vm.init(id);
    }

    get surveyForm(): FormGroup {
        return this.vm.surveyForm;
    }

    get questions(): FormArray {
        return this.vm.questions;
    }

    addQuestion() {
        this.vm.addQuestion();
    }

    removeQuestion(index: number) {
        this.vm.removeQuestion(index);
    }

    duplicateQuestion(index: number) {
        this.vm.duplicateQuestion(index);
    }

    getOptions(questionIndex: number): FormArray {
        return this.vm.getOptions(questionIndex);
    }

    addOption(questionIndex: number) {
        this.vm.addOption(questionIndex);
    }

    removeOption(questionIndex: number, optionIndex: number) {
        this.vm.removeOption(questionIndex, optionIndex);
    }

    getRows(questionIndex: number): FormArray {
        return this.vm.getRows(questionIndex);
    }

    addRow(questionIndex: number) {
        this.vm.addRow(questionIndex);
    }

    removeRow(questionIndex: number, rowIndex: number) {
        this.vm.removeRow(questionIndex, rowIndex);
    }

    getColumns(questionIndex: number): FormArray {
        return this.vm.getColumns(questionIndex);
    }

    addColumn(questionIndex: number) {
        this.vm.addColumn(questionIndex);
    }

    removeColumn(questionIndex: number, colIndex: number) {
        this.vm.removeColumn(questionIndex, colIndex);
    }

    onTypeChange(index: number) {
        this.vm.onTypeChange(index);
    }

    onSubmit() {
        this.vm.submit().subscribe({
            next: (res) => {
                this.alertService.success(this.vm.isEditMode ? 'Encuesta actualizada con éxito' : 'Encuesta creada con éxito');
                this.router.navigate(['/list']);
            },
            error: (err) => {
                console.error(err);
                if (err.message !== 'Form invalid') {
                    this.alertService.error(this.vm.isEditMode ? 'Hubo un error al actualizar la encuesta' : 'Hubo un error al crear la encuesta');
                }
            }
        });
    }
}
