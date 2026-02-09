export interface Option {
    _id?: string;
    text: string;
}

export interface Question {
    _id?: string;
    text: string;
    description?: string;
    type: 'short' | 'long' | 'test' | 'multi' | 'dropdown' | 'scale' | 'grid_radio' | 'grid_check';
    required: boolean;
    options?: string[];
    rows?: string[];
    columns?: string[];
}

export interface Survey {
    _id?: string;
    title: string;
    description: string;
    timeLimit: number;
    isAnonymous: boolean;
    questions: Question[];
    createdAt?: Date;
    updatedAt?: Date;
}
