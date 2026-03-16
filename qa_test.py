#!/usr/bin/env python3
"""Neon Horde: Survivor — Automated QA Test Suite"""
import urllib.request, json, sys

BASE = "http://127.0.0.1:8000"
passed = 0
failed = 0

def check(ok, label):
    global passed, failed
    if ok:
        passed += 1
        print(f"  PASS: {label}")
    else:
        failed += 1
        print(f"  FAIL: {label}")

def fetch(path):
    r = urllib.request.urlopen(f"{BASE}/{path}", timeout=5)
    return r.read().decode("utf-8")

# ---- TEST 1: HTTP 200 on all files ----
print("=== TEST 1: HTTP 200 (19 files) ===")
files = [
    "index.html","css/style.css","manifest.json","sw.js",
    "js/main.js","js/player.js","js/enemy.js","js/weapons.js",
    "js/renderer.js","js/camera.js","js/input.js","js/ui.js",
    "js/audio.js","js/economy.js","js/xp.js","js/particles.js",
    "js/characters.js","js/maps.js","js/pool.js"
]
all_ok = True
for f in files:
    try:
        r = urllib.request.urlopen(f"{BASE}/{f}", timeout=3)
        if r.getcode() != 200:
            all_ok = False
            print(f"  FAIL: {f} -> {r.getcode()}")
    except Exception as e:
        all_ok = False
        print(f"  FAIL: {f} -> {e}")
check(all_ok, "All 19 files return HTTP 200")

# ---- TEST 2: manifest.json ----
print("\n=== TEST 2: PWA Manifest ===")
try:
    m = json.loads(fetch("manifest.json"))
    check(bool(m.get("name")), f'name: "{m.get("name")}"')
    check(bool(m.get("start_url")), f'start_url: "{m.get("start_url")}"')
    check(m.get("display") == "standalone", "display = standalone")
    check(bool(m.get("theme_color")), f'theme_color: "{m.get("theme_color")}"')
except Exception as e:
    check(False, f"manifest parse: {e}")

# ---- TEST 3: Service Worker ----
print("\n=== TEST 3: Service Worker ===")
try:
    sw = fetch("sw.js")
    check("install" in sw, "install event handler")
    check("activate" in sw, "activate event handler")
    check("fetch" in sw, "fetch event handler")
    check("caches.open" in sw, "caches.open call")
    check("neon-horde" in sw.lower() or "CACHE_NAME" in sw, "cache name defined")
except Exception as e:
    check(False, f"sw.js: {e}")

# ---- TEST 4: DOM Elements ----
print("\n=== TEST 4: Critical DOM Elements ===")
try:
    html = fetch("index.html")
    elements = [
        "menu-screen", "charselect-screen", "mapselect-screen",
        "pause-screen", "levelup-screen", "gameover-screen",
        "results-screen", "shop-screen", "hud", "game-canvas",
        "result-menu-btn", "result-restart-btn",
        "go-revive-btn", "go-end-btn",
        "tutorial-overlay", "contrast-toggle-btn", "hudsize-toggle-btn",
    ]
    for el in elements:
        check(el in html, f"id=\"{el}\" exists")
    check('manifest.json' in html, "manifest link in HTML")
    check('sw.js' in html or 'serviceWorker' in html, "SW registration in HTML")
except Exception as e:
    check(False, f"index.html: {e}")

# ---- TEST 5: main.js Code Flow (ITEM 4 CRITICAL) ----
print("\n=== TEST 5: main.js — Death/Results/Menu Flow ===")
try:
    mjs = fetch("js/main.js")
    # returnToMenu completeness
    check("UI.hideResults()" in mjs, "returnToMenu calls UI.hideResults()")
    check("UI.hideGameOver()" in mjs, "returnToMenu calls UI.hideGameOver()")
    check("UI.hideLevelUp()" in mjs, "returnToMenu calls UI.hideLevelUp()")
    check("UI.hideHUD()" in mjs, "returnToMenu calls UI.hideHUD()")
    check("UI.hidePause()" in mjs, "returnToMenu calls UI.hidePause()")
    check("Enemies.clear()" in mjs, "returnToMenu calls Enemies.clear()")
    check("Particles.clear()" in mjs, "returnToMenu calls Particles.clear()")
    check("XPOrbs.clear()" in mjs, "returnToMenu calls XPOrbs.clear()")
    check("Weapons.clear()" in mjs, "returnToMenu calls Weapons.clear()")
    check("UI.showMenu()" in mjs, "returnToMenu calls UI.showMenu()")
    check("this.state = 'MENU'" in mjs, "returnToMenu sets state='MENU'")
    # gameOver
    check("this.state = 'GAMEOVER'" in mjs, "gameOver sets state='GAMEOVER'")
    check("UI.showGameOver()" in mjs, "gameOver shows game over screen")
    # showResults
    check("this.state = 'RESULTS'" in mjs, "showResults sets state='RESULTS'")
    check("Economy.endRun" in mjs, "showResults calls Economy.endRun")
    # resetAndStart
    check("UI.hideAll()" in mjs, "resetAndStart calls UI.hideAll()")
    check("this.startGame()" in mjs, "resetAndStart -> startGame()")
    # hitstop
    check("timeScale" in mjs and "hitstopTimer" in mjs, "hitstop system")
    # bossKill audio
    check("Audio.playBossDeath" in mjs, "boss death stinger trigger")
    # collection
    check("Economy.recordEnemyKill" in mjs, "enemy collection tracking")
