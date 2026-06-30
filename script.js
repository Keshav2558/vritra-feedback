/*
════════════════════════════════════════════════════════════════════
  WHERE IS THE DATA SAVED?
  ─────────────────────────────────────────────────────────────────
  All feedback is saved to a Google Sheet in YOUR Google Drive.
  Nobody else can see it. Free forever.

  HOW TO SET IT UP (one-time, ~5 minutes)
════════════════════════════════════════════════════════════════════

  STEP 1 — Create a Google Sheet
  • Go to https://sheets.google.com → create a new sheet.
  • In Row 1, add these column headers:
      Timestamp | Rating | Order | Fit | Review | Mood | Name | Father Name | City | Mobile

  STEP 2 — Open Apps Script
  • In your sheet: Extensions → Apps Script

  STEP 3 — Paste this code (delete everything first):
  ─────────────────────────────────────────────────
  function doPost(e) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data  = JSON.parse(e.postData.contents);
    sheet.appendRow([
      new Date().toLocaleString(),
      data.rating,
      data.order,
      data.fit,
      data.review,
      data.mood,
      data.name,
      data.fatherName,
      data.city,
      data.mobile
    ]);
    return ContentService
      .createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  ─────────────────────────────────────────────────

  STEP 4 — Deploy
  • Click "Deploy" → "New deployment"
  • Set:  Type → Web App | Execute as → Me | Who has access → Anyone
  • Click Deploy → Allow permissions
  • COPY the Web App URL (looks like https://script.google.com/macros/s/XXX/exec)

  STEP 5 — Paste your URL below
  Replace YOUR_GOOGLE_SCRIPT_URL with the URL you just copied.

  HOW TO VIEW RESPONSES
  • Just open your Google Sheet — every submission appears as a new row instantly.
════════════════════════════════════════════════════════════════════
*/

const SHEET_URL = "https://script.google.com/macros/s/AKfycbzj1ChxHYBnqL9uu3HtzW13jelgYvbTNt_AIqswTc8wP5GXz6jJxT2jU-Ot8tnkSo-lHQ/exec"; // ← paste your URL here


/* ── Helpers ── */
function getVal(id) {
  return document.getElementById(id).value.trim();
}

function showErr(id, show) {
  document.getElementById(id).style.display = show ? 'block' : 'none';
}

function getStarRating() {
  const checked = document.querySelector('input[name="rating"]:checked');
  return checked ? checked.value : null;
}

function getMood() {
  const checked = document.querySelector('input[name="mood"]:checked');
  return checked ? checked.value : null;
}

function setFieldError(inputId, errId, hasError) {
  showErr(errId, hasError);
  const el = document.getElementById(inputId);
  if (el) el.classList.toggle('input-error', hasError);
}


/* ── Validation ── */
function validate() {
  let ok = true;

  const rating = getStarRating();
  showErr('err-rating', !rating);
  document.getElementById('star-group').classList.toggle('group-error', !rating);
  if (!rating) ok = false;

  const order = getVal('order');
  setFieldError('order', 'err-order', !order);
  if (!order) ok = false;

  const fit = getVal('fit');
  setFieldError('fit', 'err-fit', !fit);
  if (!fit) ok = false;

  const review = getVal('review');
  setFieldError('review', 'err-review', !review);
  if (!review) ok = false;

  const mood = getMood();
  showErr('err-mood', !mood);
  document.querySelector('.mood-group').classList.toggle('group-error', !mood);
  if (!mood) ok = false;

  const name = getVal('name');
  setFieldError('name', 'err-name', !name);
  if (!name) ok = false;

  const fname = getVal('fname');
  setFieldError('fname', 'err-fname', !fname);
  if (!fname) ok = false;

  const city = getVal('city');
  setFieldError('city', 'err-city', !city);
  if (!city) ok = false;

  const mobile = getVal('mobile');
  const validMobile = /^\d{10}$/.test(mobile);
  setFieldError('mobile', 'err-mobile', !validMobile);
  if (!validMobile) ok = false;

  return ok;
}


/* ── Submit ── */
async function submitFeedback() {
  if (!validate()) return;

  const btn     = document.getElementById('submit-btn');
  const btnText = document.getElementById('btn-text');
  btn.disabled  = true;
  btnText.textContent = 'Sending…';

  const payload = {
    rating:     getStarRating(),
    order:      getVal('order'),
    fit:        getVal('fit'),
    review:     getVal('review'),
    mood:       getMood(),
    name:       getVal('name'),
    fatherName: getVal('fname'),
    city:       getVal('city'),
    mobile:     getVal('mobile')
  };

  try {
    await fetch(SHEET_URL, {
      method:  'POST',
      mode:    'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload)
    });
    showSuccess();
  } catch (err) {
    showSuccess(); // no-cors = can't read response, assume success
  }
}


/* ── Success ── */
function showSuccess() {
  document.getElementById('form-view').style.display    = 'none';
  document.getElementById('success-view').style.display = 'block';
}


/* ── Live error clearing ── */
document.querySelectorAll('input[type="text"], input[type="tel"], select, textarea').forEach(el => {
  el.addEventListener('input', () => {
    el.classList.remove('input-error');
    const errEl = document.getElementById('err-' + el.id);
    if (errEl) errEl.style.display = 'none';
  });
});

document.querySelectorAll('input[name="rating"]').forEach(el => {
  el.addEventListener('change', () => {
    document.getElementById('err-rating').style.display = 'none';
    document.getElementById('star-group').classList.remove('group-error');
  });
});

document.querySelectorAll('input[name="mood"]').forEach(el => {
  el.addEventListener('change', () => {
    document.getElementById('err-mood').style.display = 'none';
    document.querySelector('.mood-group').classList.remove('group-error');
  });
});
