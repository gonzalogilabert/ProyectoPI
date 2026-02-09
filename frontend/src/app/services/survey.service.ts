import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Survey } from '../models/survey.model';
import { SurveyResponse } from '../models/response.model';

@Injectable({
    providedIn: 'root'
})
export class SurveyService {
    private apiUrl = 'http://localhost:3000/api';

    constructor(private http: HttpClient) { }

    // Survey methods
    createSurvey(survey: Survey): Observable<any> {
        return this.http.post(`${this.apiUrl}/surveys`, survey);
    }

    getSurveys(): Observable<Survey[]> {
        return this.http.get<Survey[]>(`${this.apiUrl}/surveys`);
    }

    getSurvey(id: string): Observable<Survey> {
        return this.http.get<Survey>(`${this.apiUrl}/surveys/${id}`);
    }

    updateSurvey(id: string, survey: Survey): Observable<any> {
        return this.http.put(`${this.apiUrl}/surveys/${id}`, survey);
    }

    deleteSurvey(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/surveys/${id}`);
    }

    // Response methods
    submitResponse(response: SurveyResponse): Observable<any> {
        return this.http.post(`${this.apiUrl}/responses`, response);
    }

    getResponses(surveyId: string): Observable<SurveyResponse[]> {
        return this.http.get<SurveyResponse[]>(`${this.apiUrl}/responses/survey/${surveyId}`);
    }
}
