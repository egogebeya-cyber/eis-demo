import { chromium } from 'playwright'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdirSync, readdirSync, copyFileSync, existsSync, unlinkSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import ffmpegPath from 'ffmpeg-static'

const ROOT = dirname(fileURLToPath(import.meta.url))
const RAW_DIR = join(ROOT, 'raw')
const MP4 = join(ROOT, 'EIS-TikTok-promo.mp4')
const DESKTOP = join(process.env.USERPROFILE ?? '', 'OneDrive', 'Desktop', 'EIS-TikTok-promo.mp4')
const BASE = process.env.EIS_URL ?? 'http://127.0.0.1:3010'

mkdirSync(RAW_DIR, { recursive: true })

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

/** Soft hold — never idle past ~1.8s */
async function hold(ms = 1200) {
  await sleep(Math.min(ms, 1800))
}

async function waitPainted(page, imgSel) {
  await page.evaluate(() => {
    document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important')
    document.body.style.setProperty('scroll-behavior', 'auto', 'important')
  })
  await page.waitForFunction(() => document.body && document.body.innerText.trim().length > 40)
  if (imgSel) {
    const img = page.locator(imgSel).first()
    await img.waitFor({ state: 'visible', timeout: 25000 }).catch(() => {})
    await img
      .evaluate(async (el) => {
        if (!(el instanceof HTMLImageElement)) return
        if (!el.complete || el.naturalWidth === 0) await el.decode().catch(() => {})
      })
      .catch(() => {})
  }
  await page.evaluate(() => (document.fonts ? document.fonts.ready : Promise.resolve()))
  await sleep(280)
}

async function maxScroll(page) {
  return page.evaluate(() => Math.max(0, document.documentElement.scrollHeight - innerHeight))
}

async function scrollY(page) {
  return page.evaluate(() => window.scrollY)
}

async function scrollSteady(page, targetY, durationMs) {
  await page.evaluate(
    async ({ targetY, durationMs }) => {
      document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important')
      document.body.style.setProperty('scroll-behavior', 'auto', 'important')
      const startY = window.scrollY
      const dist = targetY - startY
      if (Math.abs(dist) < 8) return

      const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2)
      const t0 = performance.now()

      await new Promise((resolve) => {
        let done = false
        const finish = () => {
          if (done) return
          done = true
          window.scrollTo(0, targetY)
          resolve()
        }
        const apply = (now) => {
          const p = Math.min(1, (now - t0) / durationMs)
          window.scrollTo(0, startY + dist * ease(p))
          return p
        }
        const frame = (now) => {
          if (apply(now) < 1) requestAnimationFrame(frame)
          else finish()
        }
        requestAnimationFrame(frame)
        const id = setInterval(() => {
          if (apply(performance.now()) >= 1) {
            clearInterval(id)
            finish()
          }
        }, 16)
        setTimeout(() => {
          clearInterval(id)
          finish()
        }, durationMs + 400)
      })
    },
    { targetY, durationMs },
  )
}

async function scrollPages(page, { pages = 5, scrollMs = 1600, holdMs = 1100, step = 0.55 } = {}) {
  const vh = await page.evaluate(() => window.innerHeight)
  const maxY = await maxScroll(page)
  let y = await scrollY(page)
  let moved = 0
  for (let i = 0; i < pages; i++) {
    const next = Math.min(maxY, Math.round(y + vh * step))
    if (next - y < 48) break
    await scrollSteady(page, next, scrollMs)
    y = next
    moved += 1
    await hold(holdMs)
  }
  return moved
}

async function scrollIntoViewSmooth(page, locator, offset = 160) {
  const top = await locator.first().evaluate((el, offset) => {
    const y = el.getBoundingClientRect().top + window.scrollY
    return Math.max(0, y - offset)
  }, offset)
  const y = await scrollY(page)
  const maxY = await maxScroll(page)
  const target = Math.min(maxY, top)
  if (Math.abs(target - y) > 40) {
    const dist = Math.abs(target - y)
    await scrollSteady(page, target, Math.min(3600, Math.max(1600, dist * 1.35)))
  }
}

async function showClickAt(page, x, y) {
  await page.evaluate(
    ({ x, y }) => {
      let el = document.getElementById('eis-tiktok-click')
      if (!el) {
        el = document.createElement('div')
        el.id = 'eis-tiktok-click'
        document.documentElement.appendChild(el)
      }
      el.classList.remove('pulse', 'on')
      el.style.left = `${x}px`
      el.style.top = `${y}px`
      void el.offsetWidth
      el.classList.add('on', 'pulse')
    },
    { x, y },
  )
  await sleep(220)
}

