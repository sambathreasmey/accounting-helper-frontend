export type POStatus = "pending" | "dispatched" | "completed" | "failed";

export interface POItem {
  department?: string;
  name: string;
  qty: number;
  packing?: string;
  price: number;
}

export interface PO {
  id: string;
  po_id: string;
  supplier_name: string;
  status: POStatus;
  items: POItem[];
  created_at: string;
  error_message?: string | null;
  file_url?: string | null;
}

export interface DashboardData {
  counts: Partial<Record<POStatus, number>>;
  recent: PO[];
}

export interface HistoryData {
  items: PO[];
  total: number;
  page: number;
  page_size: number;
}

export interface MeData {
  id?: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}
