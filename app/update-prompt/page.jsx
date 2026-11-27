import { redirect } from "next/navigation";

export default async function UpdatePromptRedirect({ searchParams }) {
  const params = await searchParams;
  const id = params?.id;
  if (id) {
    redirect(`/dashboard/quotes/${id}`);
  }
  redirect("/dashboard/quotes");
}
