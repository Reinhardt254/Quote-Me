"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession } from "@lib/auth-client";

const PromptCard = ({ post, handleTagClick, handleEdit, handleDelete }) => {
  const { data: session } = useSession();
  const pathName = usePathname();
  const [copied, setCopied] = useState(false);
  const creator = post.creator;

  const handleCopy = () => {
    setCopied(true);
    navigator.clipboard.writeText(post.prompt);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <div className="prompt_card">
      <div className="flex items-start justify-between gap-5">
        <div className="flex items-center justify-start flex-1 gap-3 cursor-pointer">
          {creator?.image ? (
            <Image
              src={creator.image}
              alt="user_image"
              width={40}
              height={40}
              className="object-contain rounded-full"
            />
          ) : null}

          <div className="flex flex-col">
            <h3 className="font-semibold text-gray-900 font-satoshi">
              {creator?.username || "Unknown"}
            </h3>
            <p className="text-sm text-gray-500 font-inter">{creator?.email}</p>
          </div>
        </div>

        <div className="copy_btn" onClick={handleCopy}>
          <Image
            src={
              copied
                ? "/assets/icons/tick.svg"
                : "/assets/icons/copy.svg"
            }
            alt={copied ? "Copied" : "Copy quote"}
            height={12}
            width={12}
          />
        </div>
      </div>

      {post.image ? (
        <div className="relative w-full mt-4 overflow-hidden rounded-lg h-44 bg-gray-100">
          <Image
            src={post.image}
            alt="Quote image"
            fill
            className="object-cover"
          />
        </div>
      ) : null}

      <p className="my-4 text-sm text-gray-700 font-satoshi">{post.prompt}</p>
      <p
        className="text-sm cursor-pointer font-inter blue_gradient"
        onClick={() => handleTagClick && handleTagClick(post.tag)}
      >
        #{post.tag}
      </p>

      {session?.user?.id === String(creator?._id) && pathName === "/profile" && (
        <div className="gap-4 pt-3 mt-5 border-t border-gray-100 flex-center">
          <p
            className="text-sm cursor-pointer font-inter green_gradient"
            onClick={handleEdit}
          >
            Edit
          </p>

          <p
            className="text-sm cursor-pointer font-inter orange_gradient"
            onClick={handleDelete}
          >
            Delete
          </p>
        </div>
      )}
    </div>
  );
};

export default PromptCard;
