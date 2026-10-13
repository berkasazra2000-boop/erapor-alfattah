// scripts/create-teachers.mjs
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Set NEXT_PUBLIC_SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY di .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const PASSWORD = 'GuruAlFattah2026!'

const teachers = [
  { email: 'wahib@alfattah.sch.id', nama: 'H. M. Wahib, S.Ag., S.Si., M.Pd.' },
  { email: 'supriyanto@alfattah.sch.id', nama: 'Drs. Supriyanto Helmi Tanjung, M.Psi.' },
  { email: 'nafi@alfattah.sch.id', nama: 'M. Nafi, S.E' },
  { email: 'sukur@alfattah.sch.id', nama: 'Sukur, S.Pd.' },
  { email: 'zuni@alfattah.sch.id', nama: 'Zuni Aliatin N, S.Si' },
  { email: 'nurkakim@alfattah.sch.id', nama: 'Nur Kakim, M.Pd' },
  { email: 'rachmad@alfattah.sch.id', nama: 'Rachmad Heri P, S.Pd' },
  { email: 'irayana@alfattah.sch.id', nama: 'Irayana, S.Pd.' },
  { email: 'farihatul@alfattah.sch.id', nama: 'Farihatul Ummah, S.Si.' },
  { email: 'dina@alfattah.sch.id', nama: 'Dina Widyawati, S.Pd.' },
  { email: 'liyatul@alfattah.sch.id', nama: 'Liyatul Muslichah, S.PdI' },
  { email: 'jadid@alfattah.sch.id', nama: 'Jadid Al Farisy, S.Pd.' },
  { email: 'isroil@alfattah.sch.id', nama: 'A. Isroil, S.Pd.I., M.Pd.' },
  { email: 'indah@alfattah.sch.id', nama: 'Indah Arifianti, S.H.' },
  { email: 'nila@alfattah.sch.id', nama: 'Nila Rahma, S.Hum' },
  { email: 'lilik@alfattah.sch.id', nama: 'Lilik Erviani, M.Si.' },
  { email: 'azra@alfattah.sch.id', nama: 'Azra Furkhanir Ramadhan, S.Kom' },
  { email: 'dinas@alfattah.sch.id', nama: 'Dinas Bayu Aji, S.Pd.' },
  { email: 'shofiyullah@alfattah.sch.id', nama: 'Muhammad Shofiyullah, S.Pd.' },
  { email: 'irssa@alfattah.sch.id', nama: 'Irssa Intan Fatiha, M.Si.' },
]

async function main() {
  console.log('Mulai buat 20 user guru...\n')

  for (const t of teachers) {
    // 1. Cek apakah user sudah ada
    const { data: existing } = await supabase.auth.admin.listUsers()
    const found = existing?.users?.find((u) => u.email === t.email)

    if (found) {
      console.log(`✓ ${t.email} — sudah ada (skip)`)
      continue
    }

    // 2. Buat user baru via Admin API (auto-confirm)
    const { data, error } = await supabase.auth.admin.createUser({
      email: t.email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { nama: t.nama },
    })

    if (error) {
      console.log(`✗ ${t.email} — ERROR: ${error.message}`)
      continue
    }

    console.log(`✓ ${t.email} — dibuat (UID: ${data.user.id})`)
  }

  console.log('\nSelesai! Lanjut insert profiles lewat SQL di Supabase:')
  console.log('---')
  console.log(`
insert into profiles (id, nama, role, school_id)
select u.id, v.nama, 'guru_mapel', (select id from schools limit 1)
from auth.users u
join (values
  ('wahib@alfattah.sch.id', 'H. M. Wahib, S.Ag., S.Si., M.Pd.'),
  -- ... (copy lengkap dari SQL yang saya kirim sebelumnya)
) as v(email, nama) on v.email = u.email
where not exists (select 1 from profiles p where p.id = u.id);
  `)
}

main()