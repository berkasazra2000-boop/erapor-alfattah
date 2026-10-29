// components/RaporContent.tsx

type MapelItem = {
  urutan: number
  kategori: 'wajib' | 'pilihan' | 'muatan_lokal'
  nama: string
  nilai: number | null
  cp: string
}

type EkskulItem = { nama: string; predikat: string; keterangan: string }

type Props = {
  sekolah: {
    nama: string
    alamat: string
    kepala_sekolah: string
    nip_kepsek: string
  }
  siswa: {
    nama: string
    nis: string
    nisn: string
    kelas: string
    fase: string
  }
  tahun: {
    tahun: string
    semester: number
    tanggal_cetak: string
    tempat_cetak: string
  }
  mapel: MapelItem[]
  ekskul: EkskulItem[]
  absensi: { sakit: number; izin: number; alpha: number }
  catatan: string
  waliKelas: { nama: string; nip: string }
  hideIdentitas?: boolean
}

function Identitas({ sekolah, siswa, tahun }: Props) {
  const labelKanan: React.CSSProperties = {
    width: '14%',
    whiteSpace: 'nowrap',
    paddingLeft: '25mm',
  }

  return (
    <table className="rapor-identitas">
      <tbody>
        <tr>
          <td style={{ width: '14%', whiteSpace: 'nowrap' }}>Nama</td>
          <td style={{ width: '2%' }}>:</td>
          <td style={{ width: '34%', whiteSpace: 'nowrap' }}>{siswa.nama}</td>
          <td style={labelKanan}>Kelas</td>
          <td style={{ width: '2%' }}>:</td>
          <td style={{ width: '34%' }}>{siswa.kelas}</td>
        </tr>
        <tr>
          <td style={{ whiteSpace: 'nowrap' }}>NIS/NISN</td>
          <td>:</td>
          <td style={{ whiteSpace: 'nowrap' }}>
            {siswa.nis} / {siswa.nisn}
          </td>
          <td style={labelKanan}>Fase</td>
          <td>:</td>
          <td>{siswa.fase}</td>
        </tr>
        <tr>
          <td style={{ whiteSpace: 'nowrap' }}>Nama Sekolah</td>
          <td>:</td>
          <td style={{ whiteSpace: 'nowrap' }}>{sekolah.nama}</td>
          <td style={labelKanan}>Semester</td>
          <td>:</td>
          <td>{tahun.semester}</td>
        </tr>
        <tr>
          <td style={{ whiteSpace: 'nowrap' }}>Alamat</td>
          <td>:</td>
          <td style={{ whiteSpace: 'nowrap' }}>{sekolah.alamat}</td>
          <td style={labelKanan}>Tahun Ajaran</td>
          <td>:</td>
          <td>{tahun.tahun}</td>
        </tr>
      </tbody>
    </table>
  )
}

function MapelRow({ m, no }: { m: MapelItem; no: number }) {
  return (
    <tr>
      <td className="center">{no}</td>
      <td>{m.nama}</td>
      <td className="center">{m.nilai ?? ''}</td>
      <td className="cp">{m.cp || ''}</td>
    </tr>
  )
}

