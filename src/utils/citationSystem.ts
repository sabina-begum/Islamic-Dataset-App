/**
 * Enhanced Citation System for Islamic Dataset Interface
 * Provides DOI-style referencing for academic use
 */

import React from "react";

export interface CitationMetadata {
  id: string;
  type: "quran" | "hadith" | "tafsir" | "scholarly_work";
  title: string;
  source: string;
  chapter?: string | number;
  verse?: string | number;
  hadithNumber?: string | number;
  narrator?: string;
  authentication?: "sahih" | "hasan" | "daif" | "fabricated";
  scholar?: string;
  translator?: string;
  publisher?: string;
  publicationYear?: number;
  edition?: string;
  pages?: string;
  url?: string;
  accessDate?: string;
  digitalIdentifier?: string; // DOI-style identifier
}

export interface AcademicReference {
  citation: CitationMetadata;
  context: string;
  reliability: "high" | "medium" | "low";
  crossReferences?: string[];
  scholarlyNotes?: string[];
}

export class IslamicCitationGenerator {
  /**
   * Generate a standardized academic citation
   */
  static generateCitation(metadata: CitationMetadata): string {
    const { type } = metadata;

    switch (type) {
      case "quran":
        return this.generateQuranCitation(metadata);
      case "hadith":
        return this.generateHadithCitation(metadata);
      case "tafsir":
      case "scholarly_work":
        return this.generateScholarlyWorkCitation(metadata);
      default:
        return this.generateGenericCitation(metadata);
    }
  }

  /**
   * Generate Quran verse citation
   */
  private static generateQuranCitation(metadata: CitationMetadata): string {
    const { chapter, verse, translator, publicationYear } = metadata;

    // Format: Al-Quran [Chapter:Verse]. Translated by [Translator]. [Year].
    let citation = `Al-Quran [${chapter}:${verse}]`;

    if (translator) {
      citation += `. Translated by ${translator}`;
    }

    if (publicationYear) {
      citation += `. ${publicationYear}`;
    }

    if (metadata.digitalIdentifier) {
      citation += `. Digital ID: ${metadata.digitalIdentifier}`;
    }

    return citation + ".";
  }

  /**
   * Generate Hadith citation
   */
  private static generateHadithCitation(metadata: CitationMetadata): string {
    const {
      source,
      hadithNumber,
      narrator,
      authentication,
      scholar,
      translator,
      publicationYear,
    } = metadata;

    // Format: [Collection], Hadith [Number]. Narrated by [Narrator]. [Authentication]. [Scholar/Editor]. [Year].
    let citation = source;

    if (hadithNumber) {
      citation += `, Hadith ${hadithNumber}`;
    }

    if (narrator) {
      citation += `. Narrated by ${narrator}`;
    }

    if (authentication) {
      citation += `. [${
        authentication.charAt(0).toUpperCase() + authentication.slice(1)
      }]`;
    }

    if (scholar) {
      citation += `. Ed. ${scholar}`;
    }

    if (translator) {
      citation += `. Trans. ${translator}`;
    }

    if (publicationYear) {
      citation += `. ${publicationYear}`;
    }

    if (metadata.digitalIdentifier) {
      citation += `. Digital ID: ${metadata.digitalIdentifier}`;
    }

    return citation + ".";
  }

  /**
   * Generate scholarly work citation
   */
  private static generateScholarlyWorkCitation(
    metadata: CitationMetadata
  ): string {
    const { scholar, title, publisher, publicationYear, edition, pages } =
      metadata;

    // Format: [Author]. [Title]. [Edition]. [Publisher], [Year]. [Pages].
    let citation = "";

    if (scholar) {
      citation += `${scholar}. `;
    }

    if (title) {
      citation += `"${title}." `;
    }

    if (edition) {
      citation += `${edition} ed. `;
    }

    if (publisher) {
      citation += `${publisher}`;
    }

    if (publicationYear) {
      citation += `, ${publicationYear}`;
    }

    if (pages) {
      citation += `. pp. ${pages}`;
    }

    if (metadata.digitalIdentifier) {
      citation += `. Digital ID: ${metadata.digitalIdentifier}`;
    }

    return citation + ".";
  }

  /**
   * Generate generic citation
   */
  private static generateGenericCitation(metadata: CitationMetadata): string {
    const { title, source, publicationYear } = metadata;

    let citation = "";

    if (title) {
      citation += `"${title}." `;
    }

    if (source) {
      citation += source;
    }

    if (publicationYear) {
      citation += `, ${publicationYear}`;
    }

    if (metadata.digitalIdentifier) {
      citation += `. Digital ID: ${metadata.digitalIdentifier}`;
    }

    return citation + ".";
  }

  /**
   * Generate bibliography entry
   */
  static generateBibliography(citations: CitationMetadata[]): string {
    return citations
      .map((citation) => this.generateCitation(citation))
      .sort()
      .join("\n\n");
  }

