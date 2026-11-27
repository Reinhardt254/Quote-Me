"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminHomePage() {
  const [stats, setStats] = useState({ quotes: 0, templates: 0, images: 0 });

  useEffect(() => {
    const load = async () => {
      const [quotesRes, templatesRes, imagesRes] = await Promise.all([
        fetch("/api/prompt"),
        fetch("/api/admin/templates"),
        fetch("/api/admin/images"),
      ]);
      const quotes = quotesRes.ok ? await quotesRes.json() : [];
      const templates = templatesRes.ok ? await templatesRes.json() : [];
      const images = imagesRes.ok ? await imagesRes.json() : [];
      setStats({
        quotes: Array.isArray(quotes) ? quotes.length : 0,
        templates: Array.isArray(templates) ? templates.length : 0,
        images: Array.isArray(images) ? images.length : 0,
      });
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Admin dashboard</h2>
        <p className="text-muted-foreground">
          Manage quotes, templates, and the image library.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Quotes</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <p className="text-3xl font-bold">{stats.quotes}</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/quotes">Open</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Templates
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <p className="text-3xl font-bold">{stats.templates}</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/templates">Open</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Images</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <p className="text-3xl font-bold">{stats.images}</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/images">Open</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
