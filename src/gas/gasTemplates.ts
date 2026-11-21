export const GAS_CODE_GS = `/**
 * =========================================================================
 * SINERGI PAIBP - Sistem Informasi dan Evaluasi Terintegrasi PAIBP
 * File: Code.gs (Backend Google Apps Script)
 * Database: Google Sheets bernama "SINERGI-PAIBP"
 * =========================================================================
 */

const SPREADSHEET_NAME = 'SINERGI-PAIBP';

const SHEET_SCHEMA = {
  'Users Guru': ['UserID', 'Username', 'Password', 'NamaGuru', 'Mapel', 'Role'],
  'User Orangtua': ['UserID', 'Username', 'Password'],
  'Data_Siswa': ['NISN', 'NamaSiswa', 'Kelas', 'JenisKelamin', 'KontakOrtu', 'FotoSiswa'],
  'Jadwal_Pelajaran': ['IDJadwal', 'Hari', 'Jam', 'Kelas'],
  'Absensi': ['IDAbsensi', 'Tanggal', 'NISN', 'NamaSiswa', 'Kelas', 'Status', 'Keterangan'],
  'Nilai': ['IDNilai', 'NISN', 'NamaSiswa', 'Kelas', 'Mapel', 'JenisEvaluasi', 'Nilai', 'Semester'],
  'Arsip_Soal': ['IDSoal', 'Mapel', 'Kelas', 'Topik', 'LinkDriveSoal', 'TanggalUpload'],
  'Jurnal_Harian': ['IDJurnal', 'Tanggal', 'Kelas', 'Mapel', 'Materi', 'CatatanKejadian', 'Tindakan'],
  'Catatan_Siswa': ['IDCatatan', 'Tanggal', 'NISN', 'NamaSiswa', 'Kelas', 'JenisCatatan', 'Detail'],
  'Sertifikat': ['IDSertifikat', 'NISN', 'NamaSiswa', 'Kelas', 'NamaPenghargaan', 'Tanggal', 'LinkFile'],
  'Evaluasi setor hafalan': ['IDHafalan', 'NISN', 'Hari/Tanggal', 'Nama Siswa', 'Kelas', 'Nama Surah', 'Nilai', 'Catatan Evaluasi'],
  'Tugas': [
    'IDTugas', 'TanggalBuat', 'Kelas', 'Mapel', 'JudulTugas', 'Deskripsi', 'Tenggat', 'LinkMateri',
    'NISN_Pengumpul', 'NamaSiswa', 'LinkPengumpulan', 'TanggalKumpul', 'StatusPengumpulan', 'NilaiTugas', 'CatatanGuru'
  ],
  'Profil_Guru': ['Key', 'Nama', 'Email', 'Alamat', 'TikTok', 'YouTube', 'WhatsApp', 'FotoGuru'],
  'Log_WhatsApp': ['IDLog', 'TanggalKirim', 'NISN', 'NamaSiswa', 'KontakOrtu', 'Modul', 'StatusKirim']
};

/**
 * Mengambil atau membuat spreadsheet bernama SINERGI-PAIBP
 */
function getSpreadsheet_() {
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active && active.getName() === SPREADSHEET_NAME) {
    return active;
  }
  const files = DriveApp.getFilesByName(SPREADSHEET_NAME);
  if (files.hasNext()) {
    return SpreadsheetApp.open(files.next());
  }
  if (active) {
    active.rename(SPREADSHEET_NAME);
    return active;
  }
  return SpreadsheetApp.create(SPREADSHEET_NAME);
}

/**
 * 1. OOTB TAB CREATION (Otomatis)
 * Jalankan fungsi setupDatabase() pertama kali untuk membuat semua tab & header
 */
function setupDatabase() {
  const ss = getSpreadsheet_();
  const createdTabs = [];

  Object.keys(SHEET_SCHEMA).forEach(function (tabName) {
    let sheet = ss.getSheetByName(tabName);
    const headers = SHEET_SCHEMA[tabName];

    if (!sheet) {
      sheet = ss.insertSheet(tabName);
      createdTabs.push(tabName);
    }

    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length)
        .setFontWeight('bold')
        .setBackground('#065f46')
        .setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }
  });

  // Seed akun default Guru & Profil Guru jika masih kosong
  const guruSheet = ss.getSheetByName('Users Guru');
  if (guruSheet.getLastRow() <= 1) {
    guruSheet.appendRow(['G-001', 'guru', '123456', 'Guru PAIBP', 'PAIBP', 'Admin Guru']);
  }

  const profilSheet = ss.getSheetByName('Profil_Guru');
  if (profilSheet.getLastRow() <= 1) {
    profilSheet.appendRow([
      'MAIN',
      'Nama Guru PAIBP, S.Pd.I.',
      'guru.paibp@sekolah.sch.id',
      'Jl. Pendidikan Islam No. 1',
      'https://tiktok.com/@gurupaibp',
      'https://youtube.com/@sinergipaibp',
      '6281234567890',
      ''
    ]);
  }

  return {
    success: true,
    spreadsheetUrl: ss.getUrl(),
    spreadsheetName: ss.getName(),
    createdTabs: createdTabs
  };
}

/**
 * Routing Web App:
 * - Link Guru:     <WEB_APP_URL> atau <WEB_APP_URL>?role=guru
 * - Link Orangtua: <WEB_APP_URL>?role=orangtua
 */
function doGet(e) {
  const roleParam = (e && e.parameter && e.parameter.role) ? String(e.parameter.role).toLowerCase() : 'guru';
  const portalMode = roleParam === 'orangtua' ? 'orangtua' : 'guru';

  const template = HtmlService.createTemplateFromFile('Index');
  template.portalMode = portalMode;
  template.webAppUrl = ScriptApp.getService().getUrl();

  return template.evaluate()
    .setTitle('SINERGI PAIBP - Sistem Informasi dan Evaluasi Terintegrasi PAIBP')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Helper konversi baris sheet menjadi array objek JSON
 */
function sheetToObjects_(sheetName) {
  const ss = getSpreadsheet_();
  const sheet = ss.getSheetByName(tabAlias_(sheetName));
  if (!sheet || sheet.getLastRow() < 2) return [];

  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const rows = [];

  for (let i = 1; i < values.length; i++) {
    const obj = { _rowIndex: i + 1 };
    headers.forEach(function (h, colIdx) {
      let val = values[i][colIdx];
      if (val instanceof Date) {
        val = Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      }
      obj[String(h)] = val !== undefined && val !== null ? String(val) : '';
    });
    rows.push(obj);
  }
  return rows;
}

function tabAlias_(name) {
  return name;
}

/**
 * Autentikasi Login Guru dan Orangtua
 */
function loginUser(role, username, password) {
  const cleanUser = String(username || '').trim();
  const cleanPass = String(password || '').trim();

  if (role === 'orangtua') {
    const ortuList = sheetToObjects_('User Orangtua');
    const foundOrtu = ortuList.find(function (u) {
      return u.Username === cleanUser && u.Password === cleanPass;
    });
    if (!foundOrtu) {
      return { success: false, message: 'NISN atau Password Orangtua tidak sesuai.' };
    }
    const siswaList = sheetToObjects_('Data_Siswa');
    const siswa = siswaList.find(function (s) { return s.NISN === cleanUser; }) || null;
    return {
      success: true,
      user: {
        role: 'orangtua',
        userId: foundOrtu.UserID,
        username: foundOrtu.Username,
        nisn: foundOrtu.Username,
        displayName: siswa ? 'Wali dari ' + siswa.NamaSiswa : 'Orangtua NISN ' + cleanUser
      }
    };
  }

  const guruList = sheetToObjects_('Users Guru');
  const foundGuru = guruList.find(function (u) {
    return u.Username.toLowerCase() === cleanUser.toLowerCase() && u.Password === cleanPass;
  });
  if (!foundGuru) {
    return { success: false, message: 'Username atau Password Guru tidak sesuai.' };
  }
  return {
    success: true,
    user: {
      role: 'guru',
      userId: foundGuru.UserID,
      username: foundGuru.Username,
      displayName: foundGuru.NamaGuru
    }
  };
}

/**
 * Mengambil seluruh data untuk Dashboard & Modul Guru
 */
function getAllData() {
  const profilRows = sheetToObjects_('Profil_Guru');
  return {
    teacherProfile: profilRows[0] || {},
    usersGuru: sheetToObjects_('Users Guru'),
    userOrangtua: sheetToObjects_('User Orangtua'),
    dataSiswa: sheetToObjects_('Data_Siswa'),
    jadwalPelajaran: sheetToObjects_('Jadwal_Pelajaran'),
    absensi: sheetToObjects_('Absensi'),
    nilai: sheetToObjects_('Nilai'),
    arsipSoal: sheetToObjects_('Arsip_Soal'),
    jurnalHarian: sheetToObjects_('Jurnal_Harian'),
    catatanSiswa: sheetToObjects_('Catatan_Siswa'),
    sertifikat: sheetToObjects_('Sertifikat'),
    evaluasiHafalan: sheetToObjects_('Evaluasi setor hafalan'),
    tugas: sheetToObjects_('Tugas')
  };
}

/**
 * Mengambil data khusus Orangtua (Read-Only: Profil Anak, Nilai, dan Evaluasi Setor Hafalan)
 */
function getParentPortalData(nisn) {
  const siswa = sheetToObjects_('Data_Siswa').find(function (s) { return s.NISN === nisn; }) || null;
  const nilai = sheetToObjects_('Nilai').filter(function (n) { return n.NISN === nisn; });
  const hafalan = sheetToObjects_('Evaluasi setor hafalan').filter(function (h) { return h.NISN === nisn; });
  return {
    siswa: siswa,
    nilai: nilai,
    evaluasiHafalan: hafalan
  };
}

/**
 * CRUD: Simpan Data Baru (Create)
 */
function saveRecord(sheetName, payload) {
  const ss = getSpreadsheet_();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error('Tab "' + sheetName + '" tidak ditemukan. Jalankan setupDatabase() terlebih dahulu.');

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const rowValues = headers.map(function (h) {
    return payload[String(h)] !== undefined ? payload[String(h)] : '';
  });

  sheet.appendRow(rowValues);
  return { success: true, message: 'Data berhasil ditambahkan ke ' + sheetName };
}

/**
 * CRUD: Edit / Perbarui Data (Update berdasarkan _rowIndex)
 */
function updateRecord(sheetName, rowIndex, payload) {
  const ss = getSpreadsheet_();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error('Tab "' + sheetName + '" tidak ditemukan.');

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const rowValues = headers.map(function (h) {
    return payload[String(h)] !== undefined ? payload[String(h)] : '';
  });

  sheet.getRange(Number(rowIndex), 1, 1, headers.length).setValues([rowValues]);
  return { success: true, message: 'Data berhasil diperbarui.' };
}

/**
 * CRUD: Hapus Data (Delete berdasarkan _rowIndex)
 */
function deleteRecord(sheetName, rowIndex) {
  const ss = getSpreadsheet_();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error('Tab "' + sheetName + '" tidak ditemukan.');

  sheet.deleteRow(Number(rowIndex));
  return { success: true, message: 'Data berhasil dihapus.' };
}

/**
 * Simpan Profil Guru beserta Foto Base64/URL
 */
function saveTeacherProfile(profile) {
  const ss = getSpreadsheet_();
  const sheet = ss.getSheetByName('Profil_Guru');
  if (!sheet) throw new Error('Tab Profil_Guru tidak ditemukan.');

  const rowValues = [
    'MAIN',
    profile.Nama || '',
    profile.Email || '',
    profile.Alamat || '',
    profile.TikTok || '',
    profile.YouTube || '',
    profile.WhatsApp || '',
    profile.FotoGuru || ''
  ];

  if (sheet.getLastRow() >= 2) {
    sheet.getRange(2, 1, 1, 8).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }
  return { success: true };
}

/**
 * Unggah Foto Profil Siswa oleh Orangtua (tersimpan di kolom FotoSiswa tab Data_Siswa)
 */
function uploadStudentPhoto(nisn, fotoDataUrl) {
  const ss = getSpreadsheet_();
  const sheet = ss.getSheetByName('Data_Siswa');
  if (!sheet) throw new Error('Tab Data_Siswa tidak ditemukan.');

  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const nisnIdx = headers.indexOf('NISN');
  let fotoIdx = headers.indexOf('FotoSiswa');

  if (fotoIdx === -1) {
    fotoIdx = headers.length;
    sheet.getRange(1, fotoIdx + 1).setValue('FotoSiswa');
  }

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][nisnIdx]) === String(nisn)) {
      sheet.getRange(i + 1, fotoIdx + 1).setValue(fotoDataUrl);
      return { success: true };
    }
  }
  return { success: false, message: 'NISN siswa tidak ditemukan.' };
}

/**
 * Kirim Notifikasi WhatsApp Ringkasan Nilai / Setor Hafalan ke KontakOrtu di Data_Siswa
 * Konfigurasi Script Properties di Apps Script:
 * - WHATSAPP_API_URL   (contoh: https://api.fonnte.com/send)
 * - WHATSAPP_API_TOKEN (token gateway WhatsApp Anda)
 */
function sendWhatsAppNotification(nisn, modul, customNote) {
  const siswa = sheetToObjects_('Data_Siswa').find(function (s) { return s.NISN === String(nisn); });
  if (!siswa) return { success: false, message: 'Data siswa tidak ditemukan di Data_Siswa.' };

  let phone = String(siswa.KontakOrtu || '').replace(/\\D/g, '');
  if (phone.indexOf('0') === 0) phone = '62' + phone.slice(1);
  if (!phone) return { success: false, message: 'KontakOrtu belum diisi di Data_Siswa.' };

  const nilaiRows = sheetToObjects_('Nilai').filter(function (n) { return n.NISN === String(nisn); });
  const hafalanRows = sheetToObjects_('Evaluasi setor hafalan').filter(function (h) { return h.NISN === String(nisn); });

  const avgNilai = nilaiRows.length
    ? (nilaiRows.reduce(function (a, b) { return a + Number(b.Nilai || 0); }, 0) / nilaiRows.length).toFixed(1)
    : '-';
  const avgHafalan = hafalanRows.length
    ? (hafalanRows.reduce(function (a, b) { return a + Number(b.Nilai || 0); }, 0) / hafalanRows.length).toFixed(1)
    : '-';

  const pesan = [
    '*SINERGI PAIBP - Ringkasan Perkembangan Siswa*',
    "Assalamu'alaikum Wr. Wb.",
    'Yth. Wali dari *' + siswa.NamaSiswa + '* (Kelas ' + siswa.Kelas + ')',
    '',
    'Pembaruan Modul: *' + modul + '*',
    '• Rata-rata Nilai PAIBP: ' + avgNilai + ' (' + nilaiRows.length + ' evaluasi)',
    '• Rata-rata Setor Hafalan: ' + avgHafalan + ' (' + hafalanRows.length + ' setoran)',
    customNote ? ('Catatan Guru: ' + customNote) : '',
    '',
    "Wassalamu'alaikum Wr. Wb."
  ].filter(Boolean).join('\\n');

  const props = PropertiesService.getScriptProperties();
  const apiUrl = props.getProperty('WHATSAPP_API_URL');
  const apiToken = props.getProperty('WHATSAPP_API_TOKEN');
  let statusKirim = 'Siap Kirim (WhatsApp Web)';

  if (apiUrl && apiToken) {
    const resp = UrlFetchApp.fetch(apiUrl, {
      method: 'post',
      headers: { Authorization: apiToken },
      contentType: 'application/json',
      payload: JSON.stringify({ target: phone, message: pesan, countryCode: '62' }),
      muteHttpExceptions: true
    });
    statusKirim = resp.getResponseCode() >= 200 && resp.getResponseCode() < 300 ? 'Terkirim via API' : 'Gagal API';
  }

  const ss = getSpreadsheet_();
  const logSheet = ss.getSheetByName('Log_WhatsApp');
  if (logSheet) {
    logSheet.appendRow(['WA-' + Date.now(), new Date().toISOString(), siswa.NISN, siswa.NamaSiswa, phone, modul, statusKirim]);
  }

  return {
    success: true,
    statusKirim: statusKirim,
    targetPhone: phone,
    waUrl: 'https://wa.me/' + phone + '?text=' + encodeURIComponent(pesan)
  };
}
`;

