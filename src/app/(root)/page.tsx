import slug from "slug"
import prisma from "@/lib/prisma"

import CategoryList from "@/components/sections/CategoryList"
import HomeSlider, { Slide } from "@/components/sections/HomeSlider"
import HighlightContents from "@/components/sections/HighlightContents"
// utils
import getRedisClient, { getKeyWithNamespace } from "@/lib/redis"

const EX = 30 * 60 // 30 Phút

const contentSelector: any = {
  include: {
    contents: {
      take: 8,
      select: {
        id: true,
        type: true,
        title: true,
        status: true,
        thumbUrl: true,
        creator: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    },
  },
}

async function getHomeData() {
  const redisClient = await getRedisClient()
  const key = getKeyWithNamespace("home-data")
  let homeData: any = await redisClient.get(key)

  if (!homeData) {
    const highlights = await Promise.all(
      [
        "fh-sentimental",
        "fh-tieu-thuyet",
        "fh-tv-show",
        "fh-boys-love",
        "fh-girls-love",
        "fh-truyen-nam",
        "fh-modern",
        "fh-historical-drama",
        "fh-romance",
      ].map((slug) => prisma.category.findUnique({ where: { slug }, ...contentSelector }))
    )

    const categories = await prisma.category.findMany({ where: {}, select: { title: true, slug: true, id: true } })

    const contents = await prisma.content.findMany({
      where: {},
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        categories: true,
      },
      take: 6,
    })

    const slide: Slide[] = contents.map((content) => ({
      id: content.id,
      type: content.type,
      title: content.title,
      tagline: content.akaTitle[0],
      image: content.thumbUrl!.replace("_256x", "_720x"),
    }))

    homeData = { slide, highlights, categories }
    await redisClient.set(key, JSON.stringify(homeData), { EX })
  } else {
    homeData = JSON.parse(homeData)
  }

  return homeData
}

export default async function Home() {
  const { slide, highlights, categories } = await getHomeData()

  return (
    <main className="flex flex-col gap-6 items-center justify-between">
      <div className="w-full sm:container xl:max-w-7xl">
        <div className="sm:p-2 w-full">
          <HomeSlider data={slide} />
        </div>
      </div>

      <div className="container p-2 sm:p-8 xl:max-w-7xl">
        <div className="grid grid-cols-3 gap-6 w-full p-2">
          <div className="flex flex-col gap-6 col-span-3 md:col-span-2">
            {Array.isArray(highlights) &&
              // @ts-ignore
              highlights.map(({ id, contents, title }) => (
                <HighlightContents key={id} data={contents} title={title} moreLink={`/the-loai/${slug(title)}-${id}`} />
              ))}
          </div>
          <div className="col-span-3 md:col-span-1">
            <CategoryList data={categories} />
          </div>
        </div>
      </div>
    </main>
  )
}
