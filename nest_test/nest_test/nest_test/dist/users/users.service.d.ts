import { AuthService } from '../auth/auth.service';
import { User } from '../auth/auth.service';
export declare class UsersService {
    private readonly authService;
    constructor(authService: AuthService);
    register(user: User): {
        message: string;
    };
}
