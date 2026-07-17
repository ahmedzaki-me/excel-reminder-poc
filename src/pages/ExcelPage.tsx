import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  X,
} from "lucide-react";
import { importExcel } from "@/services/excel.service";
import { exportExcel } from "@/services/excel.service";

import ApiFaq from "@/components/shared/FAQ";

const MAX_ROWS = 1000;
const PREVIEW_ROWS = 8;
const ALL_COLUMNS: Record<string, string[]> = {
  Customers: ["Name", "Email"],
  Addresses: ["Street", "City", "Country"],
  Orders: ["ProductName", "Quantity", "Price", "OrderDate"],
};

type Status = "idle" | "reading" | "ready" | "error" | "too-large";

// A single spreadsheet cell can hold a string, number, boolean, Date, or be
// empty/null — this mirrors what XLSX.utils.sheet_to_json returns with
// `header: 1`.
type CellValue = string | number | boolean | Date | null | undefined;
type SheetRow = CellValue[];

interface FileMeta {
  name: string;
  rowCount?: number;
  rawFile?: File;
}

export default function ExcelPage() {
  const [fileMeta, setFileMeta] = useState<FileMeta | null>(null);
  const [previewRows, setPreviewRows] = useState<SheetRow[]>([]);
  const [previewHeaders, setPreviewHeaders] = useState<SheetRow>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [selectedCols, setSelectedCols] = useState<string[]>(["Name", "Email"]);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const toggleCol = (col: string) => {
    setSelectedCols((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col],
    );
  };
  const toggleTable = (tableName: string) => {
    const cols = ALL_COLUMNS[tableName];
    const allSelected = cols.every((c) => selectedCols.includes(c));
    setSelectedCols((prev) =>
      allSelected
        ? prev.filter((c) => !cols.includes(c))
        : [...new Set([...prev, ...cols])],
    );
  };

  const resetFile = () => {
    setFileMeta(null);
    setPreviewRows([]);
    setPreviewHeaders([]);
    setStatus("idle");
    setErrorMessage("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const parseFile = useCallback((file: File | null | undefined) => {
    if (!file) return;

    const validExt = /\.xlsx$/i.test(file.name);

    if (!validExt) {
      setStatus("error");
      setErrorMessage("That file type isn't supported. Upload a .xlsx file.");
      return;
    }

    setStatus("reading");
    setErrorMessage("");
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const result = e.target?.result;
        if (!result || typeof result === "string") {
          throw new Error("Unexpected file reader result");
        }
        const data = new Uint8Array(result);

        // sheetRows stops the library from parsing rows we don't need.
        // We ask for one row MORE than the limit (MAX_ROWS + 2, to also
        // account for the header row) so that a file with more than
        // MAX_ROWS data rows still produces dataRows.length > MAX_ROWS
        // instead of being capped exactly at MAX_ROWS and passing by mistake.
        const workbook = XLSX.read(data, {
          type: "array",
          sheetRows: MAX_ROWS + 2,
        });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json<SheetRow>(sheet, {
          header: 1,
          blankrows: false,
        });
        const [headerRow, ...dataRows] = rows;

        if (dataRows.length > MAX_ROWS) {
          setStatus("too-large");
          setFileMeta({ name: file.name });
          setPreviewRows([]);
          setPreviewHeaders([]);
          return;
        }

        setFileMeta({
          name: file.name,
          rowCount: dataRows.length,
          rawFile: file,
        });
        setPreviewHeaders(headerRow || []);
        setPreviewRows(dataRows.slice(0, PREVIEW_ROWS));
        setStatus("ready");
      } catch (err) {
        setStatus("error");
        setErrorMessage(
          "Couldn't read that file. Make sure it's a valid Excel workbook.",
        );
        console.log(err);
      }
    };
    reader.onerror = () => {
      setStatus("error");
      setErrorMessage(
        "Something went wrong while reading the file. Try again.",
      );
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    parseFile(file);
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    parseFile(file);
  };

  const handleUpload = async () => {
    if (!fileMeta?.rawFile) return;

    try {
      setIsSending(true);

      const result = await importExcel(fileMeta.rawFile);

      console.log(result);
      if (result) {
        resetFile();
        toast.success(`import have been Success `, {
          description: `duration ${result.durationMs} Ms ,inserted ${result.inserted} ,totalRows ${result.totalRows}`,
        });
      }
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  };

  const handleExport = async () => {
    if (!selectedCols.length) {
      toast.error("Select at least one column");
      return;
    }

    try {
      setIsExporting(true);
      const blob = await exportExcel(selectedCols);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "customers.xlsx";
      a.click();

      URL.revokeObjectURL(url);
      toast.success("Export have been Success");
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  };
  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Excel Import &amp; Export
        </h1>
        <p className="text-sm text-muted-foreground">
          Upload a workbook to validate and preview it, or pull data from the
          server as a spreadsheet.
        </p>
      </div>

      {/* Import */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Import a file</CardTitle>
          <CardDescription>
            Accept .xlsx Files with more than {MAX_ROWS.toLocaleString()} data
            rows need to be split first.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {!fileMeta && status !== "reading" && (
            <label
              htmlFor="excel-upload"
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-14 text-center transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/40"
              }`}
            >
              <UploadCloud className="h-9 w-9 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  Drag a file here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  .xlsx , up to {MAX_ROWS.toLocaleString()} rows
                </p>
              </div>
              <input
                id="excel-upload"
                ref={inputRef}
                type="file"
                accept=".xlsx"
                className="hidden"
                onChange={handleInputChange}
              />
            </label>
          )}

          {status === "reading" && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-14 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary" />
              <p className="text-sm text-muted-foreground">Reading file…</p>
            </div>
          )}

          {status === "error" && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Upload failed</AlertTitle>
              <AlertDescription className="flex items-center justify-between gap-4">
                <span>{errorMessage}</span>
                <Button variant="outline" size="sm" onClick={resetFile}>
                  Try again
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {status === "too-large" && fileMeta && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>File too large to import</AlertTitle>
              <AlertDescription className="space-y-3">
                <p>
                  <span className="font-medium">{fileMeta.name}</span> has more
                  than{" "}
                  <span className="font-medium">
                    {MAX_ROWS.toLocaleString()}
                  </span>{" "}
                  data rows. Split it into smaller files and upload each one
                  separately.
                </p>
                <Button variant="outline" size="sm" onClick={resetFile}>
                  Choose a different file
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {status === "ready" && fileMeta && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                    <FileSpreadsheet className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{fileMeta.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {fileMeta.rowCount?.toLocaleString()} rows
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetFile}
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {previewRows.length > 0 && (
                <div className="rounded-lg border">
                  <div className="border-b bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground">
                    Preview — first {previewRows.length} rows
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {previewHeaders.map((h, i) => (
                            <TableHead key={i} className="whitespace-nowrap">
                              {String(h ?? `Column ${i + 1}`)}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewRows.map((row, ri) => (
                          <TableRow key={ri}>
                            {previewHeaders.map((_, ci) => (
                              <TableCell key={ci} className="whitespace-nowrap">
                                {String(row[ci] ?? "")}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={handleUpload} disabled={isSending}>
                  {isSending ? "Sending…" : "Send to server"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Export */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Export from server</CardTitle>
          <CardDescription>
            Request the latest data and download it as an Excel file.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-4">
            {Object.entries(ALL_COLUMNS).map(([table, cols]) => {
              const allSelected = cols.every((c) => selectedCols.includes(c));
              const someSelected = cols.some((c) => selectedCols.includes(c));

              return (
                <div key={table} className="space-y-2 rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`table-${table}`}
                      checked={allSelected}
                      ref={(el: HTMLInputElement | null) => {
                        if (el && someSelected && !allSelected) {
                          el.indeterminate = true;
                        }
                      }}
                      onCheckedChange={() => toggleTable(table)}
                    />

                    <Label
                      htmlFor={`table-${table}`}
                      className="text-sm font-semibold"
                    >
                      {table}
                    </Label>
                  </div>

                  <div className="ml-6 flex flex-wrap gap-x-6 gap-y-2">
                    {cols.map((col) => (
                      <div key={col} className="flex items-center gap-2">
                        <Checkbox
                          id={`col-${col}`}
                          checked={selectedCols.includes(col)}
                          onCheckedChange={() => toggleCol(col)}
                        />
                        <Label
                          htmlFor={`col-${col}`}
                          className="text-sm font-normal text-muted-foreground"
                        >
                          {col}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Full data export</p>
              <p className="text-xs text-muted-foreground">
                {selectedCols.length
                  ? `${selectedCols.length} column${selectedCols.length > 1 ? "s" : ""} selected`
                  : "No columns selected"}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={isExporting || !selectedCols.length}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {isExporting ? "Preparing…" : "Download .xlsx"}
            </Button>
          </div>
        </CardContent>
      </Card>
      <Separator />
      <ApiFaq />
    </div>
  );
}
