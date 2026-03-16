# NEON HORDE: SURVIVOR — GLOBAL GELİŞİM PLANI

---

## EXECUTIVE SUMMARY

**Oyun:** Neon Horde: Survivor — Cyberpunk temalı, Vampire Survivors benzeri auto-shooter hayatta kalma oyunu.  
**Platform:** Web (HTML5 Canvas 2D), mobil öncelikli, dokunmatik joystick + klavye desteği.  
**Teknoloji:** Vanilla JavaScript, Canvas 2D API, Web Audio API (prosedürel ses), LocalStorage.  
**Durum:** Oynanabilir prototip aşamasında. Çekirdek mekanikler mevcut ama denge, derinlik ve retention ciddi eksik.

**🏗️ ARCHITECT NOTU:** Teknik altyapı şaşırtıcı derecede iyi yapılandırılmış. Object pooling, modüler dosya yapısı, adaptif post-processing kalitesi var. Ancak tek dosyada 1400+ satır (enemy.js) ve global singleton pattern her yerde — bu ölçekleme bariyeri oluşturur.

**🎮 TESTER NOTU:** İlk 30 saniye etkileyici (neon görsel kimlik güçlü), ama 3. dakikadan sonra "aynı şeyi yapıyorum" hissi başlıyor. LV11+ geçici silah mekanizması kafa karıştırıcı. Oyuncu neden geri dönmeli sorusunun cevabı zayıf.

---

## 📍 GELİŞİM DURUM TAKİBİ (CANLI)

**Son Güncelleme:** 03.03.2026  
**Aktif Faz:** **Faz 6 — Oyun Hissi (Game Feel)**  
**Genel Durum:** Faz 1-5 + Release QA tamamlandı. Oyun hissi ve içerik derinliği geliştirme sürecine geçildi.

---

### 📊 FAZ DURUMU ÖZET

| Faz | Ad | Durum |
|-----|----|-------|
| 1 | Stabilizasyon | ✅ Tamamlandı |
| 2 | Mekanik Temizliği | ✅ Tamamlandı |
| 3 | Derinlik Eklenmesi | ✅ Tamamlandı |
| 4 | Retention | ✅ Tamamlandı |
| 5 | Polish | ✅ Tamamlandı |
| R | Release QA | ✅ Tamamlandı (82/82 test PASS) |
| **6** | **Oyun Hissi (Game Feel)** | **⏳ Bekliyor** |
| 7 | Build Derinliği | 🔲 Planlandı |
| 8 | İçerik Genişlemesi | 🔲 Planlandı |
| 9 | Uzun Ömür & Meta | 🔲 Planlandı |
| 10 | Final Polish & Yayın | 🔲 Planlandı |

---

### ✅ Tamamlanan İşler (Faz 1-5 + Release)

<details>
<summary>📋 Tamamlanan 30 iş (tıkla genişlet)</summary>

| # | İş | Faz |
|---|----|----|
| 1 | ObjectPool O(1) aktiften silme | F1 |
| 2 | Kill/hit sıcak path optimizasyonu | F1 |
| 3 | Bloom/CRT/Chromatic oyun içi toggle + kalıcı ayar | F1 |
| 4 | Adaptif shadowBlur optimizasyonu | F1 |
| 5 | HUD/DOM innerHTML optimizasyonu | F1 |
| 6 | Mobil kalite preset (Low/High) | F1 |
| 7 | FPS debug metriği | F1 |
| 8 | Kritik particle yoğunluğu adaptasyonu | F1 |
| 9 | Geçici powerup kaldırılması → kalıcı progression | F2 |
| 10 | Rarity 5→3 tier sadeleştirmesi | F2 |
| 11 | Simulated ad akışı temizliği | F2 |
| 12 | Dash/Dodge mekanizması | F3 |
| 13 | Boss faz geçiş sistemi (%50/%25 HP) | F3 |
| 14 | Silah sinerji: Ice + Lightning | F3 |
| 15 | Silah sinerji: Laser + Rocket → Napalm | F3 |
| 16 | Achievement genişletme (4→20) | F4 |
| 17 | Haftalık görev paketi | F4 |
| 18 | Mastery temeli (karakter bazlı) | F4 |
| 19 | Run modifier sistemi | F4 |
| 20 | İstatistik görünümü (menü + sonuç) | F4 |
| 21 | Koleksiyon/ansiklopedi temeli | F4 |
| 22 | Gold ekonomi dengesi | F4 |
| 23 | Juice efektleri (hitstop + flash) | F5 |
| 24 | Boss kill ses stinger | F5 |
| 25 | Tutorial overlay (30s onboarding) | F5 |
| 26 | Erişilebilirlik (kontrast + HUD boyut) | F5 |
| 27 | PWA paket (manifest + SW) | R |
| 28 | Store metadata şablonu | R |
| 29 | Otomatik smoke test (82/82) | R |
| 30 | Manuel QA (6/6 geçti) | R |

</details>

---

### 🔥 FAZ 6 — OYUN HİSSİ (GAME FEEL)

> **Felsefe:** Oyuncunun güçlendiğini *görmesi* ve *hissetmesi* lazım.
> Şu an silahlar vuruyor ama vuruş tatmin edici değil. Her etkileşimin geri bildirimi güçlendirilecek.

| # | İş | Durum | Dosya(lar) | Detay |
|---|-----|-------|-----------|-------|
| 6.1 | **Düşman Hit Flash** | ✅ Tamamlandı | `enemy.js` | Düşman vurulduğunda `globalCompositeOperation` ile beyaz flash silüet |
| 6.2 | **Silah Ateş Efekti** | ✅ Tamamlandı | `particles.js`, `weapons.js` | Silah ateşlendiğinde namlu ucundan 2-3 kısa parçacık |
| 6.3 | **Faz 6 Denge & QA** | ✅ Tamamlandı | tümü | Browser test geçti, sıfır kritik hata |

**Başarı Kriteri:** ✅ Vuruş anı tatmin edici · ✅ Ateş efekti her silahta görünür · ✅ Mobilde 100 düşmanda 30+ FPS

---

### 🧩 FAZ 7 — BUILD DERİNLİĞİ

> **Felsefe:** Her run farklı hissettirmeli. Oyuncu kendi build'ini oluşturabilmeli.

