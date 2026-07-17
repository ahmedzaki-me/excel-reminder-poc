import { CalendarDays, Phone, MessageCircle } from "lucide-react";
import { Link, NavLink } from "react-router";

const PHONE = "201234567890";

export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold">
          <CalendarDays className="h-6 w-6 text-blue-600" />
          Reminder Tools
        </Link>

        <nav className="flex gap-6">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/excel">Excel</NavLink>
          <NavLink to="/reminder">Reminder</NavLink>
        </nav>

        <div className="flex gap-3">
          <a
            href={`tel:+${PHONE}`}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-100"
          >
            <Phone size={18} />
            Call
          </a>

          <a
            href={`https://wa.me/${PHONE}`}
            target="_blank"
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            <MessageCircle size={18} />
            WhatsApp
          </a>
        </div>
      </div>
    </header>
  );
}
