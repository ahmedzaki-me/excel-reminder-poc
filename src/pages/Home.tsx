import { Link } from "react-router";
import {
  CalendarClock,
  FileSpreadsheet,
  Smartphone,
  Phone,
  MessageCircle,
} from "lucide-react";

const PHONE = "201286113602";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <section className="text-center">
        <h1 className="text-5xl font-bold">Create reminders in seconds</h1>

        <p className="mx-auto mt-5 max-w-2xl text-gray-600">
          Import Excel files, generate reminders and stay organized with an
          easy-to-use interface.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/reminder"
            className="rounded-lg bg-blue-600 px-6 py-3 text-white"
          >
            Open Reminder
          </Link>

          <Link to="/excel" className="rounded-lg border px-6 py-3">
            Import Excel
          </Link>
        </div>

        <div className="mt-10 flex justify-center gap-4">
          <a
            href={`tel:+${PHONE}`}
            className="flex items-center gap-2 rounded-lg border px-6 py-3"
          >
            <Phone size={18} />
            Call Now
          </a>

          <a
            href={`https://wa.me/${PHONE}`}
            target="_blank"
            className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-white"
          >
            <MessageCircle size={18} />
            Chat on WhatsApp
          </a>
        </div>
      </section>

      <section className="mt-20 grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border p-6">
          <FileSpreadsheet className="mb-4 text-green-600" />
          <h3 className="font-semibold">Excel Import</h3>
          <p className="mt-2 text-sm text-gray-600">
            Upload Excel files and process data instantly.
          </p>
        </div>

        <div className="rounded-xl border p-6">
          <CalendarClock className="mb-4 text-blue-600" />
          <h3 className="font-semibold">Reminder Generator</h3>
          <p className="mt-2 text-sm text-gray-600">
            Create reminder events with just a few clicks.
          </p>
        </div>

        <div className="rounded-xl border p-6">
          <Smartphone className="mb-4 text-purple-600" />
          <h3 className="font-semibold">Responsive</h3>
          <p className="mt-2 text-sm text-gray-600">
            Optimized for desktop and mobile devices.
          </p>
        </div>
      </section>
    </div>
  );
}
