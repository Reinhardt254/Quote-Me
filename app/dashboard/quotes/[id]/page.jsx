"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import QuoteEditor from "@/components/quote/QuoteEditor";

export default function EditQuotePage() {
  const params = useParams();
  const id = params?.id;
  const [post, setPost] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const response = await fetch(`/api/prompt/${id}`);
      if (!response.ok) {
        setError("Quote not found");
        return;
      }
      const data = await response.json();
      setPost(data);
    };
    load();
  }, [id]);

  if (error) {
    return <p className="text-destructive">{error}</p>;
  }

  if (!post) {
    return <p className="text-muted-foreground">Loading quote…</p>;
  }

  return (
    <QuoteEditor
      mode="edit"
      quoteId={id}
      initialPost={{
        prompt: post.prompt,
        tag: post.tag,
        image: post.image || "",
        templateId: post.templateId || "",
      }}
    />
  );
}
