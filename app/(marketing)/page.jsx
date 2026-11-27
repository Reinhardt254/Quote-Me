import Link from "next/link";
import Feeds from "@components/Feeds";
import TemplateStrip from "@/components/marketing/TemplateStrip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Home = () => {
  return (
    <>
      <section className="mx-auto flex w-full max-w-7xl flex-col items-center px-6 pb-8 pt-16 text-center sm:px-10 sm:pt-24">
        <Badge className="mb-4" variant="secondary">
          Quote studio for creators
        </Badge>
        <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl">
          Design quote posters that feel like a{" "}
          <span className="orange_gradient">product</span>
        </h1>
        <p className="desc text-center">
          Quote-Me helps you write, style, and download shareable quote images
          with templates built for love, life, and relationships.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/dashboard/quotes/new">Start creating</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/#templates">Browse templates</Link>
          </Button>
        </div>
      </section>

      <TemplateStrip />
      <Feeds />
    </>
  );
};

export default Home;
