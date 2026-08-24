import { createFileRoute } from "@tanstack/react-router";
import ResetPasswordPage from "@/pages/ResetPassword";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — NyumbaStay" },
      {
        name: "description",
        content: "Choose a new password for your NyumbaStay account.",
      },
      { property: "og:title", content: "Reset Password — NyumbaStay" },
      {
        property: "og:description",
        content: "Choose a new password for your NyumbaStay account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPasswordPage,
});
