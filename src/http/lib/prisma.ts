import { PrismaClient } from '@prisma/client'; // import PrismaClient

export const prisma = new PrismaClient({
    log: ['query'], // log all queries
}); // instantiate PrismaClient