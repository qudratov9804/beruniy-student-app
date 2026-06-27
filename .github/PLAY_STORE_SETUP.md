# Play Store Avtomatik Submit — Sozlash

Bu qo'llanma `GOOGLE_SERVICE_ACCOUNT_KEY` secretini bir marta sozlash uchun.
Sozlagandan keyin har `git tag v*.*.* && git push origin v*.*.*` da Android AAB
avtomatik Play Store'ga yuklanadi.

---

## 1. Google Cloud Console — Service Account yaratish

1. https://console.cloud.google.com/ ga kiring
2. Yuqorida **loyiha tanlash** → **New Project** → ismi: `beruniy-play-store`
3. Chap menyu → **APIs & Services** → **Enabled APIs & Services**
4. **+ ENABLE APIS AND SERVICES** bosing
5. Qidiring: `Google Play Android Developer API` → **Enable**

---

## 2. Service Account yaratish

1. **APIs & Services** → **Credentials** → **+ CREATE CREDENTIALS** → **Service account**
2. To'ldiring:
   - Service account name: `eas-submit`
   - Service account ID: `eas-submit` (avtomatik)
   - Description: `EAS automated Play Store submit`
3. **CREATE AND CONTINUE**
4. Role: **Service Account User** → **CONTINUE** → **DONE**

---

## 3. JSON Key yuklab olish

1. Yaratilgan service account nomini bosing
2. **Keys** tab → **Add Key** → **Create new key**
3. Format: **JSON** → **CREATE**
4. Fayl avtomatik yuklanadi (masalan: `beruniy-play-store-xxxx.json`)
5. Bu faylni xavfsiz joyda saqlang — bir marta yuklanadi!

---

## 4. Google Play Console — ruxsat berish

1. https://play.google.com/console/ ga kiring
2. Chap menyu pastida → **Setup** → **API access**
3. **Link to a Google Cloud project** → yuqorida yaratgan loyihani tanlang → **Link**
4. **Service accounts** bo'limida yangi service account ko'rinadi
5. **Grant access** bosing
6. Ruxsatlar:
   - **Release manager** yoki
   - **Releases** → **Manage production releases** ✓
7. **Invite user** → **Send invite**

---

## 5. GitHub Secret qo'shish

1. https://github.com/qudratov9804/beruniy-student-app/settings/secrets/actions
2. **New repository secret**
3. Name: `GOOGLE_SERVICE_ACCOUNT_KEY`
4. Value: yuklab olingan JSON faylning **barcha matnini** ko'chirib yapishiring:
   ```json
   {
     "type": "service_account",
     "project_id": "...",
     "private_key_id": "...",
     ...
   }
   ```
5. **Add secret**

---

## 6. Tekshirish — yangi release

```bash
# app.json da version ni o'zgartiring (masalan 0.1.0)
# keyin:

git add app.json
git commit -m "chore: bump version to 0.1.0"
git push origin production

git tag -a v0.1.0 -m "Release v0.1.0"
git push origin v0.1.0
```

GitHub Actions `eas-production.yml` avtomatik:
1. Typecheck + lint + test ishlatadi
2. Android AAB quradi (EAS serverlarida)
3. Play Store internal track'ga yuklaydi
4. iOS build qiladi
5. GitHub Release yaratadi

---

## Play Store Track-lar

| Track | Kim ko'radi | Qachon ishlatiladi |
|---|---|---|
| `internal` | Faqat test qurilmalar (max 100) | Har release default |
| `alpha` | Yopiq test guruh | Alfa testchilar |
| `beta` | Ochiq test | Keng auditoriya sinovi |
| `production` | Barcha foydalanuvchilar | Tayyor release |

Manual release uchun workflow_dispatch dan `track` ni tanlash mumkin.

---

## Muammo chiqsa

**"Permission denied"** — Play Console'da service account'ga ruxsat berilmaganlik.
4-qadamni qaytadan bajaring.

**"Invalid key"** — JSON faylni to'liq ko'chirmagan bo'lishingiz mumkin.
Faylni text editor'da ochib, boshidan oxirigacha `{}` ni to'liq tanlab copy qiling.

**"Package not found"** — Play Console'da ilova hali yaratilmagan.
Birinchi APK/AAB'ni qo'lda yuklash kerak (Play Console → Create app).
