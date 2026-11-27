"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import QuoteCanvas from "@/components/quote/QuoteCanvas";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SAMPLE =
  "The best relationships are built on small, consistent acts of kindness.";

const TemplateStrip = () => {
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    const load = async () => {
      const response = await fetch("/api/templates");
      if (!response.ok) return;
      const data = await response.json();
      setTemplates(Array.isArray(data) ? data : []);
    };
    load();
  }, []);

  return (
    <section id="templates" className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-10">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="secondary" className="mb-3">
            Templates
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight">
            Six ready-to-ship quote layouts
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Pick a template, drop in your words and an image, then download a
            square poster for social.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/quotes/new">Open studio</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {template.description}
              </p>
            </CardHeader>
            <CardContent>
              <QuoteCanvas
                prompt={SAMPLE}
                tag="love"
                image={template.defaultImage?.url || ""}
                layoutKey={template.layoutKey}
                className="mx-auto"
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default TemplateStrip;
