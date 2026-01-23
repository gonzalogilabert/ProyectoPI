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
    questionsPerPage = 3;
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
            answers.push(this.fb.group({
                questionId: [q._id],
                value: [q.type === 'multi' ? [] : '', q.required ? Validators.required : []]
            }));
        });
    }

    get answers() {
        return this.responseForm.get('answers') as FormArray;
    }

    get questionsForCurrentPage() {
        const start = this.currentPage * this.questionsPerPage;
        return this.survey.questions.slice(start, start + this.questionsPerPage);
    }

    get totalPages() {
        return Math.ceil(this.survey.questions.length / this.questionsPerPage);
    }

    nextPage() {
        if (this.currentPage < this.totalPages - 1) {
            this.currentPage++;
        }
    }

    prevPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
        }
    }

    onMultiChange(event: any, index: number, option: string) {
        const valueArray = this.answers.at(index).get('value')?.value as string[];
        if (event.target.checked) {
            valueArray.push(option);
        } else {
            const idx = valueArray.indexOf(option);
            if (idx > -1) valueArray.splice(idx, 1);
        }
        this.answers.at(index).get('value')?.setValue(valueArray);
    }

    startTimer(seconds: number) {
        this.timeLeft = seconds;
        this.timerSubscription = interval(1000).subscribe(() => {
            if (this.timeLeft > 0) {
                this.timeLeft--;
            } else {
                this.onSubmit(); // Auto submit when time is up
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

    onSubmit() {
        if (this.responseForm.valid || this.timeLeft === 0) {
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
}
