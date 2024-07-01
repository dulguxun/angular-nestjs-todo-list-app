export interface Todotablee {
  id: number;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  favoriteTask: boolean;
  originalPosition: number; // Add this field
  user: { id: number; };
}