export const GAS_INDEX_HTML = `<!DOCTYPE html>
<html lang="id" data-bs-theme="light">
<head>
  <meta charset="UTF-8">
  <title>SINERGI PAIBP - Sistem Informasi dan Evaluasi Terintegrasi</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js"></script>
  <?!= include('CSS'); ?>
</head>
<body>
  <script>
    window.PORTAL_MODE = "<?= portalMode ?>";
    window.WEB_APP_URL = "<?= webAppUrl ?>";
  </script>

  <!-- VIEW LOGIN (Akses Terpisah Guru & Orangtua) -->
  <div id="loginSection" class="login-wrapper d-flex align-items-center justify-content-center min-vh-100 p-3">
    <div class="card shadow-lg border-0 login-card">
      <div class="card-body p-4 p-md-5">
        <div class="text-center mb-4">
          <div class="brand-emblem mx-auto mb-3"><i class="bi bi-book-half"></i></div>
          <h4 class="fw-bold mb-1">SINERGI PAIBP</h4>
          <p class="text-muted small mb-0">Sistem Informasi dan Evaluasi Terintegrasi PAIBP</p>
        </div>

        <div class="btn-group w-100 mb-3" role="group">
          <button type="button" class="btn btn-outline-success active" id="btnSwitchGuru" onclick="switchLoginMode('guru')">
            <i class="bi bi-person-workspace me-1"></i> Login Guru
          </button>
          <button type="button" class="btn btn-outline-success" id="btnSwitchOrtu" onclick="switchLoginMode('orangtua')">
            <i class="bi bi-people me-1"></i> Login Orangtua
          </button>
        </div>

        <form id="loginForm" onsubmit="handleLogin(event)">
          <div class="mb-3">
            <label class="form-label small fw-semibold" id="lblUsername">Username Guru</label>
            <input type="text" id="loginUsername" class="form-control" required placeholder="Masukkan username">
          </div>
          <div class="mb-3">
            <label class="form-label small fw-semibold">Password</label>
            <input type="password" id="loginPassword" class="form-control" required placeholder="Masukkan password">
          </div>
          <div id="loginError" class="alert alert-danger py-2 small d-none"></div>
          <button type="submit" class="btn btn-success w-100 fw-semibold py-2" id="btnLoginSubmit">Masuk Aplikasi</button>
        </form>

        <hr class="my-4">
        <div class="small text-muted">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span>Link Khusus Guru:</span>
            <button type="button" class="btn btn-link btn-sm p-0 text-decoration-none" onclick="copyPortalLink('guru')">Salin Link</button>
          </div>
          <div class="d-flex justify-content-between align-items-center">
            <span>Link Khusus Orangtua:</span>
            <button type="button" class="btn btn-link btn-sm p-0 text-decoration-none" onclick="copyPortalLink('orangtua')">Salin Link</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- MAIN APP SHELL -->
  <div id="appSection" class="d-none">
    <!-- Top Navbar -->
    <nav class="navbar navbar-expand-lg border-bottom sticky-top bg-body-tertiary px-3 no-print">
      <div class="container-fluid">
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-outline-secondary btn-sm d-lg-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebarOffcanvas">
            <i class="bi bi-list"></i>
          </button>
          <span class="navbar-brand fw-bold mb-0 text-success">SINERGI PAIBP</span>
          <span class="text-muted small d-none d-md-inline" id="topUserInfo"></span>
        </div>

        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-outline-secondary btn-sm" id="btnMusicToggle" onclick="toggleAmbientMusic()" title="Instrumen Semangat">
            <i class="bi bi-music-note-beamed me-1"></i> <span id="musicLabel">Instrumen Semangat</span>
          </button>
          <button class="btn btn-outline-secondary btn-sm" id="btnThemeToggle" onclick="toggleTheme()" title="Mode Terang / Gelap">
            <i class="bi bi-moon-stars" id="themeIcon"></i>
          </button>
          <button class="btn btn-success btn-sm d-none" id="btnPrintPdfTop" onclick="openPdfReportModal()">
            <i class="bi bi-printer me-1"></i> Cetak PDF
          </button>
          <button class="btn btn-outline-danger btn-sm" onclick="logoutUser()">
            <i class="bi bi-box-arrow-right me-1"></i> Keluar
          </button>
        </div>
      </div>
    </nav>

    <div class="d-flex">
      <!-- Sidebar Navigasi -->
      <aside class="sidebar border-end bg-body no-print d-none d-lg-block" id="desktopSidebar">
        <div class="p-3" id="sidebarMenuContainer"></div>
      </aside>

      <!-- Mobile Offcanvas Sidebar -->
      <div class="offcanvas offcanvas-start no-print" tabindex="-1" id="sidebarOffcanvas">
        <div class="offcanvas-header border-bottom">
          <h5 class="offcanvas-title fw-bold text-success">SINERGI PAIBP</h5>
          <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
        </div>
        <div class="offcanvas-body p-3" id="mobileMenuContainer"></div>
      </div>

      <!-- Konten Utama -->
      <main class="flex-grow-1 p-3 p-md-4 main-viewport">
        <!-- View Dashboard Guru -->
        <section id="viewDashboard" class="d-none">
          <div class="row g-4 mb-4">
            <!-- Profil Guru -->
            <div class="col-lg-5">
              <div class="card h-100 shadow-sm">
                <div class="card-body">
                  <div class="d-flex align-items-start gap-3 mb-3">
                    <div class="position-relative">
                      <img id="guruPhotoImg" src="" alt="Foto Guru" class="rounded-circle object-fit-cover border" width="76" height="76">
                      <label for="guruPhotoInput" class="btn btn-sm btn-success rounded-circle position-absolute bottom-0 end-0 p-1" title="Unggah Foto Guru">
                        <i class="bi bi-camera-fill small"></i>
                      </label>
                      <input type="file" id="guruPhotoInput" accept="image/*" class="d-none" onchange="handleTeacherPhotoUpload(event)">
                    </div>
                    <div class="flex-grow-1">
                      <h5 class="fw-bold mb-1" id="guruNamaText">-</h5>
                      <div class="small text-muted mb-1" id="guruEmailText">-</div>
                      <div class="small text-muted" id="guruAlamatText">-</div>
                    </div>
                  </div>
                  <div class="d-flex flex-wrap gap-2 mb-3">
                    <a id="linkTikTok" href="#" target="_blank" class="btn btn-outline-secondary btn-sm"><i class="bi bi-tiktok me-1"></i>TikTok</a>
                    <a id="linkYouTube" href="#" target="_blank" class="btn btn-outline-danger btn-sm"><i class="bi bi-youtube me-1"></i>YouTube</a>
                    <a id="linkWhatsApp" href="#" target="_blank" class="btn btn-outline-success btn-sm"><i class="bi bi-whatsapp me-1"></i>WhatsApp</a>
                  </div>
                  <button class="btn btn-sm btn-outline-primary w-100" onclick="openEditProfileModal()">
                    <i class="bi bi-pencil-square me-1"></i> Edit Profil & Media Sosial Guru
                  </button>
                </div>
              </div>
            </div>

            <!-- Rekapitulasi & Filter Dropdown Bulan/Tahun + Chart -->
            <div class="col-lg-7">
              <div class="card h-100 shadow-sm">
                <div class="card-body">
                  <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                    <div>
                      <h6 class="fw-bold mb-0">Rekapitulasi Siswa & Absensi</h6>
                      <small class="text-muted">Total Siswa Terdaftar: <strong id="totalSiswaCount">0</strong></small>
                    </div>
                    <div class="d-flex gap-2">
                      <select id="filterBulan" class="form-select form-select-sm" onchange="renderDashboardCharts()"></select>
                      <select id="filterTahun" class="form-select form-select-sm" onchange="renderDashboardCharts()"></select>
                    </div>
                  </div>
                  <canvas id="absensiChartCanvas" height="145"></canvas>
                </div>
              </div>
            </div>
          </div>

          <div class="card shadow-sm">
            <div class="card-body d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div>
                <h6 class="fw-bold mb-1">Cetak Laporan Rekapitulasi Resmi PAIBP</h6>
                <p class="small text-muted mb-0">Unduh atau cetak rekap Nilai dan Evaluasi Setor Hafalan ke format PDF yang rapi.</p>
              </div>
              <button class="btn btn-success" onclick="openPdfReportModal()">
                <i class="bi bi-file-earmark-pdf me-1"></i> Buka Cetak Laporan PDF
              </button>
            </div>
          </div>
        </section>

        <!-- View CRUD Modul Guru -->
        <section id="viewModuleTable" class="d-none">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <div>
              <h5 class="fw-bold mb-0" id="moduleTitle">Modul Data</h5>
              <small class="text-muted" id="moduleSubtitle">Terhubung real-time dengan Google Sheets SINERGI-PAIBP</small>
            </div>
            <div class="d-flex gap-2">
              <input type="text" id="tableSearchInput" class="form-control form-control-sm" placeholder="Cari data..." oninput="renderActiveTable()">
              <button class="btn btn-outline-secondary btn-sm text-nowrap" onclick="exportActiveTableCsv()">
                <i class="bi bi-download me-1"></i> Ekspor ke CSV
              </button>
              <button class="btn btn-success btn-sm text-nowrap" onclick="openCrudModal(null)">
                <i class="bi bi-plus-lg me-1"></i> Tambah Data
              </button>
            </div>
          </div>
          <div class="card shadow-sm">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0 small" id="crudDataTable">
                <thead class="table-light" id="crudTableHead"></thead>
                <tbody id="crudTableBody"></tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- View Portal Orangtua (Read-Only Nilai & Setor Hafalan + Upload Foto Anak) -->
        <section id="viewParentPortal" class="d-none">
          <div class="card shadow-sm mb-4">
            <div class="card-body d-flex flex-wrap align-items-center gap-3">
              <div class="position-relative">
                <img id="ortuStudentPhoto" src="" alt="Foto Siswa" class="rounded-circle object-fit-cover border" width="84" height="84">
                <label for="ortuPhotoInput" class="btn btn-sm btn-success rounded-circle position-absolute bottom-0 end-0 p-1" title="Unggah Foto Profil Siswa">
                  <i class="bi bi-camera-fill"></i>
                </label>
                <input type="file" id="ortuPhotoInput" accept="image/*" class="d-none" onchange="handleStudentPhotoUpload(event)">
              </div>
              <div>
                <h5 class="fw-bold mb-1" id="ortuStudentName">Nama Siswa</h5>
                <div class="small text-muted" id="ortuStudentMeta">NISN · Kelas</div>
                <div class="small text-success mt-1"><i class="bi bi-camera me-1"></i>Klik ikon kamera pada foto untuk memperbarui foto profil ananda.</div>
              </div>
            </div>
          </div>

          <ul class="nav nav-tabs mb-3">
            <li class="nav-item">
              <button class="nav-link active" id="tabOrtuNilai" onclick="switchParentTab('nilai')">Capaian Nilai</button>
            </li>
            <li class="nav-item">
              <button class="nav-link" id="tabOrtuHafalan" onclick="switchParentTab('hafalan')">Evaluasi Setor Hafalan</button>
            </li>
          </ul>

          <div class="card shadow-sm">
            <div class="table-responsive">
              <table class="table table-striped align-middle mb-0 small">
                <thead id="parentTableHead"></thead>
                <tbody id="parentTableBody"></tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- Area Cetak PDF Resmi (Nilai & Evaluasi Setor Hafalan) -->
        <section id="viewPrintReport" class="d-none print-only-area">
          <div class="d-flex justify-content-between align-items-center mb-3 no-print">
            <div class="d-flex gap-2">
              <select id="printJenisLaporan" class="form-select form-select-sm" onchange="renderPrintPreview()">
                <option value="gabungan">Rekap Nilai & Evaluasi Setor Hafalan</option>
                <option value="nilai">Rekap Nilai Saja</option>
                <option value="hafalan">Rekap Setor Hafalan Saja</option>
              </select>
              <select id="printFilterKelas" class="form-select form-select-sm" onchange="renderPrintPreview()"></select>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-outline-secondary btn-sm" onclick="closePdfReport()">Kembali</button>
              <button class="btn btn-success btn-sm" onclick="window.print()"><i class="bi bi-printer me-1"></i> Cetak / Simpan PDF</button>
            </div>
          </div>
          <div class="card p-4 border" id="printDocumentBody"></div>
        </section>
      </main>
    </div>
  </div>

  <!-- Modal CRUD Form -->
  <div class="modal fade no-print" id="crudModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <form class="modal-content" onsubmit="submitCrudForm(event)">
        <div class="modal-header">
          <h6 class="modal-title fw-bold" id="crudModalTitle">Form Data</h6>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body row g-3" id="crudFormFields"></div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Batal</button>
          <button type="submit" class="btn btn-success btn-sm">Simpan ke Google Sheets</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Modal Edit Profil Guru -->
  <div class="modal fade no-print" id="profileModal" tabindex="-1">
    <div class="modal-dialog">
      <form class="modal-content" onsubmit="submitTeacherProfile(event)">
        <div class="modal-header">
          <h6 class="modal-title fw-bold">Edit Profil Guru PAIBP</h6>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body row g-2">
          <div class="col-12"><label class="form-label small">Nama Lengkap</label><input id="profNama" class="form-control form-control-sm" required></div>
          <div class="col-12"><label class="form-label small">Email</label><input id="profEmail" type="email" class="form-control form-control-sm"></div>
          <div class="col-12"><label class="form-label small">Alamat</label><textarea id="profAlamat" class="form-control form-control-sm" rows="2"></textarea></div>
          <div class="col-12"><label class="form-label small">Link TikTok</label><input id="profTikTok" class="form-control form-control-sm"></div>
          <div class="col-12"><label class="form-label small">Link YouTube</label><input id="profYouTube" class="form-control form-control-sm"></div>
          <div class="col-12"><label class="form-label small">Nomor WhatsApp (628xxx)</label><input id="profWA" class="form-control form-control-sm"></div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Batal</button>
          <button type="submit" class="btn btn-success btn-sm">Simpan Profil</button>
        </div>
      </form>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <?!= include('JavaScript'); ?>
</body>
</html>
`;