| # | İş | Durum | Dosya(lar) | Detay |
|---|-----|-------|-----------|-------|
| 7.1 | **Pasif Item Havuzu** | ⬜ Bekliyor | `weapons.js`, `ui.js` | Level-up'ta silah yanında pasif seçenekler: Hız Aurası, Hasar Yansıtma, Ekstra Projektil, Mıknatıs Patlaması, Vampir+, Zırh Onarımı, Kritik Şans+, Ateş İzi |
| 7.2 | **Pasif Item Sinerjileri** | ⬜ Bekliyor | `weapons.js`, `player.js` | Belirli pasif kombinasyonları bonus tetiklesin. Hız+Ateş İzi → daha geniş iz. Vampir+Kritik → kritik 2x heal |
| 7.3 | **Level-Up Kart Redesign** | ⬜ Bekliyor | `ui.js`, `css/style.css` | Kartlarda net bilgi: DPS değişimi, cooldown, menzil. Rarity renk kenarı. Sinerji ipucu ikonu |
| 7.4 | **Elite Düşmanlar** | ⬜ Bekliyor | `enemy.js`, `particles.js` | Normal mob'ların nadir güçlü varyantları. Parlayan aura, +HP, özel yetenek (hızlı, bölünen, kalkan). Garanti item drop |
| 7.5 | **Mini-Boss Rotasyonu** | ⬜ Bekliyor | `enemy.js` | Her biome için 3-4 farklı mini-boss. Rastgele seçim → her run farklı boss sırası |
| 7.6 | **Faz 7 Denge & QA** | ⬜ Bekliyor | tümü | Pasif item denge kontrolü, elite spawn oranı, build çeşitliliği testi |

**Başarı Kriteri:** ✅ Level-up'ta en az 3 kategori (silah/upgrade/pasif) · ✅ Her 60s en az 1 elite · ✅ 10 run'da en az 5 farklı build mümkün

---

### 🌍 FAZ 8 — İÇERİK GENİŞLEMESİ

> **Felsefe:** Mevcut içerik derinleşmeli, dünya zengin ve sürprizli olmalı.

| # | İş | Durum | Dosya(lar) | Detay |
|---|-----|-------|-----------|-------|
| 8.1 | **Boss Pattern Fazları v2** | ⬜ Bekliyor | `enemy.js` | Boss HP %70/%40/%15'te saldırı seti tamamen değişsin. Yeni pattern: spiral mermi, çağırma dalgası, alan reddi |
| 8.2 | **Harita Eventleri** | ⬜ Bekliyor | `main.js`, `maps.js` | 60-90s aralıkla rastgele event: Tehlike Dalgası, Loot Yağmuru, Sis, Elite Akını |
| 8.3 | **Harita Mekanik Farkları** | ⬜ Bekliyor | `maps.js`, `player.js` | Ice Cave: kayma. Lava: sıcak zemin + güvenli adalar. Dark Forest: sis + stealth düşmanlar. Space: düşük yerçekimi |
| 8.4 | **Yeni Silah Sinerjileri** | ⬜ Bekliyor | `weapons.js` | 3. sinerji: Fire + Ice → Steam Explosion. 4. sinerji: Chain + Orbit → Tesla Coil |
| 8.5 | **Evolution Sistemi Tamamlama** | ⬜ Bekliyor | `weapons.js`, `ui.js` | Tanımlı evolved silahların stat + mekanik tanımları. Evrim UI göstergesi |
| 8.6 | **Faz 8 Denge & QA** | ⬜ Bekliyor | tümü | Boss zorluk eğrisi, event sıklığı, harita dengesi |

**Başarı Kriteri:** ✅ 5+ dakikada hâlâ sürpriz var · ✅ Her harita farklı strateji gerektiriyor · ✅ Boss savaşları her seferinde farklı hissediyor

---

### ♾️ FAZ 9 — UZUN ÖMÜR & META

> **Felsefe:** Oyuncuyu haftalarca/aylarca geri getiren sistemler. İçerik tükendiğinde bile oynama sebebi.

| # | İş | Durum | Dosya(lar) | Detay |
|---|-----|-------|-----------|-------|
| 9.1 | **Challenge Modları** | ⬜ Bekliyor | `main.js`, `ui.js`, `economy.js` | Tek Can, Zaman Saldırısı (5dk sınır), Sadece Melee, Rastgele Build, Speed Run |
| 9.2 | **Prestige Döngüsü** | ⬜ Bekliyor | `economy.js`, `ui.js` | Tüm shop'u sıfırla → kalıcı küçük global bonus (%2 hasar, %1 hız). Prestige seviyesi UI'da |
| 9.3 | **Günlük Seed Run** | ⬜ Bekliyor | `main.js`, `enemy.js` | Herkese aynı spawn sırası + aynı level-up teklifleri. "Bugünün en iyi süresi" |
| 9.4 | **İlerleme Netliği** | ⬜ Bekliyor | `ui.js`, `economy.js` | Menüde "bir sonraki unlock'a kalan" tek satır göstergesi. "3 run daha → yeni karakter!" |
| 9.5 | **Ansiklopedi Genişletme** | ⬜ Bekliyor | `economy.js`, `ui.js` | Düşman detay sayfası: HP, hasar, davranış. Silah ansiklopedisi: DPS, menzil, sinerji bilgisi |
| 9.6 | **Skor Tablosu (Lokal)** | ⬜ Bekliyor | `economy.js`, `ui.js` | Kişisel en iyi 10 run: süre, kill, karakter, harita. Challenge mod skor tablosu ayrı |
| 9.7 | **Faz 9 Denge & QA** | ⬜ Bekliyor | tümü | Prestige ödül dengesi, challenge zorluk kalibrasyonu |

**Başarı Kriteri:** ✅ Prestige 50+ saat ek içerik · ✅ 5+ farklı challenge modu · ✅ Günlük seed her gün benzersiz

---

### 🚀 FAZ 10 — FİNAL POLISH & YAYIN

> **Felsefe:** Son rötuşlar, performans optimizasyonu, mağaza hazırlığı.

