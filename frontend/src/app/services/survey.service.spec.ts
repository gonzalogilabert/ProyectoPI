import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SurveyService } from './survey.service';
import { Survey } from '../models/survey.model';

describe('SurveyService', () => {
    let service: SurveyService;
    let httpMock: HttpTestingController;
    const apiUrl = 'http://127.0.0.1:3000/api';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [SurveyService]
        });
        service = TestBed.inject(SurveyService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created (ID 14)', () => {
        expect(service).toBeTruthy();
    });

    it('should fetch all surveys via GET (ID 15)', () => {
        const mockSurveys: Survey[] = [{ _id: '1', title: 'Test 1', description: 'Desc 1', questions: [], timeLimit: 0, isAnonymous: true }];

        service.getSurveys().subscribe(surveys => {
            expect(surveys.length).toBe(1);
            expect(surveys).toEqual(mockSurveys);
        });

        const req = httpMock.expectOne(`${apiUrl}/surveys`);
        expect(req.request.method).toBe('GET');
        req.flush(mockSurveys);
    });

    it('should fetch a single survey by ID (ID 16)', () => {
        const mockSurvey: Survey = { _id: '1', title: 'Test 1', description: 'Desc 1', questions: [], timeLimit: 0, isAnonymous: true };

        service.getSurvey('1').subscribe(survey => {
            expect(survey).toEqual(mockSurvey);
        });

        const req = httpMock.expectOne(`${apiUrl}/surveys/1`);
        expect(req.request.method).toBe('GET');
        req.flush(mockSurvey);
    });

    it('should create a survey via POST (ID 17)', () => {
        const newSurvey: Survey = { title: 'New', description: 'Desc', questions: [], timeLimit: 0, isAnonymous: true };

        service.createSurvey(newSurvey).subscribe(response => {
            expect(response).toBeTruthy();
        });

        const req = httpMock.expectOne(`${apiUrl}/surveys`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(newSurvey);
        req.flush({ status: 'success' });
    });

    it('should delete a survey via DELETE (ID 18)', () => {
        service.deleteSurvey('1').subscribe(response => {
            expect(response).toBeTruthy();
        });

        const req = httpMock.expectOne(`${apiUrl}/surveys/1`);
        expect(req.request.method).toBe('DELETE');
        req.flush({ status: 'deleted' });
    });

    it('should submit a response via POST (ID 19)', () => {
        const mockResponse = { surveyId: '1', userEmail: 'test@camara.es', answers: [] };

        service.submitResponse(mockResponse as any).subscribe(res => {
            expect(res).toBeTruthy();
        });

        const req = httpMock.expectOne(`${apiUrl}/responses`);
        expect(req.request.method).toBe('POST');
        req.flush({ status: 'submitted' });
    });
});
