import { redirect } from "next/navigation";

export default function SearchRedirectPage() {
  redirect("/news#news-search");
}
