import { createFileRoute } from "@tanstack/react-router";
import ForgotPasswordPage from "@/pages/ForgotPassword";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — NyumbaStay" },
      {
        name: "description",
        content: "Reset your NyumbaStay account password via email.",
      },
      { property: "og:title", content: "Forgot Password — NyumbaStay" },
      {
        property: "og:description",
        content: "Reset your NyumbaStay account password via email.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ForgotPasswordPage,
});
