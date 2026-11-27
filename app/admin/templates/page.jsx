"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const LAYOUTS = [
  "classic",
  "gradient",
  "poster",
  "overlay",
  "split",
  "editorial",
];

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [images, setImages] = useState([]);

  const load = async () => {
    const [templatesRes, imagesRes] = await Promise.all([
      fetch("/api/admin/templates"),
      fetch("/api/admin/images"),
    ]);
    setTemplates(templatesRes.ok ? await templatesRes.json() : []);
    setImages(imagesRes.ok ? await imagesRes.json() : []);
  };

  useEffect(() => {
    load();
  }, []);

  const saveTemplate = async (template, patch) => {
    const response = await fetch(`/api/admin/templates/${template.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!response.ok) {
      toast.error("Failed to update template");
      return;
    }
    toast.success("Template saved");
    load();
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Templates</h2>
        <p className="text-muted-foreground">
          Rename, activate, and assign default images or layouts.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle className="text-lg">{template.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  defaultValue={template.name}
                  onBlur={(e) => {
                    if (e.target.value !== template.name) {
                      saveTemplate(template, { name: e.target.value });
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  defaultValue={template.description}
                  onBlur={(e) => {
                    if (e.target.value !== template.description) {
                      saveTemplate(template, { description: e.target.value });
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Layout</Label>
                <Select
                  value={template.layoutKey}
                  onValueChange={(layoutKey) =>
                    saveTemplate(template, { layoutKey })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LAYOUTS.map((layout) => (
                      <SelectItem key={layout} value={layout}>
                        {layout}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Default image</Label>
                <Select
                  value={template.defaultImageId || "none"}
                  onValueChange={(value) =>
                    saveTemplate(template, {
                      defaultImageId: value === "none" ? null : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Default image" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {images.map((image) => (
                      <SelectItem key={image.id} value={image.id}>
                        {image.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">Active</p>
                  <p className="text-sm text-muted-foreground">
                    Show in the public template strip and studio.
                  </p>
                </div>
                <Button
                  type="button"
                  variant={template.active ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    saveTemplate(template, { active: !template.active })
                  }
                >
                  {template.active ? "On" : "Off"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
