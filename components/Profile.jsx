"use client";

import Image from "next/image";
import PromptCard from "./PromptCard";

const Profile = ({
  name,
  desc,
  data,
  handleEdit,
  handleDelete,
  avatarUrl,
  onAvatarChange,
  uploadingAvatar,
}) => {
  return (
    <section className="w-full">
      <h1 className="head_text text_left">
        <span className="blue_gradient"> {name} Profile </span>
      </h1>

      <p className="desc text-left">{desc}</p>

      <div className="flex items-center gap-4 mt-8">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt="avatar"
            width={72}
            height={72}
            className="object-cover rounded-full"
          />
        ) : (
          <div className="flex items-center justify-center w-[72px] h-[72px] rounded-full bg-gray-200 text-sm text-gray-500">
            No photo
          </div>
        )}

        <label className="text-sm cursor-pointer font-inter">
          <span className="black_btn">
            {uploadingAvatar ? "Uploading..." : "Change avatar"}
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            disabled={uploadingAvatar}
            onChange={onAvatarChange}
          />
        </label>
      </div>

      <div className="mt-10 prompt_layout">
        {data.map((post) => (
          <PromptCard
            key={post._id}
            post={post}
            handleEdit={() => handleEdit && handleEdit(post)}
            handleDelete={() => handleDelete && handleDelete(post)}
          />
        ))}
      </div>
    </section>
  );
};

export default Profile;