export const GAS_JAVASCRIPT_HTML = `<script>
/* =========================================================================
 * SINERGI PAIBP - JavaScript.html (Frontend Controller & google.script.run)
 * ========================================================================= */

let CURRENT_USER = null;
let LOGIN_ROLE = window.PORTAL_MODE || 'guru';
let DB = {};
let ACTIVE_MODULE = 'dashboard';
let EDITING_ROW_INDEX = null;
let ABSENSI_CHART = null;
let PARENT_TAB = 'nilai';

const MODULES = [
  { key: 'dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
  { key: 'dataSiswa', sheet: 'Data_Siswa', label: 'Data Siswa', icon: 'bi-people', fields: ['NISN', 'NamaSiswa', 'Kelas', 'JenisKelamin', 'KontakOrtu'] },
  { key: 'jadwalPelajaran', sheet: 'Jadwal_Pelajaran', label: 'Jadwal Pelajaran', icon: 'bi-calendar-week', fields: ['IDJadwal', 'Hari', 'Jam', 'Kelas'] },
  { key: 'absensi', sheet: 'Absensi', label: 'Absensi', icon: 'bi-clipboard-check', fields: ['IDAbsensi', 'Tanggal', 'NISN', 'NamaSiswa', 'Kelas', 'Status', 'Keterangan'] },
  { key: 'nilai', sheet: 'Nilai', label: 'Nilai', icon: 'bi-award', fields: ['IDNilai', 'NISN', 'NamaSiswa', 'Kelas', 'Mapel', 'JenisEvaluasi', 'Nilai', 'Semester'] },
  { key: 'evaluasiHafalan', sheet: 'Evaluasi setor hafalan', label: 'Evaluasi Setor Hafalan', icon: 'bi-mic', fields: ['IDHafalan', 'NISN', 'Hari/Tanggal', 'Nama Siswa', 'Kelas', 'Nama Surah', 'Nilai', 'Catatan Evaluasi'] },
  { key: 'tugas', sheet: 'Tugas', label: 'Tugas Siswa', icon: 'bi-journal-check', fields: ['IDTugas', 'TanggalBuat', 'Kelas', 'Mapel', 'JudulTugas', 'Deskripsi', 'Tenggat', 'LinkMateri', 'NISN_Pengumpul', 'NamaSiswa', 'LinkPengumpulan', 'TanggalKumpul', 'StatusPengumpulan', 'NilaiTugas', 'CatatanGuru'] },
  { key: 'jurnalHarian', sheet: 'Jurnal_Harian', label: 'Jurnal Harian', icon: 'bi-journal-text', fields: ['IDJurnal', 'Tanggal', 'Kelas', 'Mapel', 'Materi', 'CatatanKejadian', 'Tindakan'] },
  { key: 'catatanSiswa', sheet: 'Catatan_Siswa', label: 'Catatan Siswa', icon: 'bi-chat-square-text', fields: ['IDCatatan', 'Tanggal', 'NISN', 'NamaSiswa', 'Kelas', 'JenisCatatan', 'Detail'] },
  { key: 'arsipSoal', sheet: 'Arsip_Soal', label: 'Arsip Soal', icon: 'bi-folder2-open', fields: ['IDSoal', 'Mapel', 'Kelas', 'Topik', 'LinkDriveSoal', 'TanggalUpload'] },
  { key: 'sertifikat', sheet: 'Sertifikat', label: 'Sertifikat', icon: 'bi-patch-check', fields: ['IDSertifikat', 'NISN', 'NamaSiswa', 'Kelas', 'NamaPenghargaan', 'Tanggal', 'LinkFile'] },
  { key: 'usersGuru', sheet: 'Users Guru', label: 'Users Guru', icon: 'bi-person-badge', fields: ['UserID', 'Username', 'Password', 'NamaGuru', 'Mapel', 'Role'] },
  { key: 'userOrangtua', sheet: 'User Orangtua', label: 'User Orangtua', icon: 'bi-person-hearts', fields: ['UserID', 'Username', 'Password'] }
];

function runGas(fnName) {
  const args = Array.prototype.slice.call(arguments, 1);
  return new Promise(function (resolve, reject) {
    google.script.run
      .withSuccessHandler(resolve)
      .withFailureHandler(reject)[fnName].apply(null, args);
  });
}

document.addEventListener('DOMContentLoaded', function () {
  switchLoginMode(LOGIN_ROLE);
  initMonthYearDropdowns();
});

function switchLoginMode(role) {
  LOGIN_ROLE = role;
  document.getElementById('btnSwitchGuru').classList.toggle('active', role === 'guru');
  document.getElementById('btnSwitchOrtu').classList.toggle('active', role === 'orangtua');
  document.getElementById('lblUsername').textContent = role === 'orangtua' ? 'Username (NISN Siswa)' : 'Username Guru';
  document.getElementById('loginUsername').placeholder = role === 'orangtua' ? 'Masukkan NISN siswa' : 'Masukkan username guru';
}

function copyPortalLink(role) {
  const baseUrl = window.WEB_APP_URL || window.location.href.split('?')[0];
  const url = baseUrl + '?role=' + role;
  navigator.clipboard.writeText(url).then(function () {
    alert('Link portal ' + role.toUpperCase() + ' berhasil disalin:\\n' + url);
  });
}

async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;
  const errBox = document.getElementById('loginError');
  errBox.classList.add('d-none');

  try {
    const res = await runGas('loginUser', LOGIN_ROLE, username, password);
    if (!res.success) {
      errBox.textContent = res.message;
      errBox.classList.remove('d-none');
      return;
    }
    CURRENT_USER = res.user;
    document.getElementById('loginSection').classList.add('d-none');
    document.getElementById('appSection').classList.remove('d-none');
    document.getElementById('topUserInfo').textContent = '· ' + CURRENT_USER.displayName;

    if (CURRENT_USER.role === 'guru') {
      document.getElementById('btnPrintPdfTop').classList.remove('d-none');
      buildSidebar();
      await reloadAllData();
      navigateModule('dashboard');
    } else {
      document.getElementById('btnPrintPdfTop').classList.add('d-none');
      buildParentSidebar();
      await loadParentPortal();
    }
  } catch (err) {
    errBox.textContent = err.message || 'Gagal terhubung ke server.';
    errBox.classList.remove('d-none');
  }
}

function logoutUser() {
  CURRENT_USER = null;
  stopAmbientMusic();
  document.getElementById('appSection').classList.add('d-none');
  document.getElementById('loginSection').classList.remove('d-none');
  document.getElementById('loginForm').reset();
}

async function reloadAllData() {
  DB = await runGas('getAllData');
  renderTeacherProfile();
  renderDashboardCharts();
  if (ACTIVE_MODULE !== 'dashboard') renderActiveTable();
}

function buildSidebar() {
  const html = MODULES.map(function (m) {
    const active = m.key === ACTIVE_MODULE ? 'active' : '';
    return '<button class="nav-link-item ' + active + '" onclick="navigateModule(\\'' + m.key + '\\')">' +
      '<i class="bi ' + m.icon + ' me-2"></i>' + m.label + '</button>';
  }).join('');
  document.getElementById('sidebarMenuContainer').innerHTML = html;
  document.getElementById('mobileMenuContainer').innerHTML = html;
}

function buildParentSidebar() {
  const html =
    '<button class="nav-link-item active" onclick="switchParentTab(\\'nilai\\')"><i class="bi bi-award me-2"></i>Nilai</button>' +
    '<button class="nav-link-item" onclick="switchParentTab(\\'hafalan\\')"><i class="bi bi-mic me-2"></i>Evaluasi Setor Hafalan</button>';
  document.getElementById('sidebarMenuContainer').innerHTML = html;
  document.getElementById('mobileMenuContainer').innerHTML = html;
}

function navigateModule(key) {
  ACTIVE_MODULE = key;
  buildSidebar();
  document.getElementById('viewPrintReport').classList.add('d-none');
  document.getElementById('viewParentPortal').classList.add('d-none');

  if (key === 'dashboard') {
    document.getElementById('viewDashboard').classList.remove('d-none');
    document.getElementById('viewModuleTable').classList.add('d-none');
    renderDashboardCharts();
  } else {
    document.getElementById('viewDashboard').classList.add('d-none');
    document.getElementById('viewModuleTable').classList.remove('d-none');
    const mod = MODULES.find(function (m) { return m.key === key; });
    document.getElementById('moduleTitle').textContent = mod.label;
    renderActiveTable();
  }
}

function renderTeacherProfile() {
  const p = DB.teacherProfile || {};
  document.getElementById('guruNamaText').textContent = p.Nama || 'Guru PAIBP';
  document.getElementById('guruEmailText').textContent = p.Email || '-';
  document.getElementById('guruAlamatText').textContent = p.Alamat || '-';
  document.getElementById('linkTikTok').href = p.TikTok || '#';
  document.getElementById('linkYouTube').href = p.YouTube || '#';
  document.getElementById('linkWhatsApp').href = p.WhatsApp ? ('https://wa.me/' + p.WhatsApp) : '#';
  document.getElementById('guruPhotoImg').src = p.FotoGuru || 'https://ui-avatars.com/api/?name=Guru+PAIBP&background=065f46&color=fff';
}

function initMonthYearDropdowns() {
  const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const mSel = document.getElementById('filterBulan');
  const ySel = document.getElementById('filterTahun');
  const now = new Date();

  mSel.innerHTML = months.map(function (name, idx) {
    const val = String(idx + 1).padStart(2, '0');
    return '<option value="' + val + '"' + (idx === now.getMonth() ? ' selected' : '') + '>' + name + '</option>';
  }).join('');

  const curYear = now.getFullYear();
  ySel.innerHTML = [curYear - 1, curYear, curYear + 1].map(function (yr) {
    return '<option value="' + yr + '"' + (yr === curYear ? ' selected' : '') + '>' + yr + '</option>';
  }).join('');
}

function renderDashboardCharts() {
  const siswa = DB.dataSiswa || [];
  document.getElementById('totalSiswaCount').textContent = siswa.length;

  const bulan = document.getElementById('filterBulan').value;
  const tahun = document.getElementById('filterTahun').value;
  const prefix = tahun + '-' + bulan;

  const absensi = (DB.absensi || []).filter(function (a) {
    return String(a.Tanggal || '').indexOf(prefix) === 0;
  });

  const counts = { Hadir: 0, Sakit: 0, Izin: 0, Alpha: 0 };
  absensi.forEach(function (a) {
    if (counts[a.Status] !== undefined) counts[a.Status]++;
  });

  const ctx = document.getElementById('absensiChartCanvas').getContext('2d');
  if (ABSENSI_CHART) ABSENSI_CHART.destroy();

  ABSENSI_CHART = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Hadir', 'Sakit', 'Izin', 'Alpha'],
      datasets: [{
        label: 'Jumlah Kehadiran (' + prefix + ')',
        data: [counts.Hadir, counts.Sakit, counts.Izin, counts.Alpha],
        backgroundColor: ['#16a34a', '#d97706', '#2563eb', '#dc2626'],
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
    }
  });
}

function getTugasReminder(row) {
  const status = String(row.StatusPengumpulan || '');
  if (status === 'Sudah Dikumpulkan' || status === 'Dinilai') return { urgent: false, label: 'Selesai' };
  const raw = String(row.Tenggat || '').trim();
  const m = raw.match(/^(\\d{4})-(\\d{2})-(\\d{2})$/);
  if (!m) return { urgent: false, label: 'Aman' };
  const due = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return { urgent: true, label: 'Pengingat · Lewat ' + Math.abs(diff) + ' hari' };
  if (diff === 0) return { urgent: true, label: 'Pengingat · Hari Ini' };
  if (diff <= 3) return { urgent: true, label: 'Pengingat · ' + diff + ' hari lagi' };
  return { urgent: false, label: 'Aman' };
}

function renderActiveTable() {
  const mod = MODULES.find(function (m) { return m.key === ACTIVE_MODULE; });
  if (!mod) return;
  const rows = DB[mod.key] || [];
  const query = (document.getElementById('tableSearchInput').value || '').toLowerCase();
  const isTugas = ACTIVE_MODULE === 'tugas';

  const filtered = rows.filter(function (r) {
    return Object.values(r).some(function (v) { return String(v).toLowerCase().indexOf(query) !== -1; });
  });

  document.getElementById('crudTableHead').innerHTML =
    '<tr>' + mod.fields.map(function (f) { return '<th>' + f + '</th>'; }).join('') +
    (isTugas ? '<th>Pengingat</th>' : '') + '<th class="text-end">Aksi</th></tr>';

  document.getElementById('crudTableBody').innerHTML = filtered.length === 0
    ? '<tr><td colspan="' + (mod.fields.length + (isTugas ? 2 : 1)) + '" class="text-center py-4 text-muted">Belum ada data.</td></tr>'
    : filtered.map(function (r) {
      const rem = isTugas ? getTugasReminder(r) : { urgent: false, label: '' };
      const rowCls = rem.urgent ? ' class="table-danger"' : '';
      const cells = mod.fields.map(function (f) { return '<td>' + (r[f] || '-') + '</td>'; }).join('');
      const remCell = isTugas
        ? '<td>' + (rem.urgent ? '<span class="badge bg-danger"><i class="bi bi-bell-fill me-1"></i>' + rem.label + '</span>' : '<span class="text-muted">' + rem.label + '</span>') + '</td>'
        : '';
      const waBtn = (ACTIVE_MODULE === 'nilai' || ACTIVE_MODULE === 'evaluasiHafalan')
        ? '<button class="btn btn-sm btn-outline-success me-1" onclick="sendWaFromRow(\\'' + String(r.NISN || '') + '\\', \\'' + mod.label + '\\')" title="Kirim WA ke Orangtua"><i class="bi bi-whatsapp"></i></button>'
        : '';
      return '<tr' + rowCls + '>' + cells + remCell + '<td class="text-end text-nowrap">' + waBtn +
        '<button class="btn btn-sm btn-outline-primary me-1" onclick="openCrudModal(' + r._rowIndex + ')"><i class="bi bi-pencil"></i></button>' +
        '<button class="btn btn-sm btn-outline-danger" onclick="deleteCrudRow(' + r._rowIndex + ')"><i class="bi bi-trash"></i></button>' +
        '</td></tr>';
    }).join('');
}

function exportActiveTableCsv() {
  const mod = MODULES.find(function (m) { return m.key === ACTIVE_MODULE; });
  if (!mod) return;
  const rows = DB[mod.key] || [];
  const query = (document.getElementById('tableSearchInput').value || '').toLowerCase();
  const filtered = rows.filter(function (r) {
    return Object.values(r).some(function (v) { return String(v).toLowerCase().indexOf(query) !== -1; });
  });
  function esc(val) {
    let s = String(val === undefined || val === null ? '' : val).replace(/\\r?\\n/g, ' ');
    if (/^[=+@]/.test(s)) s = "'" + s;
    return '"' + s.replace(/"/g, '""') + '"';
  }
  const lines = [mod.fields.map(esc).join(',')].concat(
    filtered.map(function (r) {
      return mod.fields.map(function (f) { return esc(r[f]); }).join(',');
    })
  );
  const blob = new Blob(['\\uFEFF' + lines.join('\\r\\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'SINERGI-PAIBP_' + mod.sheet.replace(/\\s+/g, '_') + '_' + new Date().toISOString().slice(0, 10) + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function sendWaFromRow(nisn, modulLabel) {
  if (!nisn) {
    alert('NISN siswa pada baris ini belum diisi.');
    return;
  }
  const note = prompt('Tambahkan catatan guru (opsional) sebelum mengirim WhatsApp ke orangtua:', '') || '';
  const res = await runGas('sendWhatsAppNotification', nisn, modulLabel, note);
  if (!res.success) {
    alert(res.message);
    return;
  }
  if (res.statusKirim === 'Terkirim via API') {
    alert('Notifikasi WhatsApp berhasil dikirim via API ke ' + res.targetPhone);
  } else {
    alert('Ringkasan siap dikirim (' + res.statusKirim + '). Membuka WhatsApp Web...');
    window.open(res.waUrl, '_blank');
  }
}

function openCrudModal(rowIndex) {
  const mod = MODULES.find(function (m) { return m.key === ACTIVE_MODULE; });
  EDITING_ROW_INDEX = rowIndex;
  const existing = rowIndex ? (DB[mod.key] || []).find(function (r) { return r._rowIndex === rowIndex; }) : {};
  document.getElementById('crudModalTitle').textContent = (rowIndex ? 'Edit ' : 'Tambah ') + mod.label;

  document.getElementById('crudFormFields').innerHTML = mod.fields.map(function (f) {
    const val = existing && existing[f] ? existing[f] : '';
    return '<div class="col-md-6"><label class="form-label small fw-semibold">' + f + '</label>' +
      '<input name="' + f + '" value="' + String(val).replace(/"/g, '&quot;') + '" class="form-control form-control-sm"></div>';
  }).join('');

  new bootstrap.Modal(document.getElementById('crudModal')).show();
}

async function submitCrudForm(e) {
  e.preventDefault();
  const mod = MODULES.find(function (m) { return m.key === ACTIVE_MODULE; });
  const formData = new FormData(e.target);
  const payload = {};
  formData.forEach(function (v, k) { payload[k] = v; });

  if (EDITING_ROW_INDEX) {
    await runGas('updateRecord', mod.sheet, EDITING_ROW_INDEX, payload);
  } else {
    await runGas('saveRecord', mod.sheet, payload);
  }
  bootstrap.Modal.getInstance(document.getElementById('crudModal')).hide();
  await reloadAllData();
}

async function deleteCrudRow(rowIndex) {
  if (!confirm('Hapus data ini dari Google Sheets?')) return;
  const mod = MODULES.find(function (m) { return m.key === ACTIVE_MODULE; });
  await runGas('deleteRecord', mod.sheet, rowIndex);
  await reloadAllData();
}

function openEditProfileModal() {
  const p = DB.teacherProfile || {};
  document.getElementById('profNama').value = p.Nama || '';
  document.getElementById('profEmail').value = p.Email || '';
  document.getElementById('profAlamat').value = p.Alamat || '';
  document.getElementById('profTikTok').value = p.TikTok || '';
  document.getElementById('profYouTube').value = p.YouTube || '';
  document.getElementById('profWA').value = p.WhatsApp || '';
  new bootstrap.Modal(document.getElementById('profileModal')).show();
}

async function submitTeacherProfile(e) {
  e.preventDefault();
  const p = DB.teacherProfile || {};
  await runGas('saveTeacherProfile', {
    Nama: document.getElementById('profNama').value,
    Email: document.getElementById('profEmail').value,
    Alamat: document.getElementById('profAlamat').value,
    TikTok: document.getElementById('profTikTok').value,
    YouTube: document.getElementById('profYouTube').value,
    WhatsApp: document.getElementById('profWA').value,
    FotoGuru: p.FotoGuru || ''
  });
  bootstrap.Modal.getInstance(document.getElementById('profileModal')).hide();
  await reloadAllData();
}

function handleTeacherPhotoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async function (ev) {
    const p = DB.teacherProfile || {};
    p.FotoGuru = ev.target.result;
    await runGas('saveTeacherProfile', p);
    await reloadAllData();
  };
  reader.readAsDataURL(file);
}

/* PORTAL ORANGTUA (READ-ONLY) */
let PARENT_DATA = { siswa: null, nilai: [], evaluasiHafalan: [] };

async function loadParentPortal() {
  document.getElementById('viewDashboard').classList.add('d-none');
  document.getElementById('viewModuleTable').classList.add('d-none');
  document.getElementById('viewParentPortal').classList.remove('d-none');

  PARENT_DATA = await runGas('getParentPortalData', CURRENT_USER.nisn);
  const s = PARENT_DATA.siswa || {};
  document.getElementById('ortuStudentName').textContent = s.NamaSiswa || 'Siswa';
  document.getElementById('ortuStudentMeta').textContent = 'NISN: ' + CURRENT_USER.nisn + ' · Kelas: ' + (s.Kelas || '-');
  document.getElementById('ortuStudentPhoto').src = s.FotoSiswa || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(s.NamaSiswa || 'Siswa');
  switchParentTab(PARENT_TAB);
}

function switchParentTab(tab) {
  PARENT_TAB = tab;
  document.getElementById('tabOrtuNilai').classList.toggle('active', tab === 'nilai');
  document.getElementById('tabOrtuHafalan').classList.toggle('active', tab === 'hafalan');

  if (tab === 'nilai') {
    document.getElementById('parentTableHead').innerHTML = '<tr><th>Mapel</th><th>Jenis Evaluasi</th><th>Semester</th><th>Nilai</th></tr>';
    document.getElementById('parentTableBody').innerHTML = PARENT_DATA.nilai.map(function (n) {
      return '<tr><td>' + n.Mapel + '</td><td>' + n.JenisEvaluasi + '</td><td>' + n.Semester + '</td><td class="fw-bold">' + n.Nilai + '</td></tr>';
    }).join('') || '<tr><td colspan="4" class="text-center py-3 text-muted">Belum ada data nilai.</td></tr>';
  } else {
    document.getElementById('parentTableHead').innerHTML = '<tr><th>Hari/Tanggal</th><th>Nama Surah</th><th>Nilai</th><th>Catatan Evaluasi</th></tr>';
    document.getElementById('parentTableBody').innerHTML = PARENT_DATA.evaluasiHafalan.map(function (h) {
      return '<tr><td>' + h['Hari/Tanggal'] + '</td><td>' + h['Nama Surah'] + '</td><td class="fw-bold">' + h.Nilai + '</td><td>' + h['Catatan Evaluasi'] + '</td></tr>';
    }).join('') || '<tr><td colspan="4" class="text-center py-3 text-muted">Belum ada data setor hafalan.</td></tr>';
  }
}

function handleStudentPhotoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async function (ev) {
    await runGas('uploadStudentPhoto', CURRENT_USER.nisn, ev.target.result);
    await loadParentPortal();
  };
  reader.readAsDataURL(file);
}

/* CETAK PDF REKAP NILAI & SETOR HAFALAN */
function openPdfReportModal() {
  document.getElementById('viewDashboard').classList.add('d-none');
  document.getElementById('viewModuleTable').classList.add('d-none');
  document.getElementById('viewPrintReport').classList.remove('d-none');

  const kelasSet = Array.from(new Set((DB.dataSiswa || []).map(function (s) { return s.Kelas; })));
  document.getElementById('printFilterKelas').innerHTML = '<option value="ALL">Semua Kelas</option>' +
    kelasSet.map(function (k) { return '<option value="' + k + '">' + k + '</option>'; }).join('');
  renderPrintPreview();
}

function closePdfReport() {
  navigateModule('dashboard');
}

function renderPrintPreview() {
  const jenis = document.getElementById('printJenisLaporan').value;
  const kelas = document.getElementById('printFilterKelas').value;
  const filterFn = function (r) { return kelas === 'ALL' || r.Kelas === kelas; };

  const nilaiRows = (DB.nilai || []).filter(filterFn);
  const hafalanRows = (DB.evaluasiHafalan || []).filter(filterFn);

  let html = '<div class="text-center border-bottom pb-3 mb-4"><h4 class="fw-bold mb-1">LAPORAN REKAPITULASI EVALUASI PAIBP</h4>' +
    '<div class="small text-muted">SINERGI PAIBP · Kelas: ' + (kelas === 'ALL' ? 'Semua Kelas' : kelas) + '</div></div>';

  if (jenis === 'gabungan' || jenis === 'nilai') {
    html += '<h6 class="fw-bold mb-2">A. Rekapitulasi Nilai Akademik PAIBP</h6><table class="table table-bordered table-sm small mb-4">' +
      '<thead><tr><th>NISN</th><th>Nama Siswa</th><th>Kelas</th><th>Evaluasi</th><th>Semester</th><th>Nilai</th></tr></thead><tbody>' +
      nilaiRows.map(function (n) {
        return '<tr><td>' + n.NISN + '</td><td>' + n.NamaSiswa + '</td><td>' + n.Kelas + '</td><td>' + n.JenisEvaluasi + '</td><td>' + n.Semester + '</td><td class="fw-bold">' + n.Nilai + '</td></tr>';
      }).join('') + '</tbody></table>';
  }

  if (jenis === 'gabungan' || jenis === 'hafalan') {
    html += '<h6 class="fw-bold mb-2">B. Rekapitulasi Evaluasi Setor Hafalan</h6><table class="table table-bordered table-sm small mb-4">' +
      '<thead><tr><th>Tanggal</th><th>Nama Siswa</th><th>Kelas</th><th>Nama Surah</th><th>Nilai</th><th>Catatan</th></tr></thead><tbody>' +
      hafalanRows.map(function (h) {
        return '<tr><td>' + h['Hari/Tanggal'] + '</td><td>' + h['Nama Siswa'] + '</td><td>' + h.Kelas + '</td><td>' + h['Nama Surah'] + '</td><td class="fw-bold">' + h.Nilai + '</td><td>' + h['Catatan Evaluasi'] + '</td></tr>';
      }).join('') + '</tbody></table>';
  }

  html += '<div class="text-end mt-5 small"><div>Guru PAIBP,</div><br><br><div class="fw-bold">' + ((DB.teacherProfile && DB.teacherProfile.Nama) || 'Guru PAIBP') + '</div></div>';
  document.getElementById('printDocumentBody').innerHTML = html;
}

/* MODE TERANG / GELAP */
function toggleTheme() {
  const htmlEl = document.documentElement;
  const isDark = htmlEl.getAttribute('data-bs-theme') === 'dark';
  htmlEl.setAttribute('data-bs-theme', isDark ? 'light' : 'dark');
  document.getElementById('themeIcon').className = isDark ? 'bi bi-moon-stars' : 'bi bi-sun';
}

/* INSTRUMEN SEMANGAT - UPBEAT C MAYOR SEQUENCER (WEB AUDIO API) */
let AUDIO_CTX = null;
let AUDIO_TIMER = null;
let AUDIO_OSCS = [];
let MUSIC_PLAYING = false;

function toggleAmbientMusic() {
  if (MUSIC_PLAYING) {
    stopAmbientMusic();
  } else {
    startAmbientMusic();
  }
}

function startAmbientMusic() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  if (!AUDIO_CTX) AUDIO_CTX = new Ctx();
  if (AUDIO_CTX.state === 'suspended') AUDIO_CTX.resume();

  const beatSec = 0.5;
  const totalBeats = 16;
  const chords = [
    { freqs: [261.63, 329.63, 392.0, 523.25], bass: 130.81, start: 0 }, // C
    { freqs: [196.0, 246.94, 293.66, 392.0], bass: 196.0, start: 4 },  // G
    { freqs: [220.0, 261.63, 329.63, 440.0], bass: 220.0, start: 8 },  // Am
    { freqs: [174.61, 220.0, 261.63, 349.23], bass: 174.61, start: 12 } // F
  ];
  const melody = [
    [329.63, 0, 0.45], [392.0, 0.5, 0.45], [523.25, 1, 0.9], [659.25, 2, 0.45], [587.33, 2.5, 0.45], [523.25, 3, 0.8],
    [493.88, 4, 0.45], [587.33, 4.5, 0.45], [783.99, 5, 0.9], [587.33, 6, 0.5], [493.88, 6.5, 0.5], [392.0, 7, 0.8],
    [440.0, 8, 0.45], [523.25, 8.5, 0.45], [659.25, 9, 0.9], [523.25, 10, 0.5], [440.0, 10.5, 0.5], [659.25, 11, 0.8],
    [698.46, 12, 0.65], [659.25, 12.75, 0.65], [587.33, 13.5, 0.5], [523.25, 14, 0.9], [392.0, 15, 0.8]
  ];

  function scheduleLoop() {
    if (!MUSIC_PLAYING) return;
    const base = AUDIO_CTX.currentTime + 0.04;

    chords.forEach(function (c) {
      for (let b = 0; b < 4; b++) {
        const bt = base + (c.start + b) * beatSec;
        const bassOsc = AUDIO_CTX.createOscillator();
        const bassGain = AUDIO_CTX.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(c.bass, bt);
        bassGain.gain.setValueAtTime(0.0001, bt);
        bassGain.gain.linearRampToValueAtTime(0.025, bt + 0.02);
        bassGain.gain.exponentialRampToValueAtTime(0.0001, bt + beatSec * 0.85);
        bassOsc.connect(bassGain);
        bassGain.connect(AUDIO_CTX.destination);
        bassOsc.start(bt);
        bassOsc.stop(bt + beatSec * 0.9);
        AUDIO_OSCS.push(bassOsc);
      }

      for (let step = 0; step < 8; step++) {
        const at = base + (c.start + step * 0.5) * beatSec;
        const arpOsc = AUDIO_CTX.createOscillator();
        const arpGain = AUDIO_CTX.createGain();
        arpOsc.type = 'sine';
        arpOsc.frequency.setValueAtTime(c.freqs[step % c.freqs.length], at);
        arpGain.gain.setValueAtTime(0.0001, at);
        arpGain.gain.linearRampToValueAtTime(0.015, at + 0.015);
        arpGain.gain.exponentialRampToValueAtTime(0.0001, at + beatSec * 0.45);
        arpOsc.connect(arpGain);
        arpGain.connect(AUDIO_CTX.destination);
        arpOsc.start(at);
        arpOsc.stop(at + beatSec * 0.48);
        AUDIO_OSCS.push(arpOsc);
      }
    });

    melody.forEach(function (m) {
      const t = base + m[1] * beatSec;
      const d = m[2] * beatSec;
      const osc = AUDIO_CTX.createOscillator();
      const gain = AUDIO_CTX.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(m[0], t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.032, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.12);
      osc.connect(gain);
      gain.connect(AUDIO_CTX.destination);
      osc.start(t);
      osc.stop(t + d + 0.15);
      AUDIO_OSCS.push(osc);
    });
  }

  MUSIC_PLAYING = true;
  document.getElementById('musicLabel').textContent = 'Instrumen Semangat (Aktif)';
  scheduleLoop();
  AUDIO_TIMER = setInterval(scheduleLoop, Math.round(totalBeats * beatSec * 1000));
}

function stopAmbientMusic() {
  MUSIC_PLAYING = false;
  if (AUDIO_TIMER) clearInterval(AUDIO_TIMER);
  AUDIO_OSCS.forEach(function (o) { try { o.stop(); } catch (e) {} });
  AUDIO_OSCS = [];
  document.getElementById('musicLabel').textContent = 'Instrumen Semangat';
}
</script>`;

