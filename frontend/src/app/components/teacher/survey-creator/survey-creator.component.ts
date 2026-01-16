import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { SurveyService } from '../../../services/survey.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-survey-creator',
    templateUrl: './survey-creator.component.html',
    styleUrls: ['./survey-creator.component.css']
})
export class SurveyCreatorComponent implements OnInit {
    surveyForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private surveyService: SurveyService,
        private router: Router
    ) {
        this.surveyForm = this.fb.group({
            title: ['', Validators.required],
            description: [''],
            timeLimit: [0], // 0 means no limit
            questions: this.fb.array([])
        });
    }

    ngOnInit(): void {
        this.addQuestion();
    }

    get questions(): FormArray {
        return this.surveyForm.get('questions') as FormArray;
    }

    createQuestion(): FormGroup {
        return this.fb.group({
            text: ['', Validators.required],
            type: ['text', Validators.required],
            required: [false],
            options: this.fb.array([])
        });
    }

    addQuestion() {
        this.questions.push(this.createQuestion());
    }

    removeQuestion(index: number) {
        this.questions.removeAt(index);
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

    onTypeChange(index: number) {
        const question = this.questions.at(index);
        const options = question.get('options') as FormArray;
        if (question.get('type')?.value === 'text') {
            while (options.length !== 0) {
                options.removeAt(0);
            }
        } else if (options.length === 0) {
            options.push(this.fb.control('', Validators.required));
        }
    }

    onSubmit() {
        if (this.surveyForm.valid) {
            this.surveyService.createSurvey(this.surveyForm.value).subscribe({
                next: (res) => {
                    alert('Encuesta creada con éxito');
                    this.router.navigate(['/list']);
                },
                error: (err) => console.error(err)
            });
        } else {
            alert('Por favor, rellena todos los campos obligatorios.');
        }
    }
}
