import { Outlet } from "react-router";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/shared/Header";
export default function AppLayout() {
  return (
    <main className="container mx-auto p-6">
      <Header />
      <Outlet />
      <Toaster position="top-center" richColors closeButton />
    </main>
  );
}
