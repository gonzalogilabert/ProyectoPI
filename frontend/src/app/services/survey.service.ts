import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SurveyService {
    private apiUrl = 'http://localhost:3000/api';

    constructor(private http: HttpClient) { }

    // Survey methods
    createSurvey(survey: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/surveys`, survey);
    }

    getSurveys(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/surveys`);
    }

    getSurvey(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/surveys/${id}`);
    }

    updateSurvey(id: string, survey: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/surveys/${id}`, survey);
    }

    deleteSurvey(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/surveys/${id}`);
    }

    // Response methods
    submitResponse(response: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/responses`, response);
    }

    getResponses(surveyId: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/responses/survey/${surveyId}`);
    }
}
