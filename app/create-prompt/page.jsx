"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Form from "@components/Form";
import { useSession } from "@lib/auth-client";
import { uploadImageFile } from "@lib/client-upload";

const CreatePrompt = () => {
  const router = useRouter();
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

  const createPrompt = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let imageUrl = post.image || null;

      if (post.imageFile) {
        const uploaded = await uploadImageFile(post.imageFile, "quote");
        imageUrl = uploaded.url;
      }

      const response = await fetch("/api/prompt/new", {
        method: "POST",
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
      alert(error.message || "Failed to create quote");
    } finally {
      setSubmitting(false);
    }
  };

  if (isPending) {
    return <p className="desc">Loading...</p>;
  }

  if (!userId) {
    return null;
  }

  return (
    <Form
      type="create"
      post={post}
      setPost={setPost}
      submitting={submitting}
      handleSubmit={createPrompt}
    />
  );
};

export default CreatePrompt;
