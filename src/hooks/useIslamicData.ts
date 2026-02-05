import { useState, useEffect } from "react";
import type { IslamicData } from "../types/Types";
import IslamicDataCards from "../data/islamic_data.json";

// useIslamicData custom hook centralizes data fetching logic, loading, error, and refetch
export function useIslamicData(loadingDelay = 1000) {
  const [islamicData, setIslamicData] = useState<IslamicData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIslamicData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load from local JSON file and add missing properties
      const loadedIslamicData: IslamicData[] = (
        IslamicDataCards as unknown as Record<string, unknown>[]
      ).map(
        (item, index) =>
          ({
            ...item,
            id: (item.id as string) || `islamic-${index}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as IslamicData)
      );

      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log("useIslamicData - Loaded Islamic data:", loadedIslamicData);
        // eslint-disable-next-line no-console
        console.log("useIslamicData - Data length:", loadedIslamicData.length);
        // eslint-disable-next-line no-console
        console.log("useIslamicData - First item:", loadedIslamicData[0]);
      }

      setIslamicData(loadedIslamicData);
    } catch (error) {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("useIslamicData - Error loading data:", error);
      }
      setError("Failed to load Islamic data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Simulate loading delay for UX
    setLoading(true);
    setTimeout(() => {
      fetchIslamicData();
    }, loadingDelay);
  }, [loadingDelay]);

  // Refetch handler (re-runs the effect)
  const refetch = () => {
    fetchIslamicData();
  };

  return { islamicData, loading, error, refetch };
}
