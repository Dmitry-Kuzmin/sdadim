import { useEffect, useState } from "react";
import { loadPlanPrices, loadStreams, type StreamInfo } from "@/lib/course-data";
import type { DbPlanPrices } from "@/lib/plans";

export function useStreams() {
  const [streams, setStreams] = useState<StreamInfo[]>([]);
  useEffect(() => {
    loadStreams().then(setStreams);
  }, []);
  return streams;
}

export function usePlanPrices() {
  const [prices, setPrices] = useState<DbPlanPrices | undefined>(undefined);
  useEffect(() => {
    loadPlanPrices().then((p) => p && setPrices(p));
  }, []);
  return prices;
}
