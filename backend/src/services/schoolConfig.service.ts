import { SchoolSettings, type ISchoolSettings, type SchoolSettingsDocument } from '../models/SchoolSettings';
import { defaultSchoolSettings } from '../config/schoolConfig';
import type { UpdateSettingsInput } from '../validators/settings.validator';

/** Fields safe to expose to unauthenticated visitors (login page branding). */
export type PublicSchoolSettings = Pick<
  ISchoolSettings,
  | 'schoolName' | 'shortName' | 'logo' | 'favicon' | 'address' | 'phone' | 'email' | 'website'
  | 'primaryColor' | 'secondaryColor' | 'currentSession' | 'currentTerm'
>;

/** Flatten nested objects to dot paths so a partial update never wipes sibling fields. */
function flatten(input: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(out, flatten(value as Record<string, unknown>, path));
    } else if (value !== undefined) {
      out[path] = value;
    }
  }
  return out;
}

export const schoolConfigService = {
  async getOrCreate(): Promise<SchoolSettingsDocument> {
    const existing = await SchoolSettings.findOne({ key: 'default' });
    if (existing) return existing;
    try {
      return await SchoolSettings.create({ key: 'default', ...defaultSchoolSettings });
    } catch (err) {
      // Two processes starting at once: the unique key makes the loser fall back to a read.
      const again = await SchoolSettings.findOne({ key: 'default' });
      if (again) return again;
      throw err;
    }
  },

  async getPublic(): Promise<PublicSchoolSettings> {
    const s = await this.getOrCreate();
    return {
      schoolName: s.schoolName,
      shortName: s.shortName,
      logo: s.logo,
      favicon: s.favicon,
      address: s.address,
      phone: s.phone,
      email: s.email,
      website: s.website,
      primaryColor: s.primaryColor,
      secondaryColor: s.secondaryColor,
      currentSession: s.currentSession,
      currentTerm: s.currentTerm,
    };
  },

  async getFull() {
    return (await this.getOrCreate()).toObject();
  },

  async update(input: UpdateSettingsInput, userId: string) {
    await this.getOrCreate();
    const updated = await SchoolSettings.findOneAndUpdate(
      { key: 'default' },
      { $set: { ...flatten(input), updatedBy: userId } },
      { new: true, runValidators: true },
    );
    return updated!.toObject();
  },
};
