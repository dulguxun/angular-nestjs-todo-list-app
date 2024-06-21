
export interface Task {
    id: number;
    title: string;
    createdAt: string;
    updatedAt: string;
    user: { id: number; username: string };
  }