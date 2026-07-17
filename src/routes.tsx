import { createBrowserRouter } from "react-router";

import AppLayout from "@/layouts/AppLayout";
import Home from "@/pages/Home";
import ExcelPage from "@/pages/ExcelPage";
import ReminderPage from "@/pages/ReminderPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "excel",
        element: <ExcelPage />,
      },
      {
        path: "reminder",
        element: <ReminderPage />,
      },
    ],
  },
]);
