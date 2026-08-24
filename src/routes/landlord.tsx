import { createFileRoute } from "@tanstack/react-router";
import LandlordDashboardPage from "@/pages/LandlordDashboard";

export const Route = createFileRoute("/landlord")({
  head: () => ({
    meta: [
      { title: "Landlord Dashboard — NyumbaStay" },
      {
        name: "description",
        content: "Oversee rent collection, property performance, and caretaker activity from your NyumbaStay landlord dashboard.",
      },
      { property: "og:title", content: "Landlord Dashboard — NyumbaStay" },
      {
        property: "og:description",
        content: "Oversee rent collection, property performance, and caretaker activity.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandlordDashboardPage,
});