async function hideClick(page) {
  await page.evaluate(() => {
    const el = document.getElementById('eis-tiktok-click')
    if (el) el.classList.remove('on', 'pulse')
  }).catch(() => {})
}

async function clickWithSign(page, locator) {
  const target = locator.first()
  await target.waitFor({ state: 'visible', timeout: 15000 })
  await scrollIntoViewSmooth(page, target, 200)
  await hold(500)
  const box = await target.boundingBox()
  if (!box) {
    await target.click()
    return
  }
  const x = box.x + box.width / 2
  const y = box.y + Math.min(box.height / 2, 28)
  await showClickAt(page, x, y)
  await target.click({ force: true })
  await sleep(180)
  await hideClick(page)
}

async function typeField(page, locator, text, delay = 42) {
  const el = locator.first()
  await scrollIntoViewSmooth(page, el, 220)
  const box = await el.boundingBox()
  if (box) await showClickAt(page, box.x + Math.min(40, box.width / 2), box.y + box.height / 2)
  await el.click({ force: true })
  await hideClick(page)
  await el.fill('')
  await el.pressSequentially(text, { delay })
}

function whiteStartSeconds(webm) {
  if (!ffmpegPath) return 0
  const result = spawnSync(
    ffmpegPath,
    [
      '-i',
      webm,
      '-vf',
      'format=rgb24,negate,blackdetect=d=0.05:pic_th=0.93:pix_th=0.10',
      '-an',
      '-f',
      'null',
      '-',
    ],
    { encoding: 'utf8' },
  )
  const text = `${result.stderr ?? ''}\n${result.stdout ?? ''}`
  const start = text.match(/black_start:\s*([\d.]+)/)
  const end = text.match(/black_end:\s*([\d.]+)/)
  if (start && Number(start[1]) < 0.35 && end) return Number(end[1])
  return 0
}

function probeDuration(file) {
  const result = spawnSync(
    ffmpegPath,
    ['-i', file, '-f', 'null', '-'],
    { encoding: 'utf8' },
  )
  const text = `${result.stderr ?? ''}`
  const m = text.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/)
  if (!m) return 0
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3])
}