| # | İş | Durum | Dosya(lar) | Detay |
|---|-----|-------|-----------|-------|
| 10.1 | **UI Bilgi Netliği** | ⬜ Bekliyor | `ui.js`, `css/style.css` | Kartlarda DPS/cooldown/menzil. Tooltip sistemi. Sinerji ipuçları |
| 10.2 | **Splash Screen + Loading** | ⬜ Bekliyor | `index.html`, `css/style.css` | Yükleme ekranı + progress bar + logo animasyonu |
| 10.3 | **Screenshot/Share** | ⬜ Bekliyor | `ui.js`, `main.js` | Run sonunda screenshot + istatistik paylaşım kartı |
| 10.4 | **Performans Finali** | ⬜ Bekliyor | tümü | Lighthouse audit, mobil FPS profiling, bellek sızıntı taraması |
| 10.5 | **Store Görselleri** | ⬜ Bekliyor | `assets/` | 512x512 + 1024x1024 ikon, 6+ gameplay screenshot |
| 10.6 | **Gizlilik & Yasal** | ⬜ Bekliyor | — | KVKK/GDPR uyumlu gizlilik politikası, içerik derecelendirme |
| 10.7 | **Mağaza Açıklamaları** | ⬜ Bekliyor | `STORE_METADATA` | TR + EN kısa ve uzun açıklama metinleri |
| 10.8 | **Final QA + Yayın** | ⬜ Bekliyor | tümü | Tüm platformlarda (mobil+masaüstü) son test → Yayın |

**Başarı Kriteri:** ✅ PWA Lighthouse 80+ · ✅ Mobilde sabit 30+ FPS · ✅ Mağaza metadatası eksiksiz

---

### 📈 TOPLAM İLERLEME

```
Faz 1-5 + Release : ████████████████████████████████ 30/30 (100%)
Faz 6 Game Feel   : ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0/3  (  0%)
Faz 7 Build       : ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0/6  (  0%)
Faz 8 İçerik      : ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0/6  (  0%)
Faz 9 Meta        : ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0/7  (  0%)
Faz 10 Final      : ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  0/8  (  0%)
─────────────────────────────────────────────────────────────
TOPLAM             : ████████████████░░░░░░░░░░░░░░░░ 30/60 ( 50%)
```

### 🎯 Tahmini Süre & Bağımlılıklar

| Faz | Tahmini Süre | Bağımlılık |
|-----|-------------|------------|
| Faz 6 | ~2-3 gün | Yok (bağımsız başlanabilir) |
| Faz 7 | ~3-4 gün | Faz 6 gerekli (efektler lazım) |
| Faz 8 | ~3-4 gün | Faz 7 gerekli (elite/pasif sistemi lazım) |
| Faz 9 | ~2-3 gün | Faz 8 gerekli (içerik hazır olmalı) |
| Faz 10 | ~2-3 gün | Faz 9 gerekli (tüm özellikler tamam) |

### 🏷️ Öncelik Mantığı

```
"Oyuncu güçlendiğini hissetmeli"     → Faz 6 (Game Feel)
    ↓
"Her run farklı olmalı"              → Faz 7 (Build Derinliği)
    ↓
"Dünya zengin ve sürprizli olmalı"   → Faz 8 (İçerik Genişlemesi)
    ↓
"Haftalarca geri gelmeli"            → Faz 9 (Uzun Ömür)
    ↓
"Yayına hazır"                       → Faz 10 (Final)
```


## 1️⃣ MEVCUT DURUM ANALİZİ

### Oyun Türü
Bullet-heaven / auto-shooter survivor (Vampire Survivors klonu). Top-down, sonsuz arena, dalga tabanlı düşman spawn sistemi.

### Çekirdek Gameplay Loop
```
Hareket Et → Düşman Gelir → Silahlar Otomatik Ateş Eder → Düşman Ölür → 
XP/Gold Topla → Seviye Atla → Silah/Pasif Seç → Zorluk Artar → Boss Gelir → 
Öl veya Hayatta Kal → Sonuçlar → Gold ile Mağaza → Tekrar Başla
```

### Güçlü Yanlar

| Alan | Detay |
|------|-------|
| **Görsel Kimlik** | Neon/Cyberpunk teması tutarlı. Bloom, CRT, chromatic aberration efektleri atmosfer yaratıyor |
| **Object Pooling** | `ObjectPool` sınıfı jenerik, yeniden kullanılabilir ve performans-bilinçli |
| **Adaptif Kalite** | Renderer, düşman sayısına göre efektleri otomatik kapatıyor (80+ düşmanda bloom kapalı) |
| **Biome Çeşitliliği** | 5 farklı harita, kendine özgü düşman tipleri, tehlikeler ve görsel stiller |
| **Karakter Sistemi** | 6 karakter, benzersiz pasifler, farklı oyun stilleri |
| **Boss Sistemi** | Her biome için 2 boss (mini + mega), pattern tabanlı AI (dash, nova, summon, regen, gravity) |
| **Progression** | Shop upgrade, achievement, daily quest, harita açma, karakter açma, silah açma mekanizmaları |
| **Ses** | Prosedürel Web Audio — dosya bağımlılığı sıfır, hafif |
| **dt Cap** | Game loop'ta `Math.min(dt, 0.05)` — tab geçişinde fizik patlaması önleniyor |

### Zayıf Yanlar

| Alan | Detay |
|------|-------|
| **Geçici Silah Mekanizması** | LV11+ silahlar 15 saniye sürüyor — oyuncu yatırım hissini kaybediyor |
| **Denge** | Vampirism 0.1-0.2 HP/kill, 150 düşmanlı sahnede çok zayıf; Armor %50'ye ulaşınca oyuncu ölmez |
| **Combo Sistemi** | Combo multiplier XP'yi artırıyor ama oyuncuya hissettirmiyor (sadece küçük text) |
| **Düşman AI** | 3 hareket pattern: düz yürü, zigzag, drift. Taktiksel derinlik yok |
| **Evrim Sistemi** | Evolution recipe'ler tanımlı ama evolved silahların stat tanımları eksik (definitions'ta yok) |
| **Harita Mekaniği** | Hazard'lar (electric fence, ice zone, lava pool) pasif tehlike — oyuncu bunları önemsemiyor |
| **Rarity Sistemi** | Silah rarity'si sadece damage multiplier — görsel/mekanik fark yok |

### Teknik Risk Alanları

