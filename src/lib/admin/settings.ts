import { db } from '@/lib/db';

const AI_MASTER_SWITCH_KEY = 'ai_master_switch';

export async function getAiEnabled(): Promise<boolean> {
  try {
    const setting = await db.platformSettings.findUnique({
      where: { key: AI_MASTER_SWITCH_KEY },
    });

    if (!setting || setting.value !== 'on') {
      return false;
    }

    return true;
  } catch (error) {
    console.error('[getAiEnabled] Error fetching AI master switch setting:', error);
    return false; // Fail-safe default is OFF
  }
}

export async function setAiEnabled(on: boolean): Promise<void> {
  const value = on ? 'on' : 'off';

  await db.platformSettings.upsert({
    where: { key: AI_MASTER_SWITCH_KEY },
    update: { value },
    create: {
      key: AI_MASTER_SWITCH_KEY,
      value,
    },
  });
}
