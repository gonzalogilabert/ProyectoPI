export interface Answer {
    questionId: string;
    value: any;
}

export interface SurveyResponse {
    _id?: string;
    surveyId: string;
    respondentId?: string;
    answers: Answer[];
    submittedAt?: Date;
}
