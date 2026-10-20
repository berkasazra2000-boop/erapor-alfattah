// lib/rapor-data.ts
import { createClient } from '@/lib/supabase/server'

export async function getRaporData(student_id: string) {
  const supabase = await createClient()

  const { data: siswa } = await supabase
    .from('students')
    .select(`
      id, nama, nis, nisn, class_id,
      classes(id, nama, class_level_id, wali_kelas_id, class_levels(nama))
    `)
    .eq('id', student_id)
    .single()

  if (!siswa) return null

  const kelas = (siswa as any).classes
  const class_level_id = kelas?.class_level_id
  const levelNama = kelas?.class_levels?.nama ?? ''

  const { data: tahun } = await supabase
    .from('academic_years')
    .select('tahun, semester, tanggal_cetak, tempat_cetak')
    .eq('is_active', true)
    .maybeSingle()

  // ✅ TAMBAH kepala_sekolah_ttd_url
  const { data: sekolah } = await supabase
    .from('schools')
    .select('nama, alamat, kepala_sekolah, nip_kepsek, kepala_sekolah_ttd_url')
    .limit(1)
    .single()

  const { data: mapelMapping } = await supabase
    .from('class_level_subjects')
    .select('subject_id, kategori, urutan, subjects(nama)')
    .eq('class_level_id', class_level_id)
    .order('urutan')

  const { data: grades } = await supabase
    .from('student_grades')
    .select('subject_id, nilai_angka, capaian_kompetensi')
    .eq('student_id', student_id)

  const gradeMap = new Map<string, { nilai: number | null; cp: string }>()
  ;(grades ?? []).forEach((g: any) => {
    gradeMap.set(g.subject_id, {
      nilai: g.nilai_angka,
      cp: g.capaian_kompetensi ?? '',
    })
  })

  const mapelItems = (mapelMapping ?? []).map((m: any) => ({
    urutan: m.urutan,
    kategori: m.kategori,
    nama: m.subjects?.nama,
    nilai: gradeMap.get(m.subject_id)?.nilai ?? null,
    cp: gradeMap.get(m.subject_id)?.cp ?? '',
  }))

  const { data: ekskul } = await supabase
    .from('extracurriculars')
    .select('nama, predikat, keterangan')
    .eq('student_id', student_id)

  const { data: absensi } = await supabase
    .from('attendances')
    .select('sakit, izin, alpha')
    .eq('student_id', student_id)
    .maybeSingle()

  const { data: catatanData } = await supabase
    .from('homeroom_notes')
    .select('catatan')
    .eq('student_id', student_id)
    .maybeSingle()

  let waliNama = '-'
  let waliNip = '-'
  let waliTtdUrl: string | null = null

  if (kelas?.wali_kelas_id) {
    // ✅ TAMBAH ttd_url
    const { data: wali } = await supabase
      .from('profiles')
      .select('nama, nip, ttd_url')
      .eq('id', kelas.wali_kelas_id)
      .single()
    waliNama = wali?.nama ?? '-'
    waliNip = wali?.nip ?? '-'
    waliTtdUrl = wali?.ttd_url ?? null
  }

  const fase = levelNama === 'X' ? 'E' : 'F'

  return {
    siswa: {
      nama: siswa.nama,
      nis: siswa.nis ?? '-',
      nisn: siswa.nisn ?? '-',
      kelas: kelas?.nama ?? '-',
      fase,
    },
    kelasNama: kelas?.nama ?? '-',
    sekolah: {
      nama: sekolah?.nama ?? '-',
      alamat: sekolah?.alamat ?? '-',
      kepala_sekolah: sekolah?.kepala_sekolah ?? '-',
      nip_kepsek: sekolah?.nip_kepsek ?? '-',
      kepala_sekolah_ttd_url: sekolah?.kepala_sekolah_ttd_url ?? null, // ✅ Tambahan
    },
    tahun: {
      tahun: tahun?.tahun ?? '-',
      semester: tahun?.semester ?? 1,
      tanggal_cetak: tahun?.tanggal_cetak ?? '',
      tempat_cetak: tahun?.tempat_cetak ?? '',
    },
    mapel: mapelItems,
    ekskul: ekskul ?? [],
    absensi: {
      sakit: absensi?.sakit ?? 0,
      izin: absensi?.izin ?? 0,
      alpha: absensi?.alpha ?? 0,
    },
    catatan: catatanData?.catatan ?? '',
    waliKelas: { nama: waliNama, nip: waliNip, ttd_url: waliTtdUrl }, // ✅ Tambahan
  }
}