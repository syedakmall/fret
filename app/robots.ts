import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// Required by `output: export`: emit this as a static file at build time.
export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
