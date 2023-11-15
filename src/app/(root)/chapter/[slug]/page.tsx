import Image from "next/image";
import { notFound } from "next/navigation";

import { getSlugId } from "@/lib/utils";

import { getChapter } from "@/actions/chapterActions";

import ChapterNav from "@/components/ChapterNav";
import { TooltipProvider } from "@/components/ui/Tooltip";

interface Props {
  params: { slug: string };
}

export default async function ChapterPage({ params }: Props) {
  const chapterId = getSlugId(params.slug);
  const chapter = await getChapter(chapterId);
  if (!chapter) return notFound();

  return (
    <TooltipProvider>
      <div className="container px-4 xl:max-w-6xl">
        <div className="my-4 md:my-3 relative">
          <ChapterNav
            id={chapter.id}
            title={chapter.title!}
            contentType={chapter.type}
            contentId={chapter.content.id}
            contentTitle={chapter.content.title}
          />
        </div>

        {chapter.type === "comic" && (
          <div className="-mx-4 sm:mx-auto max-w-3xl border rounded-xl overflow-hidden">
            {chapter.images.map((img, index) => (
              <Image
                alt={""}
                src={img}
                width={0}
                height={0}
                unoptimized
                sizes="100vh"
                className="w-full"
                key={chapter.id + index}
              />
            ))}
          </div>
        )}

        {chapter.type === "novel" && (
          <div className="sm:mx-auto max-w-3xl font-semibold text-xl">
            <p className="select-none whitespace-pre-wrap text-stone-600 dark:text-stone-400">{chapter.text}</p>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
