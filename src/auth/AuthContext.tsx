import type { UserDto, LoginRequest } from "../api/types";
import { createContext } from "react";

export interface Auth {
  user: UserDto | null;
  email: string | null;
  loading: boolean;
  login: (body: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthCtx = createContext<Auth | undefined>(undefined);
export { AuthCtx };
