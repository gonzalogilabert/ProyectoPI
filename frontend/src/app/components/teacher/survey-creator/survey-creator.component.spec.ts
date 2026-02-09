import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SurveyCreatorComponent } from './survey-creator.component';
import { SurveyCreatorController } from '../../../controllers/survey-creator.controller';
import { SurveyService } from '../../../services/survey.service';
import { AlertService } from '../../../services/alert.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormArray } from '@angular/forms';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SurveyCreatorComponent', () => {
    let component: SurveyCreatorComponent;
    let fixture: ComponentFixture<SurveyCreatorComponent>;
    let surveyServiceSpy: jasmine.SpyObj<SurveyService>;
    let alertServiceSpy: jasmine.SpyObj<AlertService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        surveyServiceSpy = jasmine.createSpyObj('SurveyService', ['getSurvey', 'createSurvey', 'updateSurvey']);
        alertServiceSpy = jasmine.createSpyObj('AlertService', ['success', 'error']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            declarations: [SurveyCreatorComponent],
            imports: [ReactiveFormsModule, HttpClientTestingModule],
            providers: [
                FormBuilder,
                SurveyCreatorController, // The component will get it from here or create its own
                { provide: SurveyService, useValue: surveyServiceSpy },
                { provide: AlertService, useValue: alertServiceSpy },
                { provide: Router, useValue: routerSpy },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: { paramMap: { get: () => null } } // Simulation of "new mode"
                    }
                }
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SurveyCreatorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create (ID 6)', () => {
        expect(component).toBeTruthy();
    });

    it('should start with invalid form (ID 7)', () => {
        // Título is required and empty at start
        expect(component.surveyForm.invalid).toBeTrue();
    });

    it('should validate form when fields are filled (ID 8)', () => {
        component.surveyForm.get('title')?.setValue('My Survey');
        // By default one question is added, which also needs a text
        const questions = component.surveyForm.get('questions') as FormArray;
        questions.at(0).get('text')?.setValue('Question 1?');

        expect(component.surveyForm.valid).toBeTrue();
    });

    it('should add a question (ID 9)', () => {
        const initialCount = component.questions.length;
        component.addQuestion();
        expect(component.questions.length).toBe(initialCount + 1);
    });
});
