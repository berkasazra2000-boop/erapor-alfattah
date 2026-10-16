// app/api/generate-pdf-kelas/route.ts
import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'
import type { Browser } from 'puppeteer-core'
import { PDFDocument } from 'pdf-lib'

export const runtime = 'nodejs'
export const maxDuration = 300

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
    const { class_id } = await req.json()

    if (!class_id) {
      return NextResponse.json(
        { error: 'class_id wajib diisi' },
        { status: 400 }
      )
    }

    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    // Info kelas + tingkat
    const { data: kelas } = await supabase
      .from('classes')
      .select('id, nama, class_levels(nama)')
      .eq('id', class_id)
      .single()

    if (!kelas) {
      return NextResponse.json(
        { error: 'Kelas tidak ditemukan' },
        { status: 404 }
      )
    }

    const levelNama = (kelas as any).class_levels?.nama ?? ''
    const fase = levelNama === 'X' ? 'E' : 'F'

    // Info sekolah + tahun ajaran aktif
    const [sekolahRes, tahunRes] = await Promise.all([
      supabase
        .from('schools')
        .select('nama, alamat, kepala_sekolah, nip_kepsek')
        .limit(1)
        .single(),
      supabase
        .from('academic_years')
        .select('tahun, semester')
        .eq('is_active', true)
        .maybeSingle(),
    ])

    const sekolah = sekolahRes.data ?? {
      nama: '-',
      alamat: '-',
      kepala_sekolah: '-',
      nip_kepsek: '-',
    }
    const tahun = tahunRes.data ?? { tahun: '-', semester: 1 }

    // Semua siswa di kelas
    const { data: siswaList } = await supabase
      .from('students')
      .select('id, nama, nis, nisn')
      .eq('class_id', class_id)
      .order('nama')

    if (!siswaList || siswaList.length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada siswa di kelas ini' },
        { status: 404 }
      )
    }

    const forwardedHost = req.headers.get('x-forwarded-host')
    const forwardedProto = req.headers.get('x-forwarded-proto') || 'https'
    const origin = forwardedHost
      ? `${forwardedProto}://${forwardedHost}`
      : req.nextUrl.origin

    const browser = await getBrowser()
    page = await browser.newPage()

    const mergedPdf = await PDFDocument.create()

    for (let i = 0; i < siswaList.length; i++) {
      const siswa = siswaList[i]
      const url = `${origin}/print/rapor/${siswa.id}`

      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
      await page.evaluateHandle('document.fonts.ready')

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
              <td style="width: 90px; padding: 2px;">Nama</td>
              <td style="width: 8px; padding: 2px;">:</td>
              <td style="padding: 2px;">${siswa.nama}</td>
              <td style="width: 20mm;"></td>
              <td style="width: 95px; padding: 2px;">Kelas</td>
              <td style="width: 8px; padding: 2px;">:</td>
              <td style="padding: 2px;">${kelas.nama}</td>
            </tr>
            <tr>
              <td style="padding: 2px;">NIS/NISN</td>
              <td style="padding: 2px;">:</td>
              <td style="padding: 2px;">${siswa.nis ?? '-'} / ${siswa.nisn ?? '-'}</td>
              <td></td>
              <td style="padding: 2px;">Fase</td>
              <td style="padding: 2px;">:</td>
              <td style="padding: 2px;">${fase}</td>
            </tr>
            <tr>
              <td style="padding: 2px;">Nama Sekolah</td>
              <td style="padding: 2px;">:</td>
              <td style="padding: 2px;">${sekolah.nama}</td>
              <td></td>
              <td style="padding: 2px;">Semester</td>
              <td style="padding: 2px;">:</td>
              <td style="padding: 2px;">${tahun.semester}</td>
            </tr>
            <tr>
              <td style="padding: 2px;">Alamat</td>
              <td style="padding: 2px;">:</td>
              <td style="padding: 2px;">${sekolah.alamat}</td>
              <td></td>
              <td style="padding: 2px;">Tahun Pelajaran</td>
              <td style="padding: 2px;">:</td>
              <td style="padding: 2px;">${tahun.tahun}</td>
            </tr>
          </table>
          <div style="border-bottom: 2px solid #000; margin-top: 5px;"></div>
        </div>
      `

      const footerTemplate = `
        <div style="
          width: 100%;
          padding: 0 20mm;
          box-sizing: border-box;
        ">
          <div style="
            border-top: 2px solid #000;
            padding-top: 4px;
            display: flex;
            justify-content: space-between;
            font-size: 9px;
            font-family: Arial, Helvetica, sans-serif;
            font-weight: bold;
            font-style: italic;
          ">
            <span>${kelas.nama} | ${siswa.nama} | ${siswa.nis ?? '-'}</span>
            <span>Halaman: <span class="pageNumber"></span></span>
          </div>
        </div>
      `

      const pdfBytes = await page.pdf({
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

      const siswaPdf = await PDFDocument.load(pdfBytes)
      const pages = await mergedPdf.copyPages(siswaPdf, siswaPdf.getPageIndices())
      pages.forEach((p) => mergedPdf.addPage(p))
    }

    await page.close()
    page = null

    const mergedBytes = await mergedPdf.save()

    const safeName = kelas.nama.replace(/[^a-zA-Z0-9]/g, '-')

    return new NextResponse(Buffer.from(mergedBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="rapor-kelas-${safeName}.pdf"`,
      },
    })
  } catch (error: any) {
    if (page) await page.close().catch(() => {})
    console.error('GENERATE PDF KELAS ERROR:', error)
    return NextResponse.json(
      { error: 'Gagal generate PDF: ' + (error.message ?? 'unknown') },
      { status: 500 }
    )
  }
}