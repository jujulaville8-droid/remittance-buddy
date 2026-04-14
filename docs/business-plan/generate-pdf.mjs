import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function generatePDF() {
  const browser = await chromium.launch()
  // Letter size at 96 DPI: 8.5 × 11 inches = 816 × 1056 px
  const context = await browser.newContext({
    viewport: { width: 816, height: 1056 },
    deviceScaleFactor: 1,
  })
  const page = await context.newPage()

  const url = 'http://localhost:8900/docs/business-plan/BUSINESS_PLAN.html'
  console.log(`Loading ${url}...`)

  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(3000)

  // Fix the layout for PDF:
  // 1. Remove redundant .page-break divs (we already get breaks from h1)
  // 2. Tighten cover page so it's exactly one page
  // 3. Force h1 breaks, avoid widows/orphans
  await page.evaluate(() => {
    // Remove all the standalone page-break divs — we use h1 breaks instead
    document.querySelectorAll('.page-break').forEach((el) => el.remove())

    // Force h1 breaks via inline style (skip the first h1 after cover — TOC)
    const h1s = Array.from(document.querySelectorAll('h1'))
    h1s.forEach((h1, idx) => {
      // idx 0 = first h1 inside cover (handled by cover), skip
      // idx 1 onwards: TOC + each section — all get page breaks
      if (idx > 0) {
        h1.style.pageBreakBefore = 'always'
        h1.style.breakBefore = 'page'
        h1.style.marginTop = '0'
        h1.style.paddingTop = '0'
      }
    })

    // Force cover to exactly one page
    const cover = document.querySelector('.cover')
    if (cover) {
      cover.style.height = '8.6in'
      cover.style.minHeight = 'auto'
      cover.style.maxHeight = '8.6in'
      cover.style.overflow = 'hidden'
      cover.style.pageBreakAfter = 'always'
      cover.style.breakAfter = 'page'
      cover.style.padding = '1.5in 0 0 0'
      cover.style.display = 'flex'
      cover.style.flexDirection = 'column'
      cover.style.justifyContent = 'flex-start'
      cover.style.alignItems = 'center'
      cover.style.borderBottom = 'none'
    }

    // Aggressive spacing tightening for PDF
    const style = document.createElement('style')
    style.textContent = `
      * { box-sizing: border-box; }
      body {
        font-family: 'Inter', sans-serif !important;
        font-size: 10.5pt !important;
        line-height: 1.55 !important;
        padding: 0 !important;
        margin: 0 !important;
        max-width: none !important;
      }
      h1 { font-size: 24pt !important; margin-bottom: 14pt !important; padding-bottom: 8pt !important; }
      h2 { font-size: 15pt !important; margin-top: 18pt !important; margin-bottom: 8pt !important; }
      h3 { font-size: 12pt !important; margin-top: 14pt !important; margin-bottom: 6pt !important; }
      h4 { font-size: 10pt !important; margin-top: 12pt !important; margin-bottom: 4pt !important; }
      p { font-size: 10.5pt !important; line-height: 1.55 !important; margin-bottom: 8pt !important; }
      li { font-size: 10.5pt !important; line-height: 1.5 !important; margin-bottom: 3pt !important; }
      ul, ol { margin-bottom: 10pt !important; }
      table { font-size: 9pt !important; margin: 10pt 0 !important; }
      th, td { padding: 6pt 8pt !important; line-height: 1.4 !important; }
      pre { font-size: 8.5pt !important; padding: 10pt 12pt !important; margin: 10pt 0 !important; line-height: 1.45 !important; }
      .callout, blockquote { margin: 10pt 0 !important; padding: 10pt 14pt !important; font-size: 10pt !important; }
      .toc { padding: 16pt 24pt !important; }
      .toc li { padding: 3pt 0 !important; font-size: 11pt !important; }
      table, pre, .callout, blockquote { page-break-inside: avoid !important; break-inside: avoid !important; }
      h2, h3, h4 { page-break-after: avoid !important; break-after: avoid !important; }
      p, li { orphans: 3; widows: 3; }
    `
    document.head.appendChild(style)
  })

  const debug = await page.evaluate(() => {
    const h1s = document.querySelectorAll('h1')
    return {
      scrollHeight: document.documentElement.scrollHeight,
      h1Count: h1s.length,
      h1PageBreakBefore: getComputedStyle(h1s[1]).pageBreakBefore,
    }
  })
  console.log('Debug after injection:', debug)

  const outputPath = join(__dirname, 'Remittance_Buddy_Business_Plan.pdf')

  await page.pdf({
    path: outputPath,
    format: 'Letter',
    margin: {
      top: '0.9in',
      bottom: '0.9in',
      left: '1in',
      right: '1in',
    },
    printBackground: true,
    preferCSSPageSize: false,
    displayHeaderFooter: false,
    scale: 1,
  })

  await browser.close()
  console.log(`PDF written to ${outputPath}`)
}

generatePDF().catch((err) => {
  console.error(err)
  process.exit(1)
})
