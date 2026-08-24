import { createFileRoute } from "@tanstack/react-router";
import LoginPage from "@/pages/Login";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log In — NyumbaStay" },
      {
        name: "description",
        content: "Log in to your NyumbaStay account to access your tenant, caretaker, or landlord dashboard.",
      },
      { property: "og:title", content: "Log In — NyumbaStay" },
      {
        property: "og:description",
        content: "Log in to your NyumbaStay account to access your dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});