export default function RaporContent({
  sekolah,
  siswa,
  tahun,
  mapel,
  ekskul,
  absensi,
  catatan,
  waliKelas,
  hideIdentitas = false,
}: Props) {
  const wajib = mapel.filter((m) => m.kategori === 'wajib')
  const pilihan = mapel.filter((m) => m.kategori === 'pilihan')
  const mulok = mapel.filter((m) => m.kategori === 'muatan_lokal')

  // const tanggalIndo = new Date().toLocaleDateString('id-ID', {
  //   day: 'numeric',
  //   month: 'long',
  //   year: 'numeric',
  // })

  const tanggalIndo = '24 Oktober 2026'

  const startPilihan = wajib.length + 1
  const startMulok = wajib.length + pilihan.length + 1

  return (
    <div className="rapor-page">
      {!hideIdentitas && (
        <>
          <Identitas
            sekolah={sekolah}
            siswa={siswa}
            tahun={tahun}
            mapel={[]}
            ekskul={[]}
            absensi={absensi}
            catatan=""
            waliKelas={waliKelas}
          />
          <hr className="rapor-separator" />
        </>
      )}

      <div className="rapor-judul" style={{ textAlign: 'center', fontWeight: 'bold', margin: '14px 0' }}>
        <div style={{ fontSize: '13pt' }}>LAPORAN HASIL BELAJAR</div>
        <div style={{ fontSize: '11pt', marginTop: '4px' }}>PENILAIAN SUMATIF TENGAH SEMESTER (PSTS)</div>
      </div>

      <table className="rapor-table">
        <thead>
          <tr>
            <th style={{ width: '5%' }}>No</th>
            <th style={{ width: '24%' }}>Mata Pelajaran</th>
            <th style={{ width: '13%', whiteSpace: 'nowrap' }}>Nilai</th>
            <th>Deskripsi</th>
          </tr>
        </thead>
        <tbody>
          {wajib.length > 0 && (
            <>
              <tr className="section-row">
                <td colSpan={4}>Mata Pelajaran Wajib</td>
              </tr>
              {wajib.map((m, i) => (
                <MapelRow key={`w-${m.nama}`} m={m} no={i + 1} />
              ))}
            </>
          )}

          {pilihan.length > 0 && (
            <>
              <tr className="section-row">
                <td colSpan={4}>Kelompok Pilihan</td>
              </tr>
              {pilihan.map((m, i) => (
                <MapelRow key={`p-${m.nama}`} m={m} no={startPilihan + i} />
              ))}
            </>
          )}

          {mulok.length > 0 && (
            <>
              <tr className="section-row">
                <td colSpan={4}>Muatan Lokal</td>
              </tr>
              {mulok.map((m, i) => (
                <MapelRow key={`m-${m.nama}`} m={m} no={startMulok + i} />
              ))}
            </>
          )}
        </tbody>
      </table>

      {ekskul.length > 0 && (
        <table className="rapor-table" style={{ marginTop: '14px' }}>
          <thead>
            <tr>
              <th style={{ width: '5%' }}>No.</th>
              <th style={{ width: '24%' }}>Kegiatan Ekstrakurikuler</th>
              <th style={{ width: '10%', whiteSpace: 'nowrap' }}>Predikat</th>
              <th>Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {ekskul.map((e, i) => (
              <tr key={i}>
                <td className="center">{i + 1}</td>
                <td>{e.nama}</td>
                <td className="center">{e.predikat}</td>
                <td className="cp">{e.keterangan}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <table className="rapor-table" style={{ width: '55%', marginTop: '10px' }}>
        <tbody>
          <tr>
            <td style={{ width: '45%' }}>Sakit</td>
            <td style={{ width: '5%' }}>:</td>
            <td className="center">{absensi.sakit} hari</td>
          </tr>
          <tr>
            <td>Izin</td>
            <td>:</td>
            <td className="center">{absensi.izin} hari</td>
          </tr>
          <tr>
            <td>Tanpa Keterangan</td>
            <td>:</td>
            <td className="center">{absensi.alpha} hari</td>
          </tr>
        </tbody>
      </table>

      <div className="rapor-catatan-label">CATATAN WALI KELAS</div>
      <div className="rapor-catatan-box">
        {catatan ? <>&ldquo;{catatan}&rdquo;</> : <>&nbsp;</>}
      </div>

      {/* ====== BLOK TTD ====== */}
      <div className="rapor-ttd-block">
        <table
          style={{
            width: '100%',
            fontSize: '10pt',
            borderCollapse: 'collapse',
            marginTop: '24px',
          }}
        >
          <tbody>
            <tr>
              <td style={{ width: '50%', textAlign: 'left', verticalAlign: 'top' }}>
                <div>Mengetahui</div>
                <div style={{ fontWeight: 'bold' }}>Orang Tua/Wali,</div>
              </td>
              <td
                style={{
                  width: '50%',
                  textAlign: 'left',
                  verticalAlign: 'top',
                  paddingLeft: '20mm',
                }}
              >
                <div style={{ fontWeight: 'bold' }}>
                  {tahun.tempat_cetak || 'Lamongan'}, {tanggalIndo}
                </div>
                <div style={{ fontWeight: 'bold' }}>Wali Kelas,</div>
              </td>
            </tr>
            <tr>
              <td style={{ height: '80px' }}></td>
              <td></td>
            </tr>
            <tr>
              <td style={{ textAlign: 'left', verticalAlign: 'bottom' }}>
                <div style={{ letterSpacing: '2px' }}>..............................</div>
              </td>
              <td
                style={{
                  textAlign: 'left',
                  verticalAlign: 'bottom',
                  paddingLeft: '20mm',
                }}
              >
                <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>
                  {waliKelas.nama}
                </div>
                <div>NIP. {waliKelas.nip || '-'}</div>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '10pt' }}>
          <div>Mengetahui,</div>
          <div style={{ fontWeight: 'bold' }}>Kepala Sekolah</div>
          <div style={{ height: '80px' }}></div>
          <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>
            {sekolah.kepala_sekolah}
          </div>
          <div>NIP. {sekolah.nip_kepsek || '-'}</div>
        </div>
      </div>

      
    </div>
  )
}