| Risk | Seviye | Açıklama |
|------|--------|----------|
| **Global Singleton** | 🟡 Orta | Tüm sistemler global nesne (`Game`, `Player`, `Enemies`...). Test edilemez, paralel instance imkansız |
| **enemy.js 1442 satır** | 🔴 Yüksek | Sprite loading, bullet system, boss AI, spawn logic hepsi tek dosyada |
| **weapons.js 1087 satır** | 🟡 Orta | 6+ silah tipi, upgrade logic, projectile collision hepsi tek dosyada |
| **Sprite Alpha Validation** | 🟡 Orta | Her sprite yüklemede piksel piksel alpha tarama yapılıyor — gereksiz CPU |
| **Array.splice döngü içinde** | 🟡 Orta | `Enemies.pool.active.splice(i, 1)` her öldürmede O(n) — 150 düşmanda yavaş |
| **innerHTML DOM yeniden yazma** | 🟡 Orta | `_renderShopItems`, `updatePowerupTimers` her frame innerHTML ile DOM yeniden oluşturuyor |

### Performans Riskleri

| Risk | Etki | Detay |
|------|------|-------|
| **150 düşman + bloom + CRT** | 🔴 Mobil | Bloom pass ekstra canvas draw, CRT her satır için fillRect |
| **shadowBlur her draw call'da** | 🟡 Orta | Canvas shadowBlur GPU-intensive, her düşman/mermi için açılıp kapatılıyor |
| **Parallax bg particles** | 🟠 Düşük-Orta | 30 parçacık (space station) + ana parçacık sistemi + XP orb'ları = çok fazla draw call |
| **willReadFrequently** | 🟡 Orta | Sprite validation'da `willReadFrequently: true` — software rendering'e zorlayabilir |
| **200 projectile pool + 200 particle pool** | 🟡 Orta | Eşzamanlı aktif nesne sayısı kontrolsüz artabilir |

### UI/UX Problemleri

| Problem | Detay |
|---------|-------|
| **Joystick sadece sol %60** | Sağ elini kullanan oyuncu ekranın soluna uzanmak zorunda |
| **Silah ikonları emoji** | Mobilde emoji render tutarsız, oyun kimliğiyle uyumsuz |
| **Level-up kartları çok benzer** | Icon + text wall — hızlı karar vermek zor |
| **Boss HP bar'ı her zaman gösteriliyor** | Boss yokken bile DOM'da — CSS class toggle ile gizleniyor ama layout shift potansiyeli |
| **Günlük görev görünürlüğü** | Sadece sonuç ekranında ve menüde — oyun içinde izlenemiyor |
| **Harita kilidi açma ilerlemesi** | Kilidi açma koşulları harita seçim ekranında var ama oyun içinde yönlendirme yok |

---

## 2️⃣ OYUNCU DENEYİMİ ANALİZİ (🎮 TESTER ROLÜ)

### Oyuncu ilk 60 saniyede ne hisseder?

**Olumlu:** Neon görsel efektler etkileyici. Karakter seçimi "farklı bir şey yapabilirim" hissi veriyor. İlk düşmanlar kolay öldürülüyor → güçlü hissettiriyor. XP orb'larının mıknatısla çekilmesi tatmin edici.

**Olumsuz:** İlk 60 saniyede **sadece 1 silahın var** ve otomatik ateş ediyor. Oyuncu aslında sadece joystick'le kaçıyor. "Ben ne yapıyorum?" sorusu 30. saniyede ortaya çıkıyor. **İlk level-up'a kadar oyuncu pasif.** Joystick görsel feedback'i zayıf — gerçekten çalışıp çalışmadığını anlamak zor.

### Oyun ne zaman sıkıcı olur?

- **2-4 dakika arası:** Silah yükseltmeleri incremental (+5 hasar, +1 pierce). Oyuncu farkı hissetmiyor.
- **LV11 sonrası:** Geçici silah mekanizması = "Güçlendim ama 15 saniye sonra kaybolacak." Bu, dopamin yerine hayal kırıklığı üretiyor.
- **Boss'lar arası boşluk:** Mini boss 2. dakika, mega boss 5. dakika. 2-5 arası monotonik dalga savaşı.
- **Her haritada aynı ritim:** Spawn interval ve difficulty scaling harita fark etmez aynı formülü kullanıyor. Sadece düşman isimleri değişiyor.

### Motivasyon kaynağı ne?

1. **Kısa vadeli:** Seviye atlama + yeni silah seçme anı (dopamin spike)
2. **Orta vadeli:** Boss savaşları (nadir ama heyecanlı)
3. **Uzun vadeli:** Shop upgrade'leri ile kalıcı güçlenme, karakter/silah/harita açma

