import { redirect } from "next/navigation";

const SLUG_TO_CATEGORY: Record<string, string> = {
  news: "News",
  politics: "Politics",
  entertainment: "Entertainment",
  sports: "Sports",
  business: "Business",
  technology: "Technology",
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function NewsCategoryHubPage({ params }: PageProps) {
  const { slug } = await params;
  const key = slug.toLowerCase();
  const category = SLUG_TO_CATEGORY[key];
  if (!category) {
    redirect("/news");
  }
  redirect(`/news?category=${encodeURIComponent(category)}`);
}
