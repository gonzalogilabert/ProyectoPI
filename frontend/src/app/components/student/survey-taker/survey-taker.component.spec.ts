import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SurveyTakerComponent } from './survey-taker.component';
import { SurveyService } from '../../../services/survey.service';
import { AlertService } from '../../../services/alert.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { of } from 'rxjs';

describe('SurveyTakerComponent', () => {
    let component: SurveyTakerComponent;
    let fixture: ComponentFixture<SurveyTakerComponent>;
    let surveyServiceSpy: jasmine.SpyObj<SurveyService>;
    let alertServiceSpy: jasmine.SpyObj<AlertService>;
    let routerSpy: jasmine.SpyObj<Router>;

    const mockSurvey = {
        _id: '123',
        title: 'Test Survey',
        description: 'Desc',
        isAnonymous: true,
        timeLimit: 0,
        questions: []
    };

    beforeEach(async () => {
        surveyServiceSpy = jasmine.createSpyObj('SurveyService', ['getSurvey', 'submitResponse']);
        alertServiceSpy = jasmine.createSpyObj('AlertService', ['success', 'error', 'promptEmail']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            declarations: [SurveyTakerComponent],
            imports: [ReactiveFormsModule],
            providers: [
                FormBuilder,
                { provide: SurveyService, useValue: surveyServiceSpy },
                { provide: AlertService, useValue: alertServiceSpy },
                { provide: Router, useValue: routerSpy },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: { paramMap: { get: () => '123' } }
                    }
                }
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        surveyServiceSpy.getSurvey.and.returnValue(of(mockSurvey));
        fixture = TestBed.createComponent(SurveyTakerComponent);
        component = fixture.componentInstance;
    });

    it('should create (ID 3)', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should NOT prompt for email if anonymous (ID 4)', () => {
        mockSurvey.isAnonymous = true;
        fixture.detectChanges(); // triggers ngOnInit
        expect(alertServiceSpy.promptEmail).not.toHaveBeenCalled();
    });

    it('should prompt for email if NOT anonymous (ID 5)', () => {
        mockSurvey.isAnonymous = false;
        alertServiceSpy.promptEmail.and.returnValue(Promise.resolve('test@campuscamara.es'));

        fixture.detectChanges(); // triggers ngOnInit

        expect(alertServiceSpy.promptEmail).toHaveBeenCalled();
    });
});
