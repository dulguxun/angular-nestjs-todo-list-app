export interface Todotablee {
    id: number;
    title: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    favoriteTask: boolean;
    user: {
        id: number;
    };
}
