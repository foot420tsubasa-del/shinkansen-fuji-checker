// Fallback redirect – middleware handles "/" → locale internally,
// but this ensures any edge case is covered.
import { redirect } from "next/navigation";
export default function RootPage() {
  redirect("/en");
}
