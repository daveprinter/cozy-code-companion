import { createFileRoute } from "@tanstack/react-router";
import RegisterPage from "@/pages/Register";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create Account — NyumbaStay" },
      {
        name: "description",
        content: "Register as a tenant, caretaker, or landlord on NyumbaStay and start managing your rental property today.",
      },
      { property: "og:title", content: "Create Account — NyumbaStay" },
      {
        property: "og:description",
        content: "Register as a tenant, caretaker, or landlord on NyumbaStay.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RegisterPage,
});
