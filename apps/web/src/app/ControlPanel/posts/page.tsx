import { FileText } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { PageHeader } from "@/components/admin/page-header";
import { PostsTable, Post, Badge } from "@/components/admin/posts-table";
import { getSessionCookieHeader } from "@/lib/server-auth";

const base = process.env.API_URL ?? "http://localhost:3001";

async function getData() {
  const authHeaders = await getSessionCookieHeader();
  try {
    const [posts, badges] = await Promise.all([
      fetch(`${base}/api/posts/all`, { cache: "no-store", headers: authHeaders }).then<Post[]>((r) =>
        r.ok ? r.json() : []
      ),
      fetch(`${base}/api/badges`, { cache: "no-store" }).then<Badge[]>((r) =>
        r.ok ? r.json() : []
      ),
    ]);
    return { posts, badges };
  } catch {
    return { posts: [], badges: [] };
  }
}

export default async function PostsAdminPage() {
  const { posts, badges } = await getData();

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader
        title="Posts"
        description="Gerencie artigos, destaques e visibilidade do blog."
        icon={FileText}
        action={<SidebarTrigger className="text-muted-foreground hover:text-foreground" />}
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <PostsTable initialPosts={posts} badges={badges} />
      </main>
    </div>
  );
}
