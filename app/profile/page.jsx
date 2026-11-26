"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Profile from "@components/Profile";
import { useSession } from "@lib/auth-client";
import { uploadImageFile } from "@lib/client-upload";

const MyProfile = () => {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();
  const userId = session?.user?.id;
  const [posts, setPosts] = useState([]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (isPending) return;

    if (!userId) {
      router.push("/");
      return;
    }

    const fetchPosts = async () => {
      const response = await fetch(`/api/users/${userId}/posts`);
      const data = await response.json();
      setPosts(Array.isArray(data) ? data : []);
    };

    fetchPosts();
  }, [isPending, router, userId]);

  const handleEdit = (post) => {
    router.push(`/update-prompt?id=${post._id}`);
  };

  const handleDelete = async (post) => {
    const hasConfirmed = confirm("Are you sure you want to delete this prompt?");

    if (!hasConfirmed) return;

    try {
      const response = await fetch(`/api/prompt/${post._id.toString()}`, {
        method: "DELETE",
      });

      if (!response.ok) return;

      setPosts((current) => current.filter((item) => item._id !== post._id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);

    try {
      const uploaded = await uploadImageFile(file, "avatar");
      const response = await fetch("/api/user/avatar", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: uploaded.url }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update avatar");
      }

      await refetch?.();
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to update avatar");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  if (isPending) {
    return <p className="desc">Loading profile...</p>;
  }

  if (!session?.user) {
    return null;
  }

  return (
    <Profile
      name="my"
      desc="Welcome to your personalized profile page"
      data={posts}
      handleEdit={handleEdit}
      handleDelete={handleDelete}
      avatarUrl={session.user.image}
      onAvatarChange={handleAvatarChange}
      uploadingAvatar={uploadingAvatar}
    />
  );
};

export default MyProfile;