**🎮 TESTER:** Kısa vadeli motivasyon güçlü, orta vadeli zayıf (boss'lar arası boşluk), uzun vadeli çok yavaş (gold kazanma hızı düşük, costMultiplier 1.7-2.5 arası agresif).

### Uzun vadeli retention mekanizması var mı?

**Var ama yetersiz:**
- Daily quest → 1 görev/gün, 3 görev havuzu → 3 gün sonra tekrar
- Achievement → 4 adet, statik, tükenince yok
- Karakter açma → 6 karakter, koşullar makul ama açıklama yetersiz
- Silah açma → 15+ silah ama çoğu "XX düşman öldür" — farklılaşma yok
- Harita açma → İyi progression ama haritalar arasında mekanik fark az

**Eksik olanlar:** Prestige sistemi, run modifiers, leaderboard, sezonsal içerik, mastery sistemi.

### Oyuncu neden geri gelsin?

Şu anda: "Mağazadaki bir sonraki upgrade'i açmak için." Bu yeterli değil çünkü:
- Gold kazanma hızı → upgrade maliyeti dengesi kötü
- Upgrade'ler sayısal (+20 HP, +15 speed) — heyecan vermiyor
- "Hepsini açtım" noktasına ulaşıldığında geri dönüş sebebi kalmıyor

### Hangi mekanikler gereksiz?

1. **Simulated Ad System:** Placeholder ad provider 3 saniye bekletiyor. Ya gerçek reklam entegrasyonu yapılmalı ya da kaldırılmalı — şu hali oyuncuyu kandırıyor.
2. **Rarity sistemi (common→mythic):** Sadece damage multiplier. Oyuncu MYTHIC silah aldığında fark etmiyor bile. "Legendary aldım ama +%48 hasar ne demek?" — hissedilmiyor.
3. **Geçici powerup timer (15s):** LV11+ güçlenmelerin geçici olması progression'a ters. Oyuncu seviye atlayarak **zayıflıyor** (silah kaybediyor).
4. **Bazı hazard'lar:** iceZone %85 speed penalty → fark edilmiyor. electricFence 8 hasar/1.2s → HP regen ile anlamsız.

---

## 3️⃣ MEKANİK DENETİMİ

| Mekanik | Gerekli mi? | Basitleştirilmeli mi? | Çıkarılmalı mı? | Geliştirilmeli mi? | Sebep |
|---------|-------------|----------------------|------------------|--------------------|----|
| **Auto-attack silah sistemi** | ✅ Evet | ❌ | ❌ | ✅ Evet | Çekirdek mekanik. Ama silah arketipleri arasında sinerji yok |
| **Seviye atlama/kart seçimi** | ✅ Evet | ❌ | ❌ | ✅ Evet | Seçim anı iyi ama LV11+ geçici sistem kötü. Kalıcı olmalı |
| **XP Orb + Mıknatıs** | ✅ Evet | ❌ | ❌ | ❌ | İyi çalışıyor. Tatmin edici |
| **Gold Orb + Ekonomi** | ✅ Evet | ❌ | ❌ | ✅ Evet | Gold kazanma/harcama dengesi bozuk. Çok yavaş |
| **Boss Sistemi** | ✅ Evet | ❌ | ❌ | ✅ Evet | Pattern'ler monoton (hep aynı 5 pattern). Faz bazlı HP mekanizması yok |
| **Karakter Sistemi** | ✅ Evet | ❌ | ❌ | ✅ Evet | İyi temel. Ama pasifler oyunu yeterince değiştirmiyor (Cipher: sadece +%15 hasar hareket ederken) |
| **Harita Sistemi** | ✅ Evet | ❌ | ❌ | ✅ Evet | 5 biome güzel ama mekanik farklılık az. Sadece renk + düşman ismi değişiyor |
| **Hazard Sistemi** | ✅ Evet | 🟡 Belki | ❌ | ✅ Evet | Tehlikeler çok zayıf. Oyuncuyu rota değiştirmeye zorlamalı |
| **Combo Sistemi** | ✅ Evet | ❌ | ❌ | ✅ Evet | Combo sadece XP multiplier. Görsel/audio feedback zayıf. Hasar bonusu da olmalı |
| **Shop/Upgrade Sistemi** | ✅ Evet | ❌ | ❌ | ✅ Evet | 6 upgrade var, hepsi stat boost. Mekanik değiştiren upgrade yok |
| **Achievement Sistemi** | ✅ Evet | ❌ | ❌ | ✅ Evet | 4 achievement çok az. En az 15-20 olmalı |
| **Daily Quest** | ✅ Evet | ❌ | ❌ | ✅ Evet | 3 quest havuzu çok dar. Haftalık görevler de eklenmeli |
| **Rarity Sistemi** | 🟡 Belki | ✅ Evet | 🟡 Belki | ✅ Evet | Ya anlamlı hale getir (mekanik fark) ya kaldır. Şu hali boş |
| **Geçici Powerup (15s)** | ❌ Hayır | - | ✅ Evet | - | Anti-pattern. Oyuncu seviye atlayarak güçlenmeli, zayıflamamalı |
| **Evolution Sistemi** | ✅ Evet | ❌ | ❌ | ✅ Evet | Recipe'ler var ama evolved silah tanımları yok. Yarım kalmış |
| **Simulated Ad** | ❌ Hayır | - | ✅ Evet | - | Gerçek reklam SDK'sı entegre edilene kadar kaldırılmalı |
| **Post-Processing (Bloom/CRT)** | ✅ Evet | 🟡 Belki | ❌ | ❌ | Atmosfer için önemli. Ama mobilde toggle olmalı |
| **Düşman Ateşi (LV5+)** | ✅ Evet | ❌ | ❌ | ✅ Evet | İyi fikir ama mermi hızı/hasarı dengesiz. Dodge mekanizması (dash) yok |
| **Revive (Reklam ile)** | 🟡 Belki | ❌ | 🟡 Belki | ❌ | Simulated ad ile anlamsız. Gerçek reklam gelince anlamlı olur |
| **Parallax Background** | ✅ Evet | ❌ | ❌ | ❌ | Görsel derinlik katıyor |
| **Screen Shake** | ✅ Evet | ❌ | ❌ | ❌ | Vuruş hissi için kritik. İyi calibrated |
| **Fog of War (Dark Forest)** | ✅ Evet | ❌ | ❌ | ✅ Evet | İlginç mekanik ama sadece 1 haritada. Daha agresif olabilir |
| **Enemy Bullet FX (Sprite Sheet)** | 🟡 Belki | ✅ Evet | ❌ | ❌ | Çok fazla validation kodu. Sadeleştirilmeli |

---

## 4️⃣ SİSTEM MİMARİ PLANI

### Core Systems

| Sistem | Mevcut Durum | Hedef |
|--------|-------------|-------|
| **Game State Machine** | 7 state (MENU, PLAYING, PAUSED...) — doğrusal | State pattern'e dönüştürülmeli. Her state kendi update/render'ına sahip olmalı |
| **Game Loop** | `requestAnimationFrame` + dt cap | Yeterli. Değişiklik gerekmez |
| **Object Pool** | Jenerik, iyi çalışıyor | `active.splice()` yerine swap-and-pop pattern uygulanmalı |
| **Camera** | Smooth follow + shake | Yeterli |
| **Input** | Touch + mouse + keyboard | Dash/dodge input eklenebilmeli |
| **Audio** | Prosedürel Web Audio | Müzik dosyaları tanımlı ama yükleme mekanizması eksik |
| **Renderer** | Bloom + CRT + CA + Vignette | Mobil settings toggle gerekli |

### Combat Systems

| Sistem | Mimari Hedef |
|--------|-------------|
| **Damage Pipeline** | `baseDamage × rarityMult × characterMult × critMult × comboMult × passiveMult` — tek pipeline fonksiyonunda birleşmeli |
| **Silah Arketipi** | Her arketip (projectile, orbit, chain, aoe) kendi modülünde olmalı |
| **Hit Detection** | Şu an circle-circle. Sprite-based collision'a geçiş hazırlığı yapılmalı |
| **Boss Pattern Engine** | Pattern'ler data-driven (iyi). Faz bazlı HP system eklenmeli (HP %50'de pattern değişimi) |
| **Enemy Bullet** | Bullet pool var. Bullet pattern'ler (spread, spiral) eklenebilir yapı |

