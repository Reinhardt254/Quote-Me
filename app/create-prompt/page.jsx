import { redirect } from "next/navigation";

export default function CreatePromptRedirect() {
  redirect("/dashboard/quotes/new");
}
