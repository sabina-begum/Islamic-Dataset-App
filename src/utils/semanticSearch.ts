/**
 * Advanced Semantic Search for Islamic Concepts
 * Provides intelligent search algorithms for Islamic terminology and concepts
 */

// Islamic concept mappings and relationships
export interface IslamicConcept {
  term: string;
  arabicTerm?: string;
  definition: string;
  category:
    | "theology"
    | "jurisprudence"
    | "history"
    | "spirituality"
    | "practice"
    | "ethics";
  synonyms: string[];
  relatedTerms: string[];
  importance: "high" | "medium" | "low";
  sources: string[];
}

export interface SemanticSearchResult {
  item: any;
  score: number;
  matchType: "exact" | "semantic" | "conceptual" | "contextual";
  explanation: string;
  relatedConcepts?: string[];
}

// Islamic terminology and concept database
const ISLAMIC_CONCEPTS: IslamicConcept[] = [
  {
    term: "Tawhid",
    arabicTerm: "توحيد",
    definition:
      "The fundamental Islamic concept of the oneness and unity of Allah",
    category: "theology",
    synonyms: ["Unity of God", "Monotheism", "Oneness"],
    relatedTerms: ["Allah", "Shirk", "Iman", "Aqeedah"],
    importance: "high",
    sources: ["Quran", "Hadith", "Aqeedah texts"],
  },
  {
    term: "Salah",
    arabicTerm: "صلاة",
    definition: "The ritual prayer performed five times daily by Muslims",
    category: "practice",
    synonyms: ["Prayer", "Namaz", "Worship"],
    relatedTerms: ["Wudu", "Qibla", "Rakah", "Sujud", "Ruku"],
    importance: "high",
    sources: ["Quran", "Hadith", "Fiqh manuals"],
  },
  {
    term: "Jihad",
    arabicTerm: "جهاد",
    definition:
      "Striving or struggle in the path of Allah, including spiritual and physical efforts",
    category: "ethics",
    synonyms: ["Struggle", "Striving", "Effort"],
    relatedTerms: ["Nafs", "Mujahid", "Fisabilillah"],
    importance: "high",
    sources: ["Quran", "Hadith", "Islamic jurisprudence"],
  },
  {
    term: "Sunnah",
    arabicTerm: "سنة",
    definition:
      "The teachings, practices, and examples of Prophet Muhammad (PBUH)",
    category: "practice",
    synonyms: ["Prophetic tradition", "Example", "Way"],
    relatedTerms: ["Hadith", "Prophet", "Seerah", "Sunnah Muakkadah"],
    importance: "high",
    sources: ["Hadith collections", "Seerah literature"],
  },
  {
    term: "Ijtihad",
    arabicTerm: "اجتهاد",
    definition: "Independent reasoning and interpretation of Islamic law",
    category: "jurisprudence",
    synonyms: ["Independent reasoning", "Scholarly interpretation"],
    relatedTerms: ["Mujtahid", "Fiqh", "Qiyas", "Ijma"],
    importance: "medium",
    sources: ["Usul al-Fiqh texts", "Legal literature"],
  },
  // Add more Islamic concepts as needed
];

export class IslamicSemanticSearch {
  private concepts: Map<string, IslamicConcept>;
  private termIndex: Map<string, string[]>;
  private arabicIndex: Map<string, string[]>;

  constructor() {
    this.concepts = new Map();
    this.termIndex = new Map();
    this.arabicIndex = new Map();
    this.buildIndex();
  }

  /**
   * Build search indexes for faster lookups
   */
  private buildIndex(): void {
    ISLAMIC_CONCEPTS.forEach((concept) => {
      const termKey = concept.term.toLowerCase();
      this.concepts.set(termKey, concept);

      // Build term index
      const allTerms = [
        concept.term,
        ...concept.synonyms,
        ...concept.relatedTerms,
      ].map((term) => term.toLowerCase());

      allTerms.forEach((term) => {
        if (!this.termIndex.has(term)) {
          this.termIndex.set(term, []);
        }
        this.termIndex.get(term)!.push(termKey);
      });

      // Build Arabic index
      if (concept.arabicTerm) {
        if (!this.arabicIndex.has(concept.arabicTerm)) {
          this.arabicIndex.set(concept.arabicTerm, []);
        }
        this.arabicIndex.get(concept.arabicTerm)!.push(termKey);
      }
    });
  }