### Progression Systems

| Sistem | Mimari Hedef |
|--------|-------------|
| **In-Run XP/Level** | XP eğrisi: `10 + level*5 + level^1.5` — iyi ama LV20+ çok yavaş |
| **Meta Progression** | Shop → stat boost. Yeni katman lazım: Mastery, Prestige |
| **Unlock System** | Karakter/silah/harita açma. İyi yapıda ama koşullar dengesiz |
| **Achievement** | 4 achievement. En az 15 olmalı, milestone tabanlı |
| **Daily/Weekly** | 3 quest havuzu. En az 10 olmalı + haftalık görevler |

### Economy

| Parametre | Mevcut | Sorun | Hedef |
|-----------|--------|-------|-------|
| **Gold drop rate** | %33, 1-9 arası | Yetersiz uzun vadede | Dinamik: erken run kolay, geç run değerli |
| **Shop base costs** | 30-100 | İlk upgrade'ler makul | OK |
| **Cost multiplier** | 1.5-2.5 | Çok agresif. 5. seviye çok pahalı | 1.3-1.8 arasına çekilmeli |
| **Gold/run ortalama** | ~50-150 (tahmin) | 3. upgrade için 3-5 run gerekli | İlk 3 upgrade hızlı, sonrası yavaş (frontloaded) |
| **Double gold (ad)** | Simulated | Anlamsız şu an | Gerçek reklam veya kaldır |

### Scaling & Balancing Parametreleri

| Parametre | Mevcut Formül | Risk |
|-----------|--------------|------|
| **Spawn interval** | `max(0.5, 1.5 - minutes*0.1)` | 10 dakikada minimum'a ulaşıyor, sonra flat |
| **Spawn count** | `min(8, floor(2 + minutes*0.8))` | 7.5 dakikada max. Sonra challenge artmıyor |
| **Enemy HP scaling** | Statik (type-based) | Uzun run'larda düşmanlar çok kolay oluyor |
| **Boss HP scaling** | `1 + minutes*0.3` | 10 dakikada 4x HP — iyi ama damage scaling yok |
| **Player damage scaling** | Weapon level + rarity | Damage inflation kontrolsüz. Evolved silahlar dengesiz olabilir |

### Modülerlik Yapısı

**Mevcut:** Dosya bazlı modülerlik (her sistem kendi dosyasında). Global namespace.

**Hedef Mimari:**
```
core/         → Game loop, state machine, event bus
entities/     → Player, Enemy (base), BossAI
combat/       → DamagePipeline, WeaponBase, ProjectileSystem
  weapons/    → Her silah tipi kendi dosyasında
progression/  → XPSystem, LevelUpManager, EvolutionSystem
economy/      → GoldSystem, Shop, Achievements, Quests
world/        → MapManager, HazardSystem, SpawnManager
rendering/    → Renderer, Camera, ParticleSystem, PostFX
ui/           → UIManager, HUD, Menus, Cards
input/        → InputManager (joystick, keyboard, dash)
audio/        → AudioManager
utils/        → ObjectPool, MathUtils
```

---

## 5️⃣ NE OLMAMALI?

### Scope Creep Alanları

| Tuzak | Neden Tehlikeli |
|-------|----------------|
| **Multiplayer ekleme** | Mimari tamamen single-player. Global state, senkron game loop. Refactor maliyeti > sıfırdan yazma |
| **Hikaye/diyalog sistemi** | Bu tür oyunlarda narrative retention sağlamaz. Kaynak israfı |
| **Crafting sistemi** | Ekonomi zaten karmaşık. Üstüne crafting eklemek UI cehennemine yol açar |
| **Inventory sistemi** | Vampire Survivors'da inventory yoktur. Basitlik bu türün gücüdür |
| **Procedural map generation** | Sonsuz arena formatında gereksiz. Hazard placement yeterli |
| **3D efektler / WebGL geçişi** | Canvas 2D yeterli. WebGL geçişi tüm rendering pipeline'ı yeniden yazma demek |

### Gereksiz Efektler

| Efekt | Risk |
|-------|------|
| **Her frame sprite alpha validation** | Yükleme sırasında bir kez yapılmalı, her frame değil |
| **Chromatic aberration her frame** | Canvas kopyalama + offset = pahalı. Sadece boss anlarında aktif olmalı |
| **Her düşman için shadowBlur** | 150 düşman × shadowBlur = GPU çökmesi mobilde. Sadece boss ve elite'ler için |
| **Her XP orb için glow efekti** | 100+ orb ekranda olduğunda performans katili |

### Performansı Öldürecek Şeyler

| Problem | Çözüm Yönü |
|---------|-----------|
| **150+ aktif düşman + bloom + CRT** | Düşman cap'i 100'e düşürülmeli mobilde, efektler ayarlanabilir olmalı |
| **splice() her kill'de** | Swap-and-pop pattern (O(1) vs O(n)) |
| **innerHTML her frame** | DOM element cache + sadece değişen alanları güncelle |
| **shadowBlur flood** | Glow efektini pre-rendered sprite olarak cache'le |
| **Parallax + grid + hazards + enemies aynı frame'de** | Spatial partitioning (grid-based culling) |

### Mobilde Bitirecek Hatalar

| Hata | Etki |
|------|------|
| **Touch event preventDefault** | İyi uygulanmış ✅ Ama `passive: false` bazı eski mobil tarayıcılarda uyarı verebilir |
| **Canvas DPR 2x** | `Math.min(dpr, 2)` var ✅ Ama Retina iPad'de 2x bile ağır olabilir |
| **Web Audio autoplay policy** | `Audio.resume()` user interaction'da çağrılıyor ✅ |
| **LocalStorage quota** | Save data şu an küçük ama achievement/quest genişlerse quota riski |
| **Font loading** | Google Fonts CDN — offline oynanamaz. Font embed edilmeli |

