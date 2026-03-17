// Fallback redirect for non-locale guide path
import { redirect } from "next/navigation";
export default function GuideFallbackPage() {
  redirect("/en/guide");
}
