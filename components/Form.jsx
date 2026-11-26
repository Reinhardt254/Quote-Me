"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const Form = ({ type, post, setPost, submitting, handleSubmit }) => {
  const [previewUrl, setPreviewUrl] = useState(post.image || "");

  useEffect(() => {
    setPreviewUrl(post.image || "");
  }, [post.image]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    if (!file) {
      setPreviewUrl(post.image || "");
      setPost({ ...post, imageFile: null });
      return;
    }

    const nextPreview = URL.createObjectURL(file);
    setPreviewUrl(nextPreview);
    setPost({ ...post, imageFile: file });
  };

  return (
    <section className="flex-col w-full max-w-full flex-start">
      <h1 className="text-left head_text">
        <span className="blue_gradient">{type} Post</span>
      </h1>
      <p className="max-w-md text-left desc">
        {type} and share amazing quotes with the world, and let your imagination
        and thoughts run wild with others
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-full max-w-2xl mt-10 gap-7 glassmorphism"
      >
        <label>
          <span className="text-base font-semibold text-green-500 font-satoshi">
            Quote Me
          </span>

          <textarea
            value={post.prompt}
            onChange={(e) => setPost({ ...post, prompt: e.target.value })}
            placeholder="Write your quote here...."
            required
            className="form_textarea"
          />
        </label>

        <label>
          <span className="text-base font-semibold text-green-500 font-satoshi">
            Tag {` `}
            <span className="font-normal">(#love, #relationship #life)</span>
          </span>

          <input
            value={post.tag}
            onChange={(e) => setPost({ ...post, tag: e.target.value })}
            placeholder="#tag"
            required
            className="form_input"
          />
        </label>

        <label>
          <span className="text-base font-semibold text-green-500 font-satoshi">
            Image {` `}
            <span className="font-normal">(optional)</span>
          </span>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageChange}
            className="form_input"
          />
        </label>

        {previewUrl ? (
          <div className="relative w-full overflow-hidden rounded-lg h-52 bg-gray-100">
            <Image
              src={previewUrl}
              alt="Quote preview"
              fill
              unoptimized={previewUrl.startsWith("blob:")}
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="gap-4 mx-3 mb-5 flex-end">
          <Link href="/" className="text-sm text-gray-500">
            cancel
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-1.5 text-sm bg-primary-orange rounded-full text-white"
          >
            {submitting ? `${type}...` : type}
          </button>
        </div>
      </form>
    </section>
  );
};

export default Form;