### "Ego Feature" Uyarıları

| Feature | Neden Ego Feature |
|---------|-----------------|
| **21 silah tanımı** | 6'sı temel, geri kalanı unlock. Ama evolved silahların tanımı bile yok. Sayıyı artırmak yerine mevcut 6'yı mükemmelleştir |
| **5 biome** | İyi sayı ama hepsi aynı hissettiriyorsa 5 yerine 3 iyi biome daha etkili |
| **Rarity sistemi (5 tier)** | Common→Mythic ciddi bir oyunda anlamlı. Burada sadece number multiplier — boş prestij |
| **CRT + Chromatic + Bloom + Vignette** | 4 post-processing efekti bir web oyunu için fazla. 2 yeterli |
| **Boss robotic hands** | Görsel karmaşıklık katıyor ama mekanik değeri sıfır |

---

## 6️⃣ GELİŞİM YOL HARİTASI

---

### FAZ 1 — STABİLİZASYON

**Hedef:** Mevcut kodu kırılmaz hale getir. Performans tabanını oluştur. Teknik borcu azalt.

| İş | Detay |
|----|-------|
| `splice()` → swap-and-pop | ObjectPool.active array'inde O(1) eleman çıkarma |
| Mob cap mobil tespiti | `navigator.hardwareConcurrency` veya FPS tracking ile dinamik maxEnemies |
| Post-processing toggle | Settings menüsü: Bloom ON/OFF, CRT ON/OFF. Mobilde default OFF |
| shadowBlur optimizasyonu | Sadece boss + elite düşmanlar için. Normal mob'lar flat renk |
| innerHTML → DOM cache | PowerupTimers, WeaponIcons için element pool |
| Sprite alpha validation | Sadece ilk yüklemede, sonuç cache'lenmeli |
| Font embed | Google Fonts → self-hosted woff2 |
| Error boundary | Game loop try/catch var ✅ Ama subsystem hataları sessizce yutulmamalı |

**Risk:** Performans değişiklikleri mevcut görsel kaliteyi düşürebilir. A/B karşılaştırması yapılmalı.

**Başarı Kriteri:** 
- Mobilde (orta segment telefon) 150 düşmanda 30+ FPS
- Masaüstünde 150 düşmanda 55+ FPS
- Sıfır console.error oyun sırasında

---

### FAZ 2 — MEKANİK TEMİZLİĞİ

**Hedef:** Gereksiz mekanikleri kaldır. Kalan mekanikleri netleştir. Oyuncu kafası karışmasın.

| İş | Detay |
|----|-------|
| Geçici powerup kaldır | LV11+ silahlar kalıcı olmalı. Geçici mekanik oyuncuyu cezalandırıyor |
| Simulated ad kaldır | Ya gerçek reklam SDK'sı ya da saf altın ekonomisi |
| Rarity basitleştir | 5 tier → 3 tier (Normal, Nadir, Efsanevi). Her tier'da görsel fark olmalı |
| Evolution tamamla | Tüm evolved silahların stat + mekanik tanımları yazılmalı |
| Damage pipeline birleştir | Tüm damage hesaplamaları tek fonksiyonda |
| Hazard'ları güçlendir | iceZone %85 → %60 speed. lavaPool 5 → 12 damage. electricFence görsel uyarı |
| Combo'yu hissettir | Combo 5+ → ekran titremesi. Combo 10+ → ses efekti. Combo 20+ → damage bonus |

**Risk:** Geçici powerup kaldırmak LV11+ dengeyi tamamen değiştirir. Yeni level-up seçenekleri tasarlanmadan yapılmamalı.

**Başarı Kriteri:**
- Oyuncu her seviye atladığında **kalıcı olarak güçleniyor**
- UI'da kafa karıştırıcı sıfır element
- Evolution sistemi çalışır durumda

---

### FAZ 3 — DERİNLİK EKLENMESİ

**Hedef:** Oyunu "bir daha oynayım" dedirtecek mekanikler ekle. Taktiksel derinlik kat.

| İş | Detay |
|----|-------|
| Dash/Dodge mekanizması | Çift dokunma veya buton ile kısa mesafe dash. Cooldown: 3s. Düşman mermilerinden kaçmak için kritik |
| Boss faz sistemi | Boss HP %50'de pattern değişimi. %25'te enrage modu. Görsel dönüşüm |
| Silah sinerjisi | Buz + Yıldırım = "Frozen Lightning" bonus efekti. Ateş + Roket = "Napalm" zone |
| Harita mekanik farkı | Ice Cave: kayma fiziği. Lava: platforma geç. Dark Forest: stealth mekanizması. Space: düşük yerçekimi zıplama |
| Elite düşman varyasyonları | Normal mob'ların güçlü versiyonları: ışıklı aura, farklı renk, özel yetenek |
| Mini-boss çeşitliliği | Her biome için 3-4 farklı mini-boss rotasyonu |

**Risk:** Yeni mekanikler mobil kontrollerle uyumsuz olabilir. Dash özellikle dokunmatik ekranda test edilmeli.

**Başarı Kriteri:**
- Oyuncu 5+ dakika hayatta kalabildiğinde hâlâ yeni şeyler keşfediyor
- Boss savaşları her seferinde biraz farklı hissettiriyor
- En az 2 silah sinerjisi çalışıyor

---

### FAZ 4 — RETENTION

**Hedef:** Oyuncuyu günlük geri getiren sistemler kur.

| İş | Detay |
|----|-------|
| Achievement genişlet | 4 → 20 achievement. Milestone tabanlı (100, 500, 1000 kill; 3, 5, 10 dakika hayatta kal) |
| Haftalık görev | 5 haftalık görev havuzu. Daha büyük ödüller |
| Mastery sistemi | Her karakter için mastery tree: "Cipher ile 1000 düşman öldür → Cipher hızı +%5 kalıcı" |
| Run modifier | "Bugünün challenge'ı: 2x düşman hızı, 1.5x gold" — günlük değişen |
| Koleksiyon bölümü | "Düşman Ansiklopedisi" — her düşman tipini ilk öldürdüğünde kayıt |
| Gold ekonomi dengesi | İlk 5 upgrade hızlı (frontloaded), sonraki yavaş ama anlamlı |
| İstatistik sayfası | Toplam oyun süresi, en uzun hayatta kalma, en çok kill, favori karakter |

