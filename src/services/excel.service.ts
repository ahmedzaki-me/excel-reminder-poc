const API = "https://customerexcelapi-production.up.railway.app/api/customers";

export interface ImportExcelResponse {
  totalRows: number;
  inserted: number;
  durationMs: number;
}

interface ApiError {
  error: string;
  inner?: string;
}

export async function importExcel(file: File): Promise<ImportExcelResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API}/import`, {
    method: "POST",
    body: formData,
  });

  const data = (await response.json()) as ImportExcelResponse | ApiError;

  if (!response.ok) {
    throw new Error((data as ApiError).error);
  }

  return data as ImportExcelResponse;
}

export async function exportExcel(columns: string[]): Promise<Blob> {
  const response = await fetch(`${API}/export`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ columns }),
  });

  if (!response.ok) {
    const error = (await response.json()) as ApiError;
    throw new Error(error.error);
  }

  return response.blob();
}
