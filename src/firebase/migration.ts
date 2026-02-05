import { firestoreService } from "./firestore";
import { isFirebaseConfigured } from "./config";
import type { IslamicData, QuranAyah, HadithEntry } from "../types/Types";

// Data migration service for populating Firestore with existing data
export class DataMigrationService {
  private static instance: DataMigrationService;

  private constructor() {}

  public static getInstance(): DataMigrationService {
    if (!DataMigrationService.instance) {
      DataMigrationService.instance = new DataMigrationService();
    }
    return DataMigrationService.instance;
  }

  // Check if migration is needed
  async checkMigrationStatus(): Promise<{
    islamicDataCount: number;
    quranDataCount: number;
    hadithDataCount: number;
    needsMigration: boolean;
  }> {
    if (!isFirebaseConfigured()) {
      return {
        islamicDataCount: 0,
        quranDataCount: 0,
        hadithDataCount: 0,
        needsMigration: false,
      };
    }

    try {
      // Get counts from Firestore
      const islamicData = await firestoreService.getIslamicData(
        {},
        { itemsPerPage: 1000 }
      );
      const quranData = await firestoreService.getQuranData();
      const hadithData = await firestoreService.getHadithData();

      return {
        islamicDataCount: islamicData.data?.length || 0,
        quranDataCount: quranData.length,
        hadithDataCount: hadithData.length,
        needsMigration:
          (islamicData.data?.length || 0) === 0 &&
          quranData.length === 0 &&
          hadithData.length === 0,
      };
    } catch (error) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("Failed to check migration status:", error);
      }
      return {
        islamicDataCount: 0,
        quranDataCount: 0,
        hadithDataCount: 0,
        needsMigration: true,
      };
    }
  }

  // Migrate Islamic data
  async migrateIslamicData(data: IslamicData[]): Promise<{
    success: boolean;
    migrated: number;
    errors: string[];
  }> {
    if (!isFirebaseConfigured()) {
      return {
        success: false,
        migrated: 0,
        errors: ["Firebase not configured"],
      };
    }

    const errors: string[] = [];
    let migrated = 0;

    for (const item of data) {
      try {
        // Remove id, createdAt, updatedAt for migration
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _, createdAt: __, updatedAt: ___, ...migrationData } = item;
        await firestoreService.addIslamicData(migrationData);
        migrated++;
      } catch (error) {
        errors.push(`Failed to migrate Islamic data "${item.title}": ${error}`);
      }
    }

    return {
      success: errors.length === 0,
      migrated,
      errors,
    };
  }

  // Migrate Quran data
  async migrateQuranData(data: QuranAyah[]): Promise<{
    success: boolean;
    migrated: number;
    errors: string[];
  }> {
    if (!isFirebaseConfigured()) {
      return {
        success: false,
        migrated: 0,
        errors: ["Firebase not configured"],
      };
    }

    const errors: string[] = [];
    let migrated = 0;

    for (const item of data) {
      try {
        // Remove id for migration
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _, ...migrationData } = item;
        await firestoreService.addQuranData(migrationData);
        migrated++;
      } catch (error) {
        errors.push(
          `Failed to migrate Quran data "${item.surah_name_en} ${item.ayah_no_surah}": ${error}`
        );
      }
    }

    return {
      success: errors.length === 0,
      migrated,
      errors,
    };
  }

  // Migrate Hadith data
  async migrateHadithData(data: HadithEntry[]): Promise<{
    success: boolean;
    migrated: number;
    errors: string[];
  }> {
    if (!isFirebaseConfigured()) {
      return {
        success: false,
        migrated: 0,
        errors: ["Firebase not configured"],
      };
    }

    const errors: string[] = [];
    let migrated = 0;

    for (const item of data) {
      try {
        // Remove id and createdAt for migration
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _, createdAt: __, ...migrationData } = item;
        await firestoreService.addHadithData(migrationData);
        migrated++;
      } catch (error) {
        errors.push(`Failed to migrate Hadith data "${item.number}": ${error}`);
      }
    }

    return {
      success: errors.length === 0,
      migrated,
      errors,
    };
  }

  // Full migration with progress tracking
  async performFullMigration(
    islamicData: IslamicData[],
    quranData: QuranAyah[],
    hadithData: HadithEntry[],
    onProgress?: (progress: {
      step: string;
      current: number;
      total: number;
      percentage: number;
    }) => void
  ): Promise<{
    success: boolean;
    islamicDataResult: { migrated: number; errors: string[] };
    quranDataResult: { migrated: number; errors: string[] };
    hadithDataResult: { migrated: number; errors: string[] };
    totalMigrated: number;
    totalErrors: number;
  }> {
    const totalItems =
      islamicData.length + quranData.length + hadithData.length;
    let currentItem = 0;

    // Migrate Islamic data
    onProgress?.({
      step: "Migrating Islamic Data",
      current: currentItem,
      total: totalItems,
      percentage: Math.round((currentItem / totalItems) * 100),
    });

    const islamicDataResult = await this.migrateIslamicData(islamicData);
    currentItem += islamicData.length;

    onProgress?.({
      step: "Migrating Quran Data",
      current: currentItem,
      total: totalItems,
      percentage: Math.round((currentItem / totalItems) * 100),
    });

    const quranDataResult = await this.migrateQuranData(quranData);
    currentItem += quranData.length;

    onProgress?.({
      step: "Migrating Hadith Data",
      current: currentItem,
      total: totalItems,
      percentage: Math.round((currentItem / totalItems) * 100),
    });

    const hadithDataResult = await this.migrateHadithData(hadithData);
    currentItem += hadithData.length;

    onProgress?.({
      step: "Migration Complete",
      current: currentItem,
      total: totalItems,
      percentage: 100,
    });

    const totalMigrated =
      islamicDataResult.migrated +
      quranDataResult.migrated +
      hadithDataResult.migrated;
    const totalErrors =
      islamicDataResult.errors.length +
      quranDataResult.errors.length +
      hadithDataResult.errors.length;

    return {
      success: totalErrors === 0,
      islamicDataResult,
      quranDataResult,
      hadithDataResult,
      totalMigrated,
      totalErrors,
    };
  }

  // Clear all data (for testing/reset)
  async clearAllData(): Promise<{
    success: boolean;
    errors: string[];
  }> {
    if (!isFirebaseConfigured()) {
      return { success: false, errors: ["Firebase not configured"] };
    }

    const errors: string[] = [];

    try {
      // This would require implementing delete methods in FirestoreService
      // For now, we'll just return a placeholder
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn("Clear all data functionality not implemented yet");
      }
      return { success: true, errors: [] };
    } catch (error) {
      errors.push(`Failed to clear data: ${error}`);
      return { success: false, errors };
    }
  }

  // Validate data before migration
  validateData(
    islamicData: IslamicData[],
    quranData: QuranAyah[],
    hadithData: HadithEntry[]
  ): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate Islamic data
    islamicData.forEach((item, index) => {
      if (!item.title) {
        errors.push(`Islamic data at index ${index}: Missing title`);
      }
      if (!item.type) {
        errors.push(`Islamic data at index ${index}: Missing type`);
      }
      if (item.title && item.title.length > 200) {
        warnings.push(`Islamic data "${item.title}": Title is very long`);
      }
    });

    // Validate Quran data
    quranData.forEach((item, index) => {
      if (!item.surah_name_en) {
        errors.push(`Quran data at index ${index}: Missing surah name`);
      }
      if (!item.ayah_no_surah) {
        errors.push(`Quran data at index ${index}: Missing ayah number`);
      }
      if (item.surah_no < 1 || item.surah_no > 114) {
        errors.push(`Quran data at index ${index}: Invalid surah number`);
      }
    });

    // Validate Hadith data
    hadithData.forEach((item, index) => {
      if (!item.number) {
        errors.push(`Hadith data at index ${index}: Missing number`);
      }
      if (!item.text) {
        errors.push(`Hadith data at index ${index}: Missing text`);
      }
      if (item.text && item.text.length > 10000) {
        warnings.push(`Hadith ${item.number}: Text is very long`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

// Export singleton instance
export const dataMigrationService = DataMigrationService.getInstance();
