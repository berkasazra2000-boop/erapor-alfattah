// app/api/generate-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'
import type { Browser } from 'puppeteer-core'

export const runtime = 'nodejs'
export const maxDuration = 60

let browserPromise: Promise<Browser> | null = null

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    })

    browserPromise.then((b) => {
      b.on('disconnected', () => {
        browserPromise = null
      })
    })
  }
  return browserPromise
}

export async function POST(req: NextRequest) {
  let page: any = null

  try {
    const { student_id } = await req.json()

    if (!student_id) {
      return NextResponse.json({ error: 'student_id wajib diisi' }, { status: 400 })
    }

    const { getRaporData } = await import('@/lib/rapor-data')
    const data = await getRaporData(student_id)

    if (!data) {
      return NextResponse.json({ error: 'Siswa tidak ditemukan' }, { status: 404 })
    }

    const forwardedHost = req.headers.get('x-forwarded-host')
    const forwardedProto = req.headers.get('x-forwarded-proto') || 'https'
    const origin = forwardedHost
      ? `${forwardedProto}://${forwardedHost}`
      : req.nextUrl.origin
    const url = `${origin}/print/rapor/${student_id}?bulk=1`

    const browser = await getBrowser()
    page = await browser.newPage()

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.evaluateHandle('document.fonts.ready')

    // ============ HEADER: identitas lengkap ============
    const headerTemplate = `
      <div style="
        width: 100%;
        padding: 6mm 20mm 0 20mm;
        box-sizing: border-box;
        font-family: Arial, Helvetica, sans-serif;
        font-size: 11px;
        color: #000;
      ">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 90px; padding: 2px 2px; vertical-align: top;">Nama</td>
            <td style="width: 8px; padding: 2px 2px; vertical-align: top;">:</td>
            <td style="padding: 2px 2px; vertical-align: top;">${data.siswa.nama}</td>
            <td style="width: 20mm;"></td>
            <td style="width: 95px; padding: 2px 2px; vertical-align: top;">Kelas</td>
            <td style="width: 8px; padding: 2px 2px; vertical-align: top;">:</td>
            <td style="padding: 2px 2px; vertical-align: top;">${data.siswa.kelas}</td>
          </tr>
          <tr>
            <td style="padding: 2px 2px; vertical-align: top;">NIS/NISN</td>
            <td style="padding: 2px 2px; vertical-align: top;">:</td>
            <td style="padding: 2px 2px; vertical-align: top;">${data.siswa.nis} / ${data.siswa.nisn}</td>
            <td></td>
            <td style="padding: 2px 2px; vertical-align: top;">Fase</td>
            <td style="padding: 2px 2px; vertical-align: top;">:</td>
            <td style="padding: 2px 2px; vertical-align: top;">${data.siswa.fase}</td>
          </tr>
          <tr>
            <td style="padding: 2px 2px; vertical-align: top;">Nama Sekolah</td>
            <td style="padding: 2px 2px; vertical-align: top;">:</td>
            <td style="padding: 2px 2px; vertical-align: top;">${data.sekolah.nama}</td>
            <td></td>
            <td style="padding: 2px 2px; vertical-align: top;">Semester</td>
            <td style="padding: 2px 2px; vertical-align: top;">:</td>
            <td style="padding: 2px 2px; vertical-align: top;">${data.tahun.semester}</td>
          </tr>
          <tr>
            <td style="padding: 2px 2px; vertical-align: top;">Alamat</td>
            <td style="padding: 2px 2px; vertical-align: top;">:</td>
            <td style="padding: 2px 2px; vertical-align: top;">${data.sekolah.alamat}</td>
            <td></td>
            <td style="padding: 2px 2px; vertical-align: top;">Tahun Pelajaran</td>
            <td style="padding: 2px 2px; vertical-align: top;">:</td>
            <td style="padding: 2px 2px; vertical-align: top;">${data.tahun.tahun}</td>
          </tr>
        </table>
        <div style="border-bottom: 2px solid #000; margin-top: 5px;"></div>
      </div>
    `

    // ============ FOOTER ============
    const footerTemplate = `
      <div style="
        width: 100%;
        padding: 0 20mm;
        box-sizing: border-box;
      ">
        <div style="
          border-top: 1px solid #000;
          padding-top: 3px;
          display: flex;
          justify-content: space-between;
          font-size: 9px;
          font-family: Arial, Helvetica, sans-serif;
          font-weight: bold;
          font-style: italic;
        ">
          <span>${data.kelasNama} | ${data.siswa.nama} | ${data.siswa.nis}</span>
          <span>Halaman: <span class="pageNumber"></span> dari <span class="totalPages"></span></span>
        </div>
      </div>
    `

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate,
      footerTemplate,
      margin: {
        top: '35mm',
        bottom: '22mm',
        left: '20mm',
        right: '20mm',
      },
    })

    await page.close()
    page = null

    const safeName = data.siswa.nama.replace(/[^a-zA-Z0-9]/g, '-')

    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="rapor-${safeName}.pdf"`,
      },
    })
  } catch (error: any) {
    if (page) await page.close().catch(() => {})
    console.error('GENERATE PDF ERROR:', error)
    return NextResponse.json(
      { error: 'Gagal generate PDF: ' + (error.message ?? 'unknown') },
      { status: 500 }
    )
  }
}