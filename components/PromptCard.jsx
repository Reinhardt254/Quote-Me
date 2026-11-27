"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Download } from "lucide-react";
import { useSession } from "@lib/auth-client";
import QuoteCanvas from "@/components/quote/QuoteCanvas";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { downloadQuoteAsPng } from "@/lib/download-quote";
import { toast } from "sonner";

const PromptCard = ({ post, handleTagClick, handleEdit, handleDelete }) => {
  const { data: session } = useSession();
  const pathName = usePathname();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const exportRef = useRef(null);
  const creator = post.creator;
  const layoutKey = post.template?.layoutKey || "classic";
  const canManage =
    session?.user?.id === String(creator?._id) &&
    (pathName === "/profile" || pathName?.startsWith("/dashboard"));

  const handleCopy = () => {
    setCopied(true);
    navigator.clipboard.writeText(post.prompt);
    setTimeout(() => setCopied(false), 1000);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadQuoteAsPng(exportRef.current, `quote-me-${post._id}.png`);
      toast.success("Quote image downloaded");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to download image");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-5">
          <div className="flex flex-1 items-center justify-start gap-3">
            {creator?.image ? (
              <Image
                src={creator.image}
                alt="user_image"
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="flex size-10 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                {(creator?.username || "?").slice(0, 1).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex flex-col">
              <h3 className="truncate font-semibold text-foreground">
                {creator?.username || "Unknown"}
              </h3>
              <p className="truncate text-sm text-muted-foreground">
                {creator?.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="copy_btn"
            onClick={handleCopy}
            aria-label="Copy quote"
          >
            <Image
              src={copied ? "/assets/icons/tick.svg" : "/assets/icons/copy.svg"}
              alt={copied ? "Copied" : "Copy quote"}
              height={12}
              width={12}
            />
          </button>
        </div>

        <div className="mt-4">
          <QuoteCanvas
            prompt={post.prompt}
            tag={post.tag}
            image={post.image || ""}
            layoutKey={layoutKey}
            className="mx-auto max-w-none"
          />
        </div>

        <div
          className="pointer-events-none fixed -left-[9999px] top-0 opacity-0"
          aria-hidden="true"
        >
          <QuoteCanvas
            ref={exportRef}
            prompt={post.prompt}
            tag={post.tag}
            image={post.image || ""}
            layoutKey={layoutKey}
            size="export"
          />
        </div>

        <p
          className="mt-4 cursor-pointer text-sm font-medium text-primary"
          onClick={() => handleTagClick && handleTagClick(post.tag)}
        >
          #{post.tag?.replace(/^#/, "")}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={downloading}
          >
            <Download className="size-4" />
            {downloading ? "Downloading…" : "Download"}
          </Button>

          {canManage ? (
            <>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() =>
                  handleEdit
                    ? handleEdit(post)
                    : router.push(`/dashboard/quotes/${post._id}`)
                }
              >
                Edit
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => handleDelete && handleDelete(post)}
              >
                Delete
              </Button>
            </>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

export default PromptCard;