**Risk:** Retention sistemleri LocalStorage kapasitesini zorlayabilir. IndexedDB geçişi düşünülmeli.

**Başarı Kriteri:**
- 7 günlük retention simülasyonunda her gün en az 1 yeni unlock mümkün
- Günlük görev tamamlama süresi ortalama 1 run (3-5 dakika)
- Mastery sistemi 30+ saat içerik sunuyor

---

### FAZ 5 — POLISH

**Hedef:** Oyunu "yayınlanabilir" kaliteye çıkar. Görsel ve hissiyat mükemmelliği.

| İş | Detay |
|----|-------|
| Juice efektleri | Kill'de zaman yavaşlama (50ms), level-up'ta beyaz flash, boss öldürmede slow-mo |
| Ses tasarımı | Her silah tipi için benzersiz ateş sesi. Boss giriş müziği. Ambient biome sesleri |
| Tutorial | İlk 30 saniye: "Hareket et → Düşmanlar otomatik ölür → XP topla → Seviye atla" overlay |
| Erişilebilirlik | Renk körlüğü modu, font boyutu ayarı, titreşim ayarı |
| PWA desteği | Service worker + manifest.json → offline oynanabilir, ana ekrana ekle |
| Performans profiling | 60 FPS hedefinden sapma raporlaması |
| Splash screen | Yükleme ekranı + progress bar |
| Share/export | "Bu run'ımı paylaş" — screenshot + stats |

**Risk:** Polish aşaması sınırsız genişleyebilir. Scope kesin belirlenmeli.

**Başarı Kriteri:**
- Oyun ilk açılışta 2 saniyeden kısa sürede yükleniyor
- Tutorial tamamlama oranı %90+
- PWA Lighthouse skoru 80+

---

## 7️⃣ SONUÇ KARŞILAŞTIRMASI: ARCHITECT vs TESTER

| Konu | 🏗️ Architect | 🎮 Tester | Kazanan |
|------|-------------|-----------|---------|
| **Geçici powerup kaldırılsın mı?** | "Teknik olarak basit bir değişiklik. Ama LV11+ balance tamamen yeniden yazılmalı" | "HEMEN kaldır. Oyuncu seviye atlayıp zayıflamak istemiyor" | 🎮 **Tester** — Oyuncu deneyimi öncelikli |
| **Rarity sistemi kalsın mı?** | "Altyapı iyi. 3 tier'a sadeleştirip görsel fark ekle" | "Ya anlamlı yap ya kaldır. Şu hali boş prestij" | 🏗️ **Architect** — Sadeleştirme daha az riskli |
| **enemy.js bölünsün mü?** | "1442 satır tek dosya kabul edilemez. En az 4 modüle bölünmeli" | "Oyuncuyu etkilemiyor. Öncelik düşük" | 🏗️ **Architect** — Teknik borç birikiyor |
| **Dash mekanizması eklensin mi?** | "Input sistemi değişmeli. Mobil UX riski yüksek" | "Düşman mermilerinden kaçamıyorsun. ZORUNLU" | 🎮 **Tester** — LV5+ oynanabilirlik için kritik |
| **5 biome yeterli mi?** | "Mevcut biome'ları mekanik olarak farklılaştırmak yeni biome eklemekten öncelikli" | "3 biome bile yeter ama her biri GERÇEKTEN farklı hissettirmeli" | ⚖️ **İkisi de haklı** — Kalite > Sayı |
| **Boss robotic hands kalsın mı?** | "Ekstra render maliyeti var ama görsel karmaşıklık katıyor" | "Mekanik değeri sıfır. Görsel noise. Kaldır" | 🎮 **Tester** — Performans > Boş görsel |
| **Post-processing 4 efekt fazla mı?** | "Bloom + Vignette yeterli. CRT ve CA toggle'a alınmalı" | "PC'de havalı, mobilde pil öldürüyor" | 🏗️ **Architect** — Toggle sistemi teknik çözüm |
| **Gold ekonomi dengesi** | "costMultiplier 1.5-2.5 arası makul, progression curve'ü koruyor" | "5. upgrade için 10 run oynamak oyuncuyu kaçırır" | 🎮 **Tester** — Frontloaded ödüllendirme daha iyi retention verir |
| **Evolution sistemi öncelikli mi?** | "Recipe'ler hazır ama evolved silah tanımları yok. Yarım sistem yayınlanamaz" | "Oyuncu hedefi olarak kritik. 'Bu ikisini birleştireyim' motivasyonu güçlü" | ⚖️ **İkisi de haklı** — Tamamlanmalı ama acele edilmemeli |
| **Tutorial gerekli mi?** | "İlk deneyim metriği olmadan bilemeyiz" | "İlk 10 saniyede ne yapacağımı bilmiyordum" | 🎮 **Tester** — Mobil oyunlarda tutorial zorunlu |

### Riskli Kararlar
1. **Geçici powerup kaldırma** → LV11+ oyun dengesini kökten değiştirir. Yeni seçenek seti tasarlanmadan yapılmamalı.
2. **Dash ekleme** → Mobil kontrollerle uyum riski. Prototip + test zorunlu.
3. **enemy.js refactor** → 1442 satırlık dosyayı bölmek regression riski taşır. Her bölüm sonrası tam test.

### Ticari Olarak Mantıklı Kararlar
1. **Retention sistemleri (Faz 4)** → Günlük geri dönüş = reklam geliri potansiyeli
2. **Tutorial** → Conversion rate artışı
3. **PWA desteği** → Uygulama mağazası olmadan dağıtım
4. **Gold ekonomi balans** → İlk saatlerde tatmin = uzun vadeli oyuncu

### Teknik Olarak Mantıklı Kararlar
1. **swap-and-pop** → Anlık performans kazanımı, düşük risk
2. **Post-processing toggle** → Mobilde FPS artışı, kullanıcı kontrolü
3. **Font embed** → Offline çalışma, CDN bağımlılığı sıfır
4. **Damage pipeline birleştirme** → Bug azaltma, bakım kolaylığı

---

**PLAN TAMAMLANDI. KOD YAZMAM İÇİN TALİMAT BEKLİYORUM.**
