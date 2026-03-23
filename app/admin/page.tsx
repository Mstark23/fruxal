// app/admin/page.tsx — redirects to /admin/overview (the real admin dashboard)
import { redirect } from "next/navigation";

export default function AdminRoot() {
  redirect("/admin/overview");
}
