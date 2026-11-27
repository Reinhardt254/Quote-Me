"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@lib/auth-client";
import PromptCard from "@/components/PromptCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { uploadImageFile } from "@lib/client-upload";
import { toast } from "sonner";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, refetch } = useSession();
  const userId = session?.user?.id;
  const [posts, setPosts] = useState([]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      const response = await fetch(`/api/users/${userId}/posts`);
      const data = await response.json();
      setPosts(Array.isArray(data) ? data : []);
    };
    load();
  }, [userId]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const uploaded = await uploadImageFile(file, "avatar");
      const response = await fetch("/api/user/avatar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: uploaded.url }),
      });
      if (!response.ok) throw new Error("Failed to update avatar");
      await refetch?.();
      toast.success("Avatar updated");
    } catch (error) {
      toast.error(error.message || "Avatar update failed");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (post) => {
    const confirmed = confirm("Delete this quote?");
    if (!confirmed) return;
    const response = await fetch(`/api/prompt/${post._id}`, { method: "DELETE" });
    if (!response.ok) return;
    setPosts((current) => current.filter((item) => item._id !== post._id));
    toast.success("Quote deleted");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Quotes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{posts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Signed in as
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="truncate text-lg font-semibold">
              {session?.user?.name || session?.user?.email}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Quick actions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href="/dashboard/quotes/new">Create quote</Link>
            </Button>
            <label className="inline-flex">
              <Button asChild variant="outline" size="sm" disabled={uploadingAvatar}>
                <span>{uploadingAvatar ? "Uploading…" : "Change avatar"}</span>
              </Button>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent quotes</h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/quotes">View all</Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {posts.slice(0, 6).map((post) => (
            <PromptCard
              key={post._id}
              post={post}
              handleEdit={() => router.push(`/dashboard/quotes/${post._id}`)}
              handleDelete={handleDelete}
            />
          ))}
        </div>
        {posts.length === 0 ? (
          <p className="text-muted-foreground">
            No quotes yet. Create your first poster in the studio.
          </p>
        ) : null}
      </div>
    </div>
  );
}
