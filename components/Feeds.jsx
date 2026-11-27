"use client";

import { useEffect, useMemo, useState } from "react";
import PromptCard from "./PromptCard";
import { Input } from "@/components/ui/input";

const PromptCardList = ({ data, handleTagClick }) => {
  return (
    <div className="mt-10 grid w-full gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {data.map((post) => (
        <PromptCard
          key={post._id}
          post={post}
          handleTagClick={handleTagClick}
        />
      ))}
    </div>
  );
};

const Feeds = () => {
  const [searchText, setSearchText] = useState("");
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const response = await fetch("/api/prompt");
      const data = await response.json();
      setPosts(Array.isArray(data) ? data : []);
    };

    fetchPosts();
  }, []);

  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((post) => {
      return (
        post.prompt?.toLowerCase().includes(q) ||
        post.tag?.toLowerCase().includes(q) ||
        post.creator?.username?.toLowerCase().includes(q)
      );
    });
  }, [posts, searchText]);

  return (
    <section id="feed" className="mx-auto w-full max-w-7xl px-6 pb-20 sm:px-10">
      <div className="mb-6 flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Discover quotes</h2>
        <p className="text-muted-foreground">
          Browse community quotes and download any poster.
        </p>
      </div>

      <form className="relative w-full max-w-xl" onSubmit={(e) => e.preventDefault()}>
        <Input
          type="text"
          placeholder="Search quotes, tags, or creators…"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="h-11"
        />
      </form>

      <PromptCardList data={filtered} handleTagClick={(tag) => setSearchText(tag)} />
    </section>
  );
};

export default Feeds;