except Exception as e:
    check(False, f"main.js: {e}")

# ---- TEST 6: ui.js — Button Handlers ----
print("\n=== TEST 6: ui.js — Button Handlers & Systems ===")
try:
    ujs = fetch("js/ui.js")
    # CRITICAL: resultMenuBtn must call Game.returnToMenu()
    check("Game.returnToMenu()" in ujs, "resultMenuBtn -> Game.returnToMenu()")
    check("Game.resetAndStart()" in ujs, "resultRestartBtn -> Game.resetAndStart()")
    check("Game.showResults()" in ujs, "goEndBtn -> Game.showResults()")
    # hideAll
    check("hideResults" in ujs and "hideGameOver" in ujs and "hideLevelUp" in ujs,
          "hideAll covers all screens")
    # tutorial
    check("startTutorial" in ujs, "tutorial system: startTutorial")
    check("_updateTutorial" in ujs, "tutorial system: _updateTutorial")
    check("TUTORIAL_STORAGE_KEY" in ujs, "tutorial localStorage key")
    # accessibility
    check("_access" in ujs, "accessibility system: _access object")
    check("_applyAccessibility" in ujs, "accessibility: _applyAccessibility")
    check("_saveAccessibility" in ujs, "accessibility: _saveAccessibility")
    check("access-contrast" in ujs or "highContrast" in ujs, "contrast toggle logic")
    check("hud-large" in ujs or "hudLarge" in ujs, "HUD size toggle logic")
except Exception as e:
    check(False, f"ui.js: {e}")

# ---- TEST 7: economy.js — Meta Systems ----
print("\n=== TEST 7: economy.js — Collection & Meta ===")
try:
    ejs = fetch("js/economy.js")
    check("recordEnemyKill" in ejs, "recordEnemyKill function")
    check("getCollectionSummary" in ejs, "getCollectionSummary function")
    check("getNewDiscoveryNames" in ejs, "getNewDiscoveryNames function")
    check("enemyCollection" in ejs, "enemyCollection tracking object")
    check("startRunWithModifier" in ejs, "run modifier system")
    check("Modifier" in ejs, "modifier system field")
    check("dailyQuest" in ejs, "daily quest system")
    check("weeklyQuest" in ejs, "weekly quest system")
    check("achievements" in ejs, "achievements system")
    check("mastery" in ejs, "mastery system")
    check("getMetaSummary" in ejs, "getMetaSummary function")
    check("statsText" in ejs, "statsText in meta summary")
    check("collectionText" in ejs, "collectionText in meta summary")
except Exception as e:
    check(False, f"economy.js: {e}")

# ---- TEST 8: renderer.js — Juice Effects ----
print("\n=== TEST 8: renderer.js — Juice Effects ===")
try:
    rjs = fetch("js/renderer.js")
    check("levelUpFlash" in rjs, "levelUpFlash field")
    check("notifyLevelUp" in rjs, "notifyLevelUp method")
except Exception as e:
    check(False, f"renderer.js: {e}")

# ---- TEST 9: audio.js — Boss Stinger ----
print("\n=== TEST 9: audio.js — Boss Death Stinger ===")
try:
    ajs = fetch("js/audio.js")
    check("playBossDeath" in ajs, "playBossDeath method")
except Exception as e:
    check(False, f"audio.js: {e}")

# ---- TEST 10: xp.js — Dynamic Gold ----
print("\n=== TEST 10: xp.js — Dynamic Gold System ===")
try:
    xjs = fetch("js/xp.js")
    check("GoldOrbs" in xjs, "GoldOrbs system")
    check("trySpawn" in xjs, "trySpawn method")
except Exception as e:
    check(False, f"xp.js: {e}")

# ---- TEST 11: CSS Accessibility ----
print("\n=== TEST 11: css/style.css — Accessibility ===")
try:
    css = fetch("css/style.css")
    check("access-contrast" in css, "body.access-contrast rule")
    check("hud-large" in css, "body.hud-large rule")
    check("tutorial-overlay" in css, "#tutorial-overlay styles")
except Exception as e:
    check(False, f"style.css: {e}")

# ---- SUMMARY ----
total = passed + failed
print("\n==========================================")
print(f"  TOPLAM: {total} test")
print(f"  PASS:   {passed}")
print(f"  FAIL:   {failed}")
if failed == 0:
    print("  SONUC: TUM TESTLER GECTI!")
else:
    print(f"  SONUC: {failed} TEST KALDI")
print("==========================================")
sys.exit(0 if failed == 0 else 1)
