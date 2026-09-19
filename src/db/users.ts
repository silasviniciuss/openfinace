import { eq } from 'drizzle-orm';
import { db } from './index.ts';
import { users } from './schema.ts';

export async function getOrCreateUser(uid: string, email: string, name?: string, avatar?: string) {
  try {
    const existing = await db.select().from(users).where(eq(users.id, uid)).limit(1);
    if (existing.length > 0) {
      if (name || avatar) {
        const updated = await db
          .update(users)
          .set({
            name: name || existing[0].name,
            avatar: avatar || existing[0].avatar,
            updatedAt: new Date(),
          })
          .where(eq(users.id, uid))
          .returning();
        return updated[0];
      }
      return existing[0];
    }

    const inserted = await db
      .insert(users)
      .values({
        id: uid,
        email,
        name: name || 'Silas Vinícius',
        avatar: avatar || '',
      })
      .returning();

    return inserted[0];
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    throw new Error('Falha ao sincronizar usuário no banco de dados', { cause: error });
  }
}