export const GAS_CSS_HTML = `<style>
/* =========================================================================
 * SINERGI PAIBP - CSS.html (Bootstrap 5 Custom Responsive & Dark/Light Mode)
 * ========================================================================= */

:root {
  --sinergi-accent: #059669;
  --sinergi-sidebar-w: 255px;
}

body {
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}

.login-wrapper {
  background: linear-gradient(135deg, rgba(5, 150, 105, 0.08), rgba(15, 23, 42, 0.04));
}

.login-card {
  width: 100%;
  max-width: 440px;
  border-radius: 14px;
}

.brand-emblem {
  width: 54px;
  height: 54px;
  border-radius: 12px;
  background-color: var(--sinergi-accent);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.sidebar {
  width: var(--sinergi-sidebar-w);
  min-height: calc(100vh - 57px);
  flex-shrink: 0;
}

.nav-link-item {
  display: flex;
  align-items: center;
  width: 100%;
  text-align: left;
  padding: 0.55rem 0.85rem;
  margin-bottom: 0.25rem;
  border: none;
  background: transparent;
  color: inherit;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.nav-link-item:hover {
  background-color: rgba(5, 150, 105, 0.08);
  color: var(--sinergi-accent);
}

.nav-link-item.active {
  background-color: var(--sinergi-accent);
  color: #ffffff;
}

.main-viewport {
  min-width: 0;
}

@media print {
  .no-print {
    display: none !important;
  }
  .print-only-area {
    display: block !important;
    padding: 0 !important;
  }
  body {
    background: #ffffff !important;
    color: #000000 !important;
  }
}
</style>`;
