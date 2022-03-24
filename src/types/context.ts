import { PrismaClient } from ".prisma/client";
import { User } from "@prisma/client";

export interface ContextType {
  db: PrismaClient;
  user: User | undefined;
}
