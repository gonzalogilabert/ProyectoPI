import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SurveyService } from '../../../services/survey.service';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { AlertService } from '../../../services/alert.service';

@Component({
    selector: 'app-survey-taker',
    templateUrl: './survey-taker.component.html',
    styleUrls: ['./survey-taker.component.css']
})
export class SurveyTakerComponent implements OnInit, OnDestroy {
    survey: any;
    responseForm: FormGroup;
    currentPage = 0;
    questionsPerPage = 100; // Mostrar todas las preguntas para evitar confusión
    timeLeft: number = 0;
    timerSubscription?: Subscription;
    userEmail: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private surveyService: SurveyService,
        private fb: FormBuilder,
        private alertService: AlertService
    ) {
        this.responseForm = this.fb.group({
            answers: this.fb.array([])
        });
    }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.surveyService.getSurvey(id).subscribe({
                next: (data) => {
                    this.survey = data;
                    this.initForm();
                    if (!this.survey.isAnonymous) {
                        this.handleIdentification();
                    }
                    if (this.survey.timeLimit > 0) {
                        this.startTimer(this.survey.timeLimit * 60);
                    }
                },
                error: (err) => {
                    console.error(err);
                    this.alertService.error('No se pudo cargar la encuesta');
                    this.router.navigate(['/']);
                }
            });
        }
    }

    initForm() {
        const answers = this.responseForm.get('answers') as FormArray;
        this.survey.questions.forEach((q: any) => {
            let initialValue: any = '';
            let validators = q.required ? [Validators.required] : [];

            if (q.type === 'multi') {
                initialValue = [];
                if (q.required) validators = [Validators.required, Validators.minLength(1)];
            } else if (q.type === 'grid_radio' || q.type === 'grid_check') {
                initialValue = {}; // Row-based object
                // Grid validation is complex for native Validators, we'll handle visually or with custom logic if needed
            }

            answers.push(this.fb.group({
                questionId: [q._id],
                value: [initialValue, validators]
            }));
        });
    }

    get answers() {
        return this.responseForm.get('answers') as FormArray;
    }

    isFieldInvalid(index: number): boolean {
        const control = this.answers.at(index).get('value');
        return !!(control && control.invalid && (control.dirty || control.touched));
    }

    get questionsForCurrentPage() {
        const start = this.currentPage * this.questionsPerPage;
        return this.survey.questions.slice(start, start + this.questionsPerPage);
    }

    get totalPages() {
        return Math.ceil(this.survey.questions.length / this.questionsPerPage);
    }

    nextPage() {
        const currentBatchStart = this.currentPage * this.questionsPerPage;
        let batchIsValid = true;

        // Check validation for current page before proceeding
        for (let i = 0; i < this.questionsForCurrentPage.length; i++) {
            const index = currentBatchStart + i;
            const control = this.answers.at(index).get('value');
            if (control?.invalid) {
                control.markAsTouched();
                batchIsValid = false;
            }
        }

        if (batchIsValid && this.currentPage < this.totalPages - 1) {
            this.currentPage++;
        } else if (!batchIsValid) {
            this.alertService.error('Por favor, responde a las preguntas obligatorias antes de continuar.', 'Validación');
        }
    }

    prevPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
        }
    }

    onGridChange(qIndex: number, row: string, col: string, isCheck: boolean, event: any) {
        const control = this.answers.at(qIndex).get('value');
        const currentVal = { ...(control?.value || {}) };

        if (!isCheck) {
            // Radio: simply set the column for this row
            currentVal[row] = col;
        } else {
            // Checkbox: manage array for this row
            const rowArr = [...(currentVal[row] || [])];
            if (event.target.checked) {
                if (!rowArr.includes(col)) rowArr.push(col);
            } else {
                const idx = rowArr.indexOf(col);
                if (idx > -1) rowArr.splice(idx, 1);
            }
            currentVal[row] = rowArr;
        }

        control?.setValue(currentVal);
        control?.markAsDirty();
        control?.markAsTouched();
    }

    isGridChecked(qIndex: number, row: string, col: string, isCheck: boolean): boolean {
        const val = this.answers.at(qIndex).get('value')?.value;
        if (!val || !val[row]) return false;

        if (!isCheck) {
            return val[row] === col;
        } else {
            return val[row].includes(col);
        }
    }

    onMultiChange(event: any, index: number, option: string) {
        const control = this.answers.at(index).get('value');
        const valueArray = [...(control?.value || [])];

        if (event.target.checked) {
            if (!valueArray.includes(option)) valueArray.push(option);
        } else {
            const idx = valueArray.indexOf(option);
            if (idx > -1) valueArray.splice(idx, 1);
        }

        control?.setValue(valueArray.length > 0 ? valueArray : null);
        control?.markAsDirty();
        control?.markAsTouched();
    }

    onFileSelected(event: any, index: number) {
        const file = event.target.files?.[0];
        if (file) {
            this.answers.at(index).get('value')?.setValue(file.name);
        }
    }

    startTimer(seconds: number) {
        this.timeLeft = seconds;
        this.timerSubscription = interval(1000).subscribe(() => {
            if (this.timeLeft > 0) {
                this.timeLeft--;
            } else {
                this.forceSubmit(); // Auto submit when time is up
            }
        });
    }

    formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    async handleIdentification() {
        const email = await this.alertService.promptEmail('Esta encuesta requiere identificación institucional para participar.');
        if (email) {
            this.userEmail = email;
        } else {
            this.router.navigate(['/']); // Go back if they cancel (though allowOutsideClick is false)
        }
    }

    forceSubmit() {
        // Submit regardless of validation when time is up
        const payload = {
            surveyId: this.survey._id,
            userEmail: this.userEmail,
            answers: this.responseForm.value.answers
        };
        this.surveyService.submitResponse(payload).subscribe({
            next: () => {
                this.alertService.success('El tiempo se ha agotado. Tu encuesta ha sido enviada.', 'Tiempo Agotado');
                this.router.navigate(['/']);
            },
            error: (err) => console.error(err)
        });
    }

    onSubmit() {
        // Mark all as touched to show validation errors
        this.answers.controls.forEach(control => {
            control.get('value')?.markAsTouched();
        });

        if (this.responseForm.valid) {
            // Check identity if required
            if (!this.survey.isAnonymous && !this.userEmail) {
                this.alertService.error('Debes identificarte antes de enviar.');
                this.handleIdentification();
                return;
            }

            const payload = {
                surveyId: this.survey._id,
                userEmail: this.userEmail,
                answers: this.responseForm.value.answers
            };
            this.surveyService.submitResponse(payload).subscribe({
                next: () => {
                    this.alertService.success('Encuesta enviada correctamente. ¡Gracias!', 'Éxito');
                    this.router.navigate(['/']);
                },
                error: (err) => console.error(err)
            });
        } else {
            this.alertService.error('Por favor, responde a todas las preguntas obligatorias.', 'Validación');
        }
    }

    ngOnDestroy(): void {
        if (this.timerSubscription) {
            this.timerSubscription.unsubscribe();
        }
    }

    trackByQuestion(index: number, q: any): any {
        return q._id || index;
    }

    trackByOption(index: number, option: any): any {
        return index + '-' + option;
    }
}
