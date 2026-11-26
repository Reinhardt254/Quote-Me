"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Form from "@components/Form";
import { useSession } from "@lib/auth-client";
import { uploadImageFile } from "@lib/client-upload";

const EditPrompt = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const promptId = searchParams.get("id");
  const { data: session, isPending } = useSession();
  const userId = session?.user?.id;
  const [submitting, setSubmitting] = useState(false);
  const [post, setPost] = useState({
    prompt: "",
    tag: "",
    image: "",
    imageFile: null,
  });

  useEffect(() => {
    if (!isPending && !userId) {
      router.push("/");
    }
  }, [isPending, router, userId]);

  useEffect(() => {
    const getPromptDetails = async () => {
      const response = await fetch(`/api/prompt/${promptId}`);

      if (!response.ok) return;

      const data = await response.json();

      setPost({
        prompt: data.prompt,
        tag: data.tag,
        image: data.image || "",
        imageFile: null,
      });
    };

    if (promptId) getPromptDetails();
  }, [promptId]);

  const updatePrompt = async (e) => {
    e.preventDefault();

    if (!promptId) {
      alert("Prompt ID not found");
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl = post.image || null;

      if (post.imageFile) {
        const uploaded = await uploadImageFile(post.imageFile, "quote");
        imageUrl = uploaded.url;
      }

      const response = await fetch(`/api/prompt/${promptId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: post.prompt,
          tag: post.tag,
          image: imageUrl,
        }),
      });

      if (response.ok) {
        router.push("/");
      }
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to update quote");
    } finally {
      setSubmitting(false);
    }
  };

  if (isPending || !userId) {
    return <p className="desc">Loading...</p>;
  }

  return (
    <Form
      type="Edit"
      post={post}
      setPost={setPost}
      submitting={submitting}
      handleSubmit={updatePrompt}
    />
  );
};

export default EditPrompt;
