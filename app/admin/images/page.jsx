"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadImageFile } from "@lib/client-upload";
import { toast } from "sonner";

export default function AdminImagesPage() {
  const [images, setImages] = useState([]);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    const response = await fetch("/api/admin/images");
    setImages(response.ok ? await response.json() : []);
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await uploadImageFile(file, "quote");
      const response = await fetch("/api/admin/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || file.name,
          url: uploaded.url,
          alt: title || file.name,
        }),
      });
      if (!response.ok) throw new Error("Failed to save image");
      setTitle("");
      toast.success("Image added");
      load();
    } catch (error) {
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (id) => {
    const confirmed = confirm("Delete this library image?");
    if (!confirmed) return;
    const response = await fetch(`/api/admin/images/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      toast.error("Failed to delete");
      return;
    }
    toast.success("Image deleted");
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Image library</h2>
        <p className="text-muted-foreground">
          Upload new backgrounds or remove unused library images.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload image</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Sunset abstract"
            />
          </div>
          <label>
            <Button asChild disabled={uploading}>
              <span>{uploading ? "Uploading…" : "Choose file"}</span>
            </Button>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleUpload}
            />
          </label>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {images.map((image) => (
          <Card key={image.id} className="overflow-hidden">
            <div className="relative aspect-square bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.alt}
                className="h-full w-full object-cover"
              />
            </div>
            <CardContent className="space-y-3 p-4">
              <div>
                <p className="font-medium">{image.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {image.url}
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(image.id)}
              >
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
