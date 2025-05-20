import prisma from '../prisma/prismaClient';

export async function createSession(userId: number, token: string, expiresAt: Date) {
  // Delete previous sessions to enforce single session
  await prisma.session.deleteMany({ where: { userId } });
  return prisma.session.create({
    data: { userId, token, expiresAt }
  });
}

export async function findSessionByToken(token: string) {
  return prisma.session.findUnique({ where: { token } });
}

export async function deleteSessionByToken(token: string) {
  return prisma.session.deleteMany({ where: { token } });
}
