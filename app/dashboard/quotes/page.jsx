"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PromptCard from "@/components/PromptCard";
import { Button } from "@/components/ui/button";
import { useSession } from "@lib/auth-client";
import { toast } from "sonner";

export default function MyQuotesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      const response = await fetch(`/api/users/${userId}/posts`);
      const data = await response.json();
      setPosts(Array.isArray(data) ? data : []);
    };
    load();
  }, [userId]);

  const handleDelete = async (post) => {
    const confirmed = confirm("Delete this quote?");
    if (!confirmed) return;
    const response = await fetch(`/api/prompt/${post._id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Failed to delete");
      return;
    }
    setPosts((current) => current.filter((item) => item._id !== post._id));
    toast.success("Quote deleted");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">My quotes</h2>
          <p className="text-muted-foreground">
            Edit, download, or delete your posters.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/quotes/new">New quote</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post) => (
          <PromptCard
            key={post._id}
            post={post}
            handleEdit={() => router.push(`/dashboard/quotes/${post._id}`)}
            handleDelete={handleDelete}
          />
        ))}
      </div>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">You have not created any quotes yet.</p>
      ) : null}
    </div>
  );
}
