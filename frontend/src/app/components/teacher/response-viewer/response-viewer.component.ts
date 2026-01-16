import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SurveyService } from '../../../services/survey.service';

@Component({
    selector: 'app-response-viewer',
    templateUrl: './response-viewer.component.html',
    styleUrls: ['./response-viewer.component.css']
})
export class ResponseViewerComponent implements OnInit {
    survey: any;
    responses: any[] = [];

    constructor(
        private route: ActivatedRoute,
        private surveyService: SurveyService
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.surveyService.getSurvey(id).subscribe({
                next: (data) => {
                    this.survey = data;
                    this.loadResponses(id);
                },
                error: (err) => console.error(err)
            });
        }
    }

    loadResponses(surveyId: string) {
        this.surveyService.getResponses(surveyId).subscribe({
            next: (data) => this.responses = data,
            error: (err) => console.error(err)
        });
    }

    getAnswerForQuestion(response: any, questionId: string): any {
        const answer = response.answers.find((a: any) => a.questionId === questionId);
        return answer ? answer.value : '-';
    }
}
