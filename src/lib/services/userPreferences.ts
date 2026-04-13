// User preferences service — reads/writes to Firestore /users/{uid}
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { userPreferencesSchema, type UserPreferences } from "../schemas/firestore";

const DEFAULT_PREFERENCES: UserPreferences = {
  favoriteGenres: [],
  preferredLanguages: [],
  followedCountries: [],
  followedBookClubs: [],
  onboardingComplete: false,
};

/** Fetch user preferences. Returns defaults if none exist. Validates with Zod. */
export async function getUserPreferences(uid: string): Promise<UserPreferences> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return DEFAULT_PREFERENCES;
  const raw = snap.data()?.preferences ?? {};
  return userPreferencesSchema.parse({ ...DEFAULT_PREFERENCES, ...raw });
}

/** Save full preferences (used during onboarding). */
export async function saveUserPreferences(uid: string, preferences: UserPreferences): Promise<void> {
  const validated = userPreferencesSchema.parse(preferences);
  const ref = doc(db, "users", uid);
  await setDoc(ref, { preferences: validated }, { merge: true });
}
