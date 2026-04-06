"use server";

import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const metadata: Metadata = {
    title: "Bringing Developer Experience to Word Processors | VimNotion",
    description: "",
    openGraph: {
      title: "Bringing Developer Experience to Word Processors | VimNotion",
      description: "",
      type: "article",
    },
  };
  return metadata;
}

export default async function WritingExperiencePage() {
  return (
    <div className="px-2 w-full flex flex-col items-center pt-4">
      <div id="md-editor-blog" className="flex flex-col w-full max-w-[1100px] gap-4 pb-10">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-4">
            <Link target="_self" href={`${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/blog`}
              className="hover:text-foreground/30">
              {"< Back to blog"}
            </Link>
            <div className="text-base flex w-full justify-between items-center 
							border-b border-b-foreground/30
						pb-2">
              <div>
                Written by: Jack
              </div>
              <div>
                Published: April 4, 2026
              </div>
            </div>
          </div>
        </div>
        <h1>
          Bringing Developer Experience to Word Processors
        </h1>
        <div className="flex flex-col w-full gap-1">
          <div>:wq,</div>
          <div>- Jack</div>
        </div>
      </div>
    </div>
  );
}
