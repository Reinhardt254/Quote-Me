"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState([]);
  const [templates, setTemplates] = useState([]);

  const load = async () => {
    const [quotesRes, templatesRes] = await Promise.all([
      fetch("/api/prompt"),
      fetch("/api/admin/templates"),
    ]);
    setQuotes(quotesRes.ok ? await quotesRes.json() : []);
    setTemplates(templatesRes.ok ? await templatesRes.json() : []);
  };

  useEffect(() => {
    load();
  }, []);

  const handleTemplateChange = async (quoteId, templateId) => {
    const response = await fetch(`/api/prompt/${quoteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: quotes.find((q) => q._id === quoteId)?.prompt,
        tag: quotes.find((q) => q._id === quoteId)?.tag,
        image: quotes.find((q) => q._id === quoteId)?.image || null,
        templateId: templateId === "none" ? null : templateId,
      }),
    });

    if (!response.ok) {
      toast.error("Failed to update template");
      return;
    }
    toast.success("Template updated");
    load();
  };

  const handleDelete = async (id) => {
    const confirmed = confirm("Delete this quote?");
    if (!confirmed) return;
    const response = await fetch(`/api/prompt/${id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Failed to delete");
      return;
    }
    toast.success("Deleted");
    load();
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">All quotes</h2>
        <p className="text-muted-foreground">
          Edit, reassign templates, or delete any quote.
        </p>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quote</TableHead>
              <TableHead>Creator</TableHead>
              <TableHead>Template</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.map((quote) => (
              <TableRow key={quote._id}>
                <TableCell className="max-w-xs truncate font-medium">
                  {quote.prompt}
                </TableCell>
                <TableCell>{quote.creator?.username || quote.creator?.email}</TableCell>
                <TableCell>
                  <Select
                    value={quote.templateId || "none"}
                    onValueChange={(value) =>
                      handleTemplateChange(quote._id, value)
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/dashboard/quotes/${quote._id}`}>Edit</Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(quote._id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