  /**
   * Generate digital identifier (DOI-style)
   */
  static generateDigitalIdentifier(metadata: CitationMetadata): string {
    const { type, source, chapter, verse, hadithNumber } = metadata;

    const prefix = "IDI"; // Islamic Dataset Interface
    const year = new Date().getFullYear();

    switch (type) {
      case "quran":
        return `${prefix}/${year}/quran.${chapter}.${verse}`;
      case "hadith": {
        const sourceCode = source.toLowerCase().replace(/\s+/g, "");
        return `${prefix}/${year}/hadith.${sourceCode}.${hadithNumber}`;
      }
      default:
        return `${prefix}/${year}/${type}.${Date.now()}`;
    }
  }

  /**
   * Validate citation completeness
   */
  static validateCitation(metadata: CitationMetadata): {
    isValid: boolean;
    missingFields: string[];
    warnings: string[];
  } {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!metadata.title && !metadata.source) {
      missingFields.push("title or source");
    }

    if (metadata.type === "quran") {
      if (!metadata.chapter) missingFields.push("chapter");
      if (!metadata.verse) missingFields.push("verse");
    }

    if (metadata.type === "hadith") {
      if (!metadata.source) missingFields.push("source");
      if (!metadata.hadithNumber) missingFields.push("hadithNumber");
      if (!metadata.authentication)
        warnings.push("authentication grade missing");
    }

    // Recommended fields
    if (!metadata.digitalIdentifier) {
      warnings.push("digital identifier recommended for academic use");
    }

    return {
      isValid: missingFields.length === 0,
      missingFields,
      warnings,
    };
  }

  /**
   * Export citation in various formats
   */
  static exportCitation(
    metadata: CitationMetadata,
    format: "apa" | "mla" | "chicago" | "islamic-studies" = "islamic-studies"
  ): string {
    switch (format) {
      case "islamic-studies":
        return this.generateCitation(metadata);
      case "apa":
        return this.generateAPACitation(metadata);
      case "mla":
        return this.generateMLACitation(metadata);
      case "chicago":
        return this.generateChicagoCitation(metadata);
      default:
        return this.generateCitation(metadata);
    }
  }

  private static generateAPACitation(metadata: CitationMetadata): string {
    // Simplified APA format for Islamic sources
    const { scholar, title, source, publicationYear } = metadata;

    let citation = "";

    if (scholar) {
      citation += `${scholar} `;
    }

    if (publicationYear) {
      citation += `(${publicationYear}). `;
    }

    if (title) {
      citation += `${title}. `;
    }

    if (source) {
      citation += `${source}`;
    }

    return citation;
  }

  private static generateMLACitation(metadata: CitationMetadata): string {
    // Simplified MLA format for Islamic sources
    const { scholar, title, source, publicationYear } = metadata;

    let citation = "";

    if (scholar) {
      citation += `${scholar}. `;
    }

    if (title) {
      citation += `"${title}." `;
    }

    if (source) {
      citation += `${source}`;
    }

    if (publicationYear) {
      citation += `, ${publicationYear}`;
    }

    return citation;
  }

  private static generateChicagoCitation(metadata: CitationMetadata): string {
    // Simplified Chicago format for Islamic sources
    const { scholar, title, source, publisher, publicationYear } = metadata;

    let citation = "";

    if (scholar) {
      citation += `${scholar}. `;
    }

    if (title) {
      citation += `"${title}." `;
    }

    if (source && publisher) {
      citation += `${source}. ${publisher}`;
    } else if (source) {
      citation += source;
    }

    if (publicationYear) {
      citation += `, ${publicationYear}`;
    }

    return citation;
  }
}

/**
 * Hook for managing citations in components
 */
export const useCitations = () => {
  const [citations, setCitations] = React.useState<CitationMetadata[]>([]);

  const addCitation = (metadata: CitationMetadata) => {
    const digitalId =
      IslamicCitationGenerator.generateDigitalIdentifier(metadata);
    const citationWithId = { ...metadata, digitalIdentifier: digitalId };

    setCitations((prev) => {
      const exists = prev.find((c) => c.id === citationWithId.id);
      if (exists) return prev;
      return [...prev, citationWithId];
    });
  };

  const removeCitation = (id: string) => {
    setCitations((prev) => prev.filter((c) => c.id !== id));
  };

  const generateBibliography = () => {
    return IslamicCitationGenerator.generateBibliography(citations);
  };

  const exportCitations = (
    format: "apa" | "mla" | "chicago" | "islamic-studies" = "islamic-studies"
  ) => {
    return citations
      .map((citation) =>
        IslamicCitationGenerator.exportCitation(citation, format)
      )
      .join("\n\n");
  };

  return {
    citations,
    addCitation,
    removeCitation,
    generateBibliography,
    exportCitations,
  };
};
