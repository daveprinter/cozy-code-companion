import { createFileRoute } from "@tanstack/react-router";
import CaretakerDashboardPage from "@/pages/CaretakerDashboard";

export const Route = createFileRoute("/caretaker")({
  head: () => ({
    meta: [
      { title: "Caretaker Dashboard — NyumbaStay" },
      {
        name: "description",
        content: "Manage maintenance requests, vacancies, and tenant issues from your NyumbaStay caretaker dashboard.",
      },
      { property: "og:title", content: "Caretaker Dashboard — NyumbaStay" },
      {
        property: "og:description",
        content: "Manage maintenance requests, vacancies, and tenant issues.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CaretakerDashboardPage,
});
