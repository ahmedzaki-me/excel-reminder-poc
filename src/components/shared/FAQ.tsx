import { useState, type ReactNode, type ComponentType } from "react";
import {
  ChevronDown,
  FileSpreadsheet,
  Copy,
  FileType,
  HardDrive,
  Sheet,
  CalendarDays,
  FileWarning,
  type LucideProps,
} from "lucide-react";

/**
 * ApiFaq
 * -------
 * Drop-in FAQ block for the Excel Import/Export API.
 * Built with Tailwind + shadcn-style primitives (no external UI deps
 * beyond lucide-react, so it works in any Vite/React + Tailwind setup).
 *
 * Usage:
 *   import ApiFaq from "./ApiFaq";
 *   <ApiFaq />
 */

interface FaqItemData {
  icon: ComponentType<LucideProps>;
  question: string;
  answer: ReactNode;
}

const FAQ_ITEMS: FaqItemData[] = [
  {
    icon: FileSpreadsheet,
    question: "Can I send an Excel file with only some columns?",
    answer: (
      <>
        Yes! The API is flexible:
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <span className="font-medium text-foreground">Import:</span> only{" "}
            <Code>Name</Code> and <Code>Email</Code> are required. All other
            columns are optional.
          </li>
          <li>
            <span className="font-medium text-foreground">Export:</span> request
            any combination of columns. The API only queries the needed tables.
          </li>
        </ul>
      </>
    ),
  },
  {
    icon: Copy,
    question: "What happens if I import the same file twice?",
    answer: (
      <>
        Customers are deduplicated by <Code>Name + Email</Code>. Addresses are
        deduplicated per customer.{" "}
        <span className="font-medium text-destructive">
          Orders are NOT deduplicated
        </span>{" "}
        — each import creates new orders.
      </>
    ),
  },
  {
    icon: FileType,
    question: "What Excel format is supported?",
    answer: (
      <>
        Only <Code>.xlsx</Code> format (Office Open XML) is supported. Old{" "}
        <Code>.xls</Code> format is <span className="font-medium">NOT</span>{" "}
        supported.
      </>
    ),
  },
  {
    icon: HardDrive,
    question: "What's the max file size?",
    answer: <>50 MB.</>,
  },
  {
    icon: Sheet,
    question: "Can I import from a Google Sheet?",
    answer: (
      <>
        Export the Google Sheet as <Code>.xlsx</Code> first, then upload the
        file.
      </>
    ),
  },
  {
    icon: CalendarDays,
    question: "What date format should I use for OrderDate?",
    answer: (
      <>
        Use <Code>YYYY-MM-DD</Code> format (e.g. <Code>2026-01-15</Code>).
      </>
    ),
  },
  {
    icon: FileWarning,
    question: "The export file is empty / has no data",
    answer: (
      <>
        Check that you've imported data first. The export queries the database —
        if there's no data, the Excel file will have headers only.
      </>
    ),
  },
];

function Code({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
      {children}
    </code>
  );
}

interface FaqItemProps {
  item: FaqItemData;
  isOpen: boolean;
  onToggle: () => void;
}

function FaqItem({ item, isOpen, onToggle }: FaqItemProps) {
  const Icon = item.icon;
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card transition-colors">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-accent/50 sm:px-5"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4.5 w-4.5" strokeWidth={2} />
        </span>
        <span className="flex-1 text-sm font-medium leading-snug text-foreground sm:text-base">
          {item.question}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-200 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pl-13 text-sm leading-relaxed text-muted-foreground sm:px-5 sm:pl-15">
            {item.answer}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ApiFaq() {
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <section className="w-full bg-background px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center sm:mb-10">
          <span className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            Excel Import / Export API
          </span>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Frequently asked questions
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Everything you need to know before wiring up your import/export
            flow.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {FAQ_ITEMS.map((item, index) => (
            <FaqItem
              key={item.question}
              item={item}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
