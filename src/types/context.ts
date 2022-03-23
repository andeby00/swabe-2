import { PrismaClient } from ".prisma/client";
//import { User } from 'nexus-prisma/*';

export interface ContextType {
  db: PrismaClient;
  //user: User | undefined;
}