  /**
   * Enhanced semantic search with Islamic concept understanding
   */
  search(
    query: string,
    data: any[],
    options: {
      includeSemanticMatches?: boolean;
      includeConceptualMatches?: boolean;
      includeContextualMatches?: boolean;
      weights?: {
        exact: number;
        semantic: number;
        conceptual: number;
        contextual: number;
      };
    } = {}
  ): SemanticSearchResult[] {
    const {
      includeSemanticMatches = true,
      includeConceptualMatches = true,
      includeContextualMatches = true,
      weights = { exact: 1.0, semantic: 0.8, conceptual: 0.6, contextual: 0.4 },
    } = options;

    const normalizedQuery = query.toLowerCase().trim();
    const results: SemanticSearchResult[] = [];

    // Find related Islamic concepts
    const relatedConcepts = this.findRelatedConcepts(normalizedQuery);

    data.forEach((item) => {
      const searchableText = this.extractSearchableText(item);
      const scores: {
        type: SemanticSearchResult["matchType"];
        score: number;
        explanation: string;
      }[] = [];

      // 1. Exact matching
      const exactScore = this.calculateExactMatch(
        normalizedQuery,
        searchableText
      );
      if (exactScore > 0) {
        scores.push({
          type: "exact",
          score: exactScore * weights.exact,
          explanation: "Direct text match found",
        });
      }

      // 2. Semantic matching (using Islamic concepts)
      if (includeSemanticMatches) {
        const semanticScore = this.calculateSemanticMatch(
          searchableText,
          relatedConcepts
        );
        if (semanticScore > 0) {
          scores.push({
            type: "semantic",
            score: semanticScore * weights.semantic,
            explanation: "Related Islamic concepts found",
          });
        }
      }

      // 3. Conceptual matching (theological/jurisprudential relationships)
      if (includeConceptualMatches) {
        const conceptualScore = this.calculateConceptualMatch(
          normalizedQuery,
          searchableText
        );
        if (conceptualScore > 0) {
          scores.push({
            type: "conceptual",
            score: conceptualScore * weights.conceptual,
            explanation: "Conceptually related Islamic principles found",
          });
        }
      }

      // 4. Contextual matching (historical/cultural context)
      if (includeContextualMatches) {
        const contextualScore = this.calculateContextualMatch(
          normalizedQuery,
          searchableText
        );
        if (contextualScore > 0) {
          scores.push({
            type: "contextual",
            score: contextualScore * weights.contextual,
            explanation: "Contextually related content found",
          });
        }
      }

      // Combine scores and add to results if above threshold
      if (scores.length > 0) {
        const bestMatch = scores.reduce((best, current) =>
          current.score > best.score ? current : best
        );

        const totalScore =
          scores.reduce((sum, s) => sum + s.score, 0) / scores.length;

        if (totalScore > 0.1) {
          // Minimum threshold
          results.push({
            item,
            score: totalScore,
            matchType: bestMatch.type,
            explanation: bestMatch.explanation,
            relatedConcepts: relatedConcepts.map((c) => c.term),
          });
        }
      }
    });

    // Sort by score and return
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Find Islamic concepts related to the query
   */
  private findRelatedConcepts(query: string): IslamicConcept[] {
    const related: IslamicConcept[] = [];
    const queryTerms = this.tokenizeQuery(query);

    // Direct concept matches
    queryTerms.forEach((term) => {
      const conceptKeys = this.termIndex.get(term) || [];
      conceptKeys.forEach((key) => {
        const concept = this.concepts.get(key);
        if (concept && !related.find((c) => c.term === concept.term)) {
          related.push(concept);
        }
      });
    });

    // Arabic term matches
    if (this.containsArabic(query)) {
      const arabicTerms = this.extractArabicTerms(query);
      arabicTerms.forEach((term) => {
        const conceptKeys = this.arabicIndex.get(term) || [];
        conceptKeys.forEach((key) => {
          const concept = this.concepts.get(key);
          if (concept && !related.find((c) => c.term === concept.term)) {
            related.push(concept);
          }
        });
      });
    }

    return related;
  }

  /**
   * Calculate exact match score
   */
  private calculateExactMatch(query: string, text: string): number {
    const normalizedText = text.toLowerCase();

    if (normalizedText.includes(query)) {
      const exactMatch = normalizedText === query;
      const startsWith = normalizedText.startsWith(query);
      const containsAsWord = new RegExp(`\\b${query}\\b`).test(normalizedText);

      if (exactMatch) return 1.0;
      if (startsWith) return 0.9;
      if (containsAsWord) return 0.8;
      return 0.6;
    }

    return 0;
  }

  /**
   * Calculate semantic match score using Islamic concepts
   */
  private calculateSemanticMatch(
    text: string,
    concepts: IslamicConcept[]
  ): number {
    let score = 0;
    const normalizedText = text.toLowerCase();

    concepts.forEach((concept) => {
      // Check if concept terms appear in text
      const conceptTerms = [
        concept.term.toLowerCase(),
        ...concept.synonyms.map((s) => s.toLowerCase()),
        ...concept.relatedTerms.map((r) => r.toLowerCase()),
      ];

      conceptTerms.forEach((term) => {
        if (normalizedText.includes(term)) {
          // Weight by concept importance
          const importanceWeight =
            concept.importance === "high"
              ? 1.0
              : concept.importance === "medium"
              ? 0.7
              : 0.4;
          score += 0.1 * importanceWeight;
        }
      });

      // Check Arabic terms if present
      if (concept.arabicTerm && normalizedText.includes(concept.arabicTerm)) {
        score += 0.15;
      }
    });

    return Math.min(score, 1.0);
  }

  /**
   * Calculate conceptual match based on Islamic principles
   */
  private calculateConceptualMatch(query: string, text: string): number {
    // This would implement advanced Islamic jurisprudential and theological concept matching
    // For now, a simplified version based on common conceptual relationships

    const conceptualRelations = {
      prayer: ["worship", "devotion", "spiritual", "obligation", "ritual"],
      faith: ["belief", "iman", "conviction", "trust", "submission"],
      charity: ["zakat", "giving", "wealth", "purification", "obligation"],
      pilgrimage: ["hajj", "journey", "spiritual", "obligation", "unity"],
      fasting: [
        "ramadan",
        "self-discipline",
        "spiritual",
        "obligation",
        "purification",
      ],
    };

    let score = 0;
    const normalizedText = text.toLowerCase();
    const normalizedQuery = query.toLowerCase();

    Object.entries(conceptualRelations).forEach(([concept, related]) => {
      if (normalizedQuery.includes(concept)) {
        related.forEach((relatedTerm) => {
          if (normalizedText.includes(relatedTerm)) {
            score += 0.1;
          }
        });
      }
    });

    return Math.min(score, 1.0);
  }

  /**
   * Calculate contextual match score
   */
  private calculateContextualMatch(query: string, text: string): number {
    // Implement contextual matching based on historical periods, geographical locations, etc.
    const contextualKeywords = {
      meccan: ["mecca", "early", "persecution", "tribal"],
      medinan: ["medina", "community", "legislation", "state"],
      companions: ["sahaba", "disciples", "followers", "early muslims"],
      caliphate: ["leadership", "succession", "government", "authority"],
    };

    let score = 0;
    const normalizedText = text.toLowerCase();
    const normalizedQuery = query.toLowerCase();

    Object.entries(contextualKeywords).forEach(([context, keywords]) => {
      if (normalizedQuery.includes(context)) {
        keywords.forEach((keyword) => {
          if (normalizedText.includes(keyword)) {
            score += 0.05;
          }
        });
      }
    });

    return Math.min(score, 1.0);
  }

  /**
   * Tokenize search query
   */
  private tokenizeQuery(query: string): string[] {
    return query
      .toLowerCase()
      .replace(/[^\w\s\u0600-\u06FF]/g, " ") // Keep Arabic characters
      .split(/\s+/)
      .filter((term) => term.length > 2);
  }

  /**
   * Extract searchable text from data item
   */
  private extractSearchableText(item: any): string {
    const searchableFields = [
      "title",
      "content",
      "text",
      "description",
      "source",
      "narrator",
      "category",
    ];

    return searchableFields
      .map((field) => item[field] || "")
      .join(" ")
      .toLowerCase();
  }

  /**
   * Check if text contains Arabic characters
   */
  private containsArabic(text: string): boolean {
    return /[\u0600-\u06FF]/.test(text);
  }

  /**
   * Extract Arabic terms from text
   */
  private extractArabicTerms(text: string): string[] {
    const arabicRegex = /[\u0600-\u06FF\s]+/g;
    const matches = text.match(arabicRegex);
    return matches
      ? matches.map((match) => match.trim()).filter((term) => term.length > 0)
      : [];
  }

  /**
   * Get concept suggestions for query
   */
  getConceptSuggestions(query: string): string[] {
    const normalizedQuery = query.toLowerCase();
    const suggestions: string[] = [];

    this.concepts.forEach((concept) => {
      if (
        concept.term.toLowerCase().includes(normalizedQuery) ||
        concept.synonyms.some((syn) =>
          syn.toLowerCase().includes(normalizedQuery)
        ) ||
        concept.arabicTerm?.includes(query)
      ) {
        suggestions.push(concept.term);
      }
    });

    return suggestions.slice(0, 10); // Limit to 10 suggestions
  }

  /**
   * Get concept definition
   */
  getConceptDefinition(term: string): IslamicConcept | undefined {
    return this.concepts.get(term.toLowerCase());
  }
}

// Create singleton instance
export const islamicSemanticSearch = new IslamicSemanticSearch();
