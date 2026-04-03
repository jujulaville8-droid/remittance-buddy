import type { Metadata } from 'next'
import Script from 'next/script'
import { readFileSync } from 'fs'
import { join } from 'path'

export const metadata: Metadata = {
  title: 'Remittance Buddy — Send Money to the Philippines',
  description:
    'AI-powered international money transfers. Send money to the Philippines with the best rates, no app download needed. Fast, transparent, and secure.',
}

function getBodyHtml(): string {
  try {
    const htmlPath = join(process.cwd(), 'public', 'index-source.html')
    const html = readFileSync(htmlPath, 'utf-8')
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/)
    if (!bodyMatch) return '<p>Failed to load page content</p>'
    return bodyMatch[1].replace(/<script[^>]*>[\s\S]*?<\/script>/g, '')
  } catch {
    return '<p>Failed to load page content</p>'
  }
}

export default function HomePage() {
  const bodyHtml = getBodyHtml()

  return (
    <>
      <link rel="stylesheet" href="/css/styles.css" />
      <link rel="stylesheet" href="/css/nsave.shared.b159b4734.min.css" />
      <div className="loaded" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
      <Script src="/js/scripts.js" strategy="afterInteractive" />
    </>
  )
}
