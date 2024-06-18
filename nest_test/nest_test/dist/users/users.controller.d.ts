import { UsersService } from './users.service';
import { User } from '../auth/auth.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    register(user: User): {
        message: string;
    };
    getProtectedResource(req: any): {
        message: string;
        user: any;
    };
}
