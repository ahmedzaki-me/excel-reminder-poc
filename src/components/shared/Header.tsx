import { CalendarDays, Menu } from "lucide-react";
import { Link, NavLink } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";

import { useState } from "react";
const links = [
  { to: "/", label: "Home" },
  { to: "/excel", label: "Excel" },
  { to: "/reminder", label: "Reminder" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
          <CalendarDays className="h-6 w-6 text-primary" />
          Reminder Tools
        </Link>

        {/* Desktop */}
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                isActive
                  ? "font-medium text-primary"
                  : "text-muted-foreground transition-colors hover:text-foreground"
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="md:hidden" />
            }
          >
            <Menu className="h-6 w-6" />
          </SheetTrigger>

          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle>Enexabit</SheetTitle>
              <SheetDescription>
                Import Excel files, generate reminders and stay organized with
                an easy-to-use interface.
              </SheetDescription>
            </SheetHeader>

            <nav className="mt-8 flex flex-col gap-2">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2 transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`
                  }
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <SheetFooter>
              <SheetClose render={<Button variant="outline">Close</Button>} />
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