async function main() {
  for (const f of readdirSync(RAW_DIR)) {
    if (f.endsWith('.webm')) unlinkSync(join(RAW_DIR, f))
  }

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: [
      '--autoplay-policy=no-user-gesture-required',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
    ],
  })
  const context = await browser.newContext({
    // Native TikTok size — sharper capture than upscaling 900px
    viewport: { width: 1080, height: 1920 },
    deviceScaleFactor: 2,
    reducedMotion: null,
    recordVideo: { dir: RAW_DIR, size: { width: 1080, height: 1920 } },
  })
  await context.addInitScript(() => {
    const paint = () => {
      document.documentElement.style.setProperty('background', '#1a1220', 'important')
      document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important')
    }
    paint()
    document.addEventListener('DOMContentLoaded', paint)
  })
  // Force the compact phone home layout even at 1080 TikTok width (kills tall white panels)
  await context.addInitScript(() => {
    const style = document.createElement('style')
    style.id = 'eis-tiktok-compact'
    style.textContent = `
      .gs-hero { height: 100svh !important; min-height: 100svh !important; position: relative !important; }
      .gs-split, .gs-story, .gs-experience {
        position: relative !important; top: auto !important;
        height: auto !important; min-height: 0 !important;
        grid-template-columns: minmax(0,1fr) minmax(0,1fr) !important;
        align-items: stretch !important;
      }
      .gs-local-line, .gs-spine-gold, .gs-spine-gold-square, .gs-scroll-thumb { display: none !important; }
      .gs-split-copy, .gs-story-copy, .gs-experience-copy {
        padding: 1.1rem 0.85rem 1.1rem 1rem !important;
        justify-content: flex-start !important;
      }
      .gs-split-copy h2, .gs-story-copy h2, .gs-experience-copy h2 { font-size: 2.1rem !important; }
      .gs-split-copy p, .gs-story-copy p, .gs-experience-copy p {
        margin-top: 0.55rem !important; font-size: 0.95rem !important; line-height: 1.45 !important;
      }
      .gs-split-media, .gs-story-media, .gs-experience-media {
        min-height: 14rem !important; padding: 0 !important; overflow: hidden !important;
      }
      .gs-split-media img, .gs-story-media img, .gs-experience-media img,
      .gs-split-media .gs-play, .gs-split-media .gs-play img {
        position: absolute !important; inset: 0 !important;
        width: 100% !important; height: 100% !important;
        min-height: 0 !important; max-height: none !important;
        object-fit: cover !important;
      }
      .gs-stages { grid-template-columns: 1fr 1fr !important; min-height: 0 !important; }
      .gs-stage { min-height: 28vw !important; }
      .gs-stage:last-child { grid-column: 1 / -1 !important; min-height: 22vw !important; }
    `
    const mount = () => document.documentElement.appendChild(style)
    if (document.documentElement) mount()
    else document.addEventListener('DOMContentLoaded', mount)
  })
  await context.addInitScript(() => {
    const ensure = () => {
      if (document.getElementById('eis-tiktok-click-style')) return
      const style = document.createElement('style')
      style.id = 'eis-tiktok-click-style'
      style.textContent = `
        #eis-tiktok-click {
          position: fixed; left: 0; top: 0; width: 18px; height: 18px;
          margin: -9px 0 0 -9px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.95);
          background: rgba(196, 54, 48, 0.55);
          box-shadow: 0 0 0 1px rgba(0,0,0,0.25);
          pointer-events: none; z-index: 2147483647;
          opacity: 0; transform: scale(0.6);
          transition: opacity 90ms ease, transform 160ms ease;
        }
        #eis-tiktok-click.on { opacity: 1; transform: scale(1); }
        #eis-tiktok-click.pulse::after {
          content: ''; position: absolute; inset: -6px;
          border-radius: 50%; border: 2px solid rgba(196, 54, 48, 0.7);
          animation: eis-tiktok-ring 380ms ease-out forwards;
        }
        @keyframes eis-tiktok-ring {
          from { transform: scale(0.7); opacity: 1; }
          to { transform: scale(1.8); opacity: 0; }
        }
      `
      const el = document.createElement('div')
      el.id = 'eis-tiktok-click'
      const mount = () => {
        document.documentElement.appendChild(style)
        document.documentElement.appendChild(el)
      }
      if (document.documentElement) mount()
      else document.addEventListener('DOMContentLoaded', mount)
    }
    ensure()
  })

  const page = await context.newPage()
  page.setDefaultTimeout(25000)
  const recStart = Date.now()

  // ——— 1. HOME ———
  await page.goto(`${BASE}/`, { waitUntil: 'load', timeout: 60000 })
  await waitPainted(page, '.gs-hero img.gs-photo, .gs-hero img, img')
  const readyAt = Date.now()
  await hold(900)
  // Slow, smooth home scroll — smaller steps, longer ease
  await scrollPages(page, { pages: 12, scrollMs: 3600, holdMs: 700, step: 0.48 })

  // ——— 2. ADMISSIONS ———
  const admissionsLink = page.locator('.gs-utility a[href="/admissions"]').first()
  await clickWithSign(page, admissionsLink)
  await page.waitForURL('**/admissions', { timeout: 15000 })
  await waitPainted(page, 'img')
  await hold(800)
  await scrollPages(page, { pages: 4, scrollMs: 3200, holdMs: 700, step: 0.5 })

  // ——— 3. BOOK A VISIT ———
  const visitCta = page.getByRole('link', { name: /book a visit|visit campus/i }).first()
  await clickWithSign(page, visitCta)
  await page.waitForURL('**/admissions/visit', { timeout: 15000 })
  await waitPainted(page, 'img')
  await hold(700)
  await scrollPages(page, { pages: 3, scrollMs: 3000, holdMs: 650, step: 0.5 })

  // Showcase visit form (no submit — avoids production mail/DB noise)
  const visitName = page.locator('input[name="name"]').first()
  await scrollIntoViewSmooth(page, visitName, 180)
  await hold(600)
  await typeField(page, visitName, 'Sara Hailu', 48)
  await typeField(page, page.locator('input[name="email"]'), 'sara@example.com', 36)
  await typeField(page, page.locator('input[name="phone"]'), '0911 000 000', 40)
  await hold(900)

  // ——— 4. APPLY NOW ———
  // Visit page may not expose Apply; go via Admissions then Apply now
  await page.evaluate(() => window.scrollTo(0, 0))
  await hold(400)
  await clickWithSign(page, page.locator('.gs-utility a[href="/admissions"]').first())
  await page.waitForURL(/\/admissions\/?$/, { timeout: 15000 })
  await waitPainted(page, 'img')
  await hold(700)
  const applyLink = page.locator('a[href="/admissions/apply"]').first()
  await clickWithSign(page, applyLink)
  await page.waitForURL('**/admissions/apply', { timeout: 15000 })
  await waitPainted(page, 'img')
  await hold(800)

  const form = page.locator('form').first()
  await scrollIntoViewSmooth(page, form, 120)
  await hold(700)

  // Step 1 — child
  const childInput = page.locator('form input').first()
  await typeField(page, childInput, 'Yonas Hailu', 45)
  const dateInput = page.locator('form input[type="date"]').first()
  if ((await dateInput.count()) > 0) {
    await scrollIntoViewSmooth(page, dateInput, 200)
    const box = await dateInput.boundingBox()
    if (box) await showClickAt(page, box.x + 40, box.y + box.height / 2)
    await dateInput.fill('2018-03-14')
    await hideClick(page)
  }
  const gradeSelect = page.locator('form select').first()
  if ((await gradeSelect.count()) > 0) {
    const box = await gradeSelect.boundingBox()
    if (box) await showClickAt(page, box.x + 50, box.y + box.height / 2)
    await gradeSelect.selectOption({ label: 'Grade 1' })
    await hideClick(page)
  }
  await hold(700)

  const nextBtn = page.locator('form button[type="submit"]').first()
  await clickWithSign(page, nextBtn)
  await hold(800)

  // Step 2 — parent
  await typeField(page, page.locator('form input').nth(0), 'Sara Hailu', 45)
  await typeField(page, page.locator('form input[type="email"]'), 'sara@example.com', 36)
  await typeField(page, page.locator('form input').nth(2), '0911 000 000', 40)
  await hold(700)
  await clickWithSign(page, nextBtn)
  await hold(800)

  // Step 3 — notes (show UI, do NOT submit final application)
  const notes = page.locator('form textarea').first()
  if ((await notes.count()) > 0) {
    await typeField(page, notes, 'Looking forward to joining EIS.', 28)
  }
  await hold(1400)

  // Brief focus on the submit button without clicking (demo only)
  const submitBtn = page.locator('form button[type="submit"]').first()
  await scrollIntoViewSmooth(page, submitBtn, 240)
  const sbox = await submitBtn.boundingBox()
  if (sbox) {
    await showClickAt(page, sbox.x + sbox.width / 2, sbox.y + sbox.height / 2)
    await hold(900)
    await hideClick(page)
  }
  await hold(1100)

  await context.close()
  await browser.close()

  const webm = readdirSync(RAW_DIR)
    .filter((f) => f.endsWith('.webm'))
    .map((f) => join(RAW_DIR, f))
    .sort((a, b) => statSync(a).mtimeMs - statSync(b).mtimeMs)
    .at(-1)
  if (!webm || !existsSync(webm)) throw new Error('Playwright did not write a video file')
  if (!ffmpegPath) throw new Error('ffmpeg-static is missing')

  const timed = Math.max(0, (readyAt - recStart) / 1000 - 0.12)
  const detected = whiteStartSeconds(webm)
  const trim = Math.max(timed, detected)
  const rawDur = probeDuration(webm)
  const outDur = Math.max(1, rawDur - trim)

  execFileSync(
    ffmpegPath,
    [
      '-y',
      '-i',
      webm,
      '-ss',
      trim.toFixed(2),
      '-vf',
      'fps=30,scale=1080:1920:flags=lanczos',
      '-c:v',
      'libx264',
      '-crf',
      '15',
      '-preset',
      'slow',
      '-profile:v',
      'high',
      '-level',
      '4.2',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      '-an',
      MP4,
    ],
    { stdio: 'inherit' },
  )

  try {
    copyFileSync(MP4, DESKTOP)
  } catch {
    /* desktop copy is optional */
  }

  const finalDur = probeDuration(MP4)
  console.log(`Trimmed ${trim.toFixed(2)}s of load frames (timed ${timed.toFixed(2)}, white ${detected.toFixed(2)})`)
  console.log(`Raw ${rawDur.toFixed(2)}s → output ~${outDur.toFixed(2)}s (probed ${finalDur.toFixed(2)}s)`)
  console.log(`Saved ${MP4}`)
  if (existsSync(DESKTOP)) console.log(`Copied ${DESKTOP}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
