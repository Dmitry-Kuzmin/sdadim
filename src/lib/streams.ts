/** Помощники по потокам — без React: используются и в островах, и в обычных <script> */
import { spotsLeft, type StreamInfo } from "@/lib/course-data";

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }).format(new Date(iso + "T00:00:00"));

export const openStreams = (streams: StreamInfo[]) => streams.filter((s) => spotsLeft(s) > 0);
export const startLine = (s: StreamInfo) => `Старт ${formatDate(s.start_date)} · осталось ${spotsLeft(s)} мест`;
