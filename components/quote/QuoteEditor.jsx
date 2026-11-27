"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Save, Trash2 } from "lucide-react";
import QuoteCanvas from "@/components/quote/QuoteCanvas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { downloadQuoteAsPng } from "@/lib/download-quote";
import { uploadImageFile } from "@lib/client-upload";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function QuoteEditor({
  mode = "create",
  quoteId = null,
  initialPost = null,
}) {
  const router = useRouter();
  const exportRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [images, setImages] = useState([]);
  const [post, setPost] = useState({
    prompt: initialPost?.prompt || "",
    tag: initialPost?.tag || "",
    image: initialPost?.image || "",
    templateId: initialPost?.templateId || "",
    imageFile: null,
  });

  useEffect(() => {
    const load = async () => {
      const [tplRes, imgRes] = await Promise.all([
        fetch("/api/templates"),
        fetch("/api/library"),
      ]);
      const tplData = tplRes.ok ? await tplRes.json() : [];
      const imgData = imgRes.ok ? await imgRes.json() : [];
      setTemplates(Array.isArray(tplData) ? tplData : []);
      setImages(Array.isArray(imgData) ? imgData : []);

      if (!post.templateId && Array.isArray(tplData) && tplData[0]) {
        const first = tplData[0];
        setPost((current) => ({
          ...current,
          templateId: current.templateId || first.id,
          image:
            current.image ||
            first.defaultImage?.url ||
            "",
        }));
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedTemplate = useMemo(
    () => templates.find((item) => item.id === post.templateId) || null,
    [templates, post.templateId]
  );

  const layoutKey = selectedTemplate?.layoutKey || "classic";

  const handleTemplateSelect = (template) => {
    setPost((current) => ({
      ...current,
      templateId: template.id,
      image: current.image || template.defaultImage?.url || "",
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let imageUrl = post.image || null;

      if (post.imageFile) {
        const uploaded = await uploadImageFile(post.imageFile, "quote");
        imageUrl = uploaded.url;
      }

      const payload = {
        prompt: post.prompt,
        tag: post.tag.replace(/^#/, ""),
        image: imageUrl,
        templateId: post.templateId || null,
      };

      const response = await fetch(
        mode === "edit" ? `/api/prompt/${quoteId}` : "/api/prompt/new",
        {
          method: mode === "edit" ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save quote");
      }

      const data = await response.json();
      toast.success(mode === "edit" ? "Quote updated" : "Quote created");
      router.push(`/dashboard/quotes/${data._id}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to save quote");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!quoteId) return;
    const confirmed = confirm("Delete this quote?");
    if (!confirmed) return;

    const response = await fetch(`/api/prompt/${quoteId}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Failed to delete quote");
      return;
    }
    toast.success("Quote deleted");
    router.push("/dashboard/quotes");
  };

  const handleDownload = async () => {
    try {
      await downloadQuoteAsPng(
        exportRef.current,
        `quote-me-${quoteId || "draft"}.png`
      );
      toast.success("Quote image downloaded");
    } catch (error) {
      toast.error(error.message || "Download failed");
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{mode === "edit" ? "Edit quote" : "Create quote"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Quote</Label>
              <Textarea
                id="prompt"
                required
                value={post.prompt}
                onChange={(e) => setPost({ ...post, prompt: e.target.value })}
                placeholder="Write your quote…"
                className="min-h-32"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tag">Tag</Label>
              <Input
                id="tag"
                required
                value={post.tag}
                onChange={(e) => setPost({ ...post, tag: e.target.value })}
                placeholder="love"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="upload">Upload custom image</Label>
              <Input
                id="upload"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setPost({
                    ...post,
                    imageFile: file,
                    image: file ? URL.createObjectURL(file) : post.image,
                  });
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Template</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => handleTemplateSelect(template)}
                className={cn(
                  "rounded-xl border p-3 text-left transition hover:border-primary",
                  post.templateId === template.id
                    ? "border-primary bg-primary/5"
                    : "border-border"
                )}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="font-semibold">{template.name}</span>
                  {post.templateId === template.id ? (
                    <Badge>Selected</Badge>
                  ) : null}
                </div>
                <p className="text-xs text-muted-foreground">
                  {template.description}
                </p>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Background image</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((image) => (
              <button
                key={image.id}
                type="button"
                onClick={() =>
                  setPost({ ...post, image: image.url, imageFile: null })
                }
                className={cn(
                  "relative aspect-square overflow-hidden rounded-lg border",
                  post.image === image.url
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.alt}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={submitting}>
            <Save className="size-4" />
            {submitting ? "Saving…" : "Save quote"}
          </Button>
          <Button type="button" variant="outline" onClick={handleDownload}>
            <Download className="size-4" />
            Download PNG
          </Button>
          {mode === "edit" ? (
            <Button type="button" variant="destructive" onClick={handleDelete}>
              <Trash2 className="size-4" />
              Delete
            </Button>
          ) : null}
        </div>
      </form>

      <div className="xl:sticky xl:top-20">
        <Card>
          <CardHeader>
            <CardTitle>Live preview</CardTitle>
          </CardHeader>
          <CardContent>
            <QuoteCanvas
              prompt={post.prompt}
              tag={post.tag}
              image={post.image}
              layoutKey={layoutKey}
              className="mx-auto"
            />
          </CardContent>
        </Card>
      </div>

      <div
        className="pointer-events-none fixed -left-[9999px] top-0 opacity-0"
        aria-hidden="true"
      >
        <QuoteCanvas
          ref={exportRef}
          prompt={post.prompt}
          tag={post.tag}
          image={post.image}
          layoutKey={layoutKey}
          size="export"
        />
      </div>
    </div>
  );
}
