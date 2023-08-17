import { UserEntity } from "@/core/user/entities/user.entity";

declare global {
  namespace Express {
    interface User extends UserEntity {}
  }
}
