// Prisma is not compatible with static export (output: "export")
// This app uses localStorage via Zustand for all data persistence
// If server-side database is needed in future, switch from output: "export"
// to standard Next.js server mode and uncomment below:

// import { PrismaClient } from '@prisma/client'

// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient | undefined
// }

// export const db =
//   globalForPrisma.prisma ??
//   new PrismaClient({
//     log: ['query'],
//   })

// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

export const db = null;
