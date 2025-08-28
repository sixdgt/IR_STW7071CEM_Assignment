import argparse, json, os, time, re
from math import ceil
from pathlib import Path
from typing import List, Dict

# Selenium
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from webdriver_manager.firefox import GeckoDriverManager
from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Parallelism
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE_URL = (
    "https://pureportal.coventry.ac.uk/en/organisations/fbl-school-of-economics-finance-and-accounting/publications/"
)

# =========================== Firefox helpers ===========================
def build_firefox_options(headless: bool) -> FirefoxOptions:
    opts = FirefoxOptions()
    if headless:
        opts.add_argument("--headless")
    opts.add_argument("--window-size=1366,900")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--lang=en-US")
    opts.add_argument("--disable-notifications")
    opts.add_argument("--no-default-browser-check")
    opts.add_argument("--disable-extensions")
    opts.add_argument("--disable-popup-blocking")
    opts.set_preference("dom.webnotifications.enabled", False)
    opts.set_preference("general.useragent.override", 
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:129.0) Gecko/20100101 Firefox/129.0")
    return opts

def make_driver(headless: bool, legacy_headless: bool = False) -> webdriver.Firefox:
    service = FirefoxService(GeckoDriverManager().install(), log_output=os.devnull)
    print(f"Using GeckoDriver: {service.service_url}")
    driver = webdriver.Firefox(service=service, options=build_firefox_options(headless))
    driver.set_page_load_timeout(45)
    try:
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    except Exception as e:
        print(f"Failed to execute script to hide webdriver: {e}")
    return driver

def accept_cookies_if_present(driver: webdriver.Firefox):
    try:
        btn = WebDriverWait(driver, 6).until(
            EC.presence_of_element_located((By.ID, "onetrust-accept-btn-handler"))
        )
        driver.execute_script("arguments[0].click();", btn)
        time.sleep(0.25)
    except TimeoutException:
        pass
    except Exception:
        pass

# =========================== LISTING (Stage 1) ===========================
def scrape_listing_page(driver: webdriver.Firefox, page_idx: int) -> List[Dict]:
    url = f"{BASE_URL}?page={page_idx}"
    driver.get(url)
    try:
        WebDriverWait(driver, 15).until(
            lambda d: d.find_elements(By.CSS_SELECTOR, ".result-container h3.title a")
                      or "No results" in d.page_source
        )
    except TimeoutException:
        pass

    cards = driver.find_elements(By.CLASS_NAME, "result-container")
    rows: List[Dict] = []
    for c in cards:
        try:
            a = c.find_element(By.CSS_SELECTOR, "h3.title a")
            title = a.text.strip()
            link = a.get_attribute("href")
            if title and link:
                rows.append({"title": title, "link": link})
        except Exception:
            continue
    return rows

def gather_all_listing_links(max_pages: int, headless_listing: bool = False, legacy_headless: bool = False) -> List[Dict]:
    # Listing works more reliably non-headless
    driver = make_driver(headless_listing, legacy_headless)
    try:
        driver.get(BASE_URL)
        accept_cookies_if_present(driver)
        all_rows: List[Dict] = []
        for i in range(max_pages):
            print(f"[LIST] Page {i+1}/{max_pages}")
            rows = scrape_listing_page(driver, i)
            if not rows:
                print(f"[LIST] Empty at page index {i}; stopping early.")
                break
            all_rows.extend(rows)
        # dedupe by link
        uniq = {}
        for r in all_rows:
            uniq[r["link"]] = r
        return list(uniq.values())
    finally:
        try:
            driver.quit()
        except Exception:
            pass

# =========================== DETAIL (Stage 2) ===========================
# author parsing helpers
FIRST_DIGIT = re.compile(r"\d")
NAME_PAIR = re.compile(
    r"[A-Z][A-Za-z'’\-]+,\s*(?:[A-Z](?:\.)?)(?:\s*[A-Z](?:\.)?)*",
    flags=re.UNICODE
)

def _uniq(seq: List[str]) -> List[str]:
    seen, out = set(), []
    for x in seq:
        x = x.strip()
        if x and x not in seen:
            seen.add(x); out.append(x)
    return out

def _get_meta_list(driver: webdriver.Firefox, names_or_props: List[str]) -> List[str]:
    vals = []
    for nm in names_or_props:
        for el in driver.find_elements(By.CSS_SELECTOR, f'meta[name="{nm}"], meta[property="{nm}"]'):
            c = (el.get_attribute("content") or "").strip()
            if c:
                vals.append(c)
    return _uniq(vals)

def _extract_authors_jsonld(driver: webdriver.Firefox) -> List[str]:
    import json as _json
    names = []
    for s in driver.find_elements(By.CSS_SELECTOR, 'script[type="application/ld+json"]'):
        txt = (s.get_attribute("textContent") or "").strip()
        if not txt:
            continue
        try:
            data = _json.loads(txt)
        except Exception:
            continue
        objs = data if isinstance(data, list) else [data]
        for obj in objs:
            auth = obj.get("author")
            if not auth:
                continue
            if isinstance(auth, list):
                for a in auth:
                    n = a.get("name") if isinstance(a, dict) else str(a)
                    if n: names.append(n)
            elif isinstance(auth, dict):
                n = auth.get("name")
                if n: names.append(n)
            elif isinstance(auth, str):
                names.append(auth)
    return _uniq(names)

def _maybe_expand_authors(driver: webdriver.Firefox):
    try:
        btns = driver.find_elements(
            By.XPATH,
            "//button[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'show') or "
            "contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'more')]"
        )
        for b in btns[:2]:
            try:
                driver.execute_script("arguments[0].scrollIntoView({block:'center'});", b)
                time.sleep(0.15)
                b.click()
                time.sleep(0.25)
            except Exception:
                continue
    except Exception:
        pass

def _authors_from_subtitle_simple(driver: webdriver.Firefox, title_text: str) -> List[str]:
    """
    Use the line containing authors + date:
    remove the title, keep chars until first digit (date starts),
    then extract 'Surname, Initials' pairs.
    """
    try:
        date_el = driver.find_element(By.CSS_SELECTOR, "span.date")
    except NoSuchElementException:
        return []

    # prefer ancestor with class 'subtitle' (portal markup), else parent
    try:
        subtitle = date_el.find_element(By.XPATH, "ancestor::*[contains(@class,'subtitle')][1]")
    except Exception:
        try:
            subtitle = date_el.find_element(By.XPATH, "..")
        except Exception:
            subtitle = None

    line = (subtitle.text if subtitle else "")
    if title_text and title_text in line:
        line = line.replace(title_text, "")
    line = " ".join(line.split()).strip()

    m = FIRST_DIGIT.search(line)
    pre_date = line[:m.start()].strip(" -—–·•,;|") if m else line
    pre_date = pre_date.replace(" & ", ", ").replace(" and ", ", ")
    pairs = NAME_PAIR.findall(pre_date)
    return _uniq(pairs)

def extract_detail_for_link(driver: webdriver.Firefox, link: str, title_hint: str, delay: float) -> Dict:
    driver.get(link)
    accept_cookies_if_present(driver)
    try:
        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CSS_SELECTOR, "h1")))
    except TimeoutException:
        pass

    # Title
    try:
        title = driver.find_element(By.CSS_SELECTOR, "h1").text.strip()
    except NoSuchElementException:
        title = title_hint or ""

    _maybe_expand_authors(driver)

    # AUTHORS: collect name + profile link if available
    authors = []
    for sel in [
        ".relations.persons a[href*='/en/persons/']",
        "section#persons a[href*='/en/persons/']",
    ]:
        for el in driver.find_elements(By.CSS_SELECTOR, sel):
            name = el.text.strip()
            href = el.get_attribute("href") or ""
            if name:
                authors.append({"name": name, "profile": href})
        if authors:
            break

    # Fallbacks if no structured authors found
    if not authors:
        # subtitle / meta / JSON-LD
        fallback_names = _authors_from_subtitle_simple(driver, title) \
                         or _get_meta_list(driver, ["citation_author", "dc.contributor", "dc.contributor.author"]) \
                         or _extract_authors_jsonld(driver)
        authors = [{"name": n, "profile": ""} for n in _uniq(fallback_names)]

    # PUBLISHED DATE
    published_date = None
    for sel in ["span.date", "time[datetime]", "time"]:
        try:
            el = driver.find_element(By.CSS_SELECTOR, sel)
            published_date = el.get_attribute("datetime") or el.text.strip()
            if published_date:
                break
        except NoSuchElementException:
            continue
    if not published_date:
        metas = _get_meta_list(driver, ["citation_publication_date", "dc.date", "article:published_time"])
        if metas:
            published_date = metas[0]

    # ABSTRACT
    abstract_txt = None
    for sel in [
        "section#abstract .textblock",
        "section.abstract .textblock",
        "div.abstract .textblock",
        "div#abstract",
        "section#abstract",
        "div.textblock",
    ]:
        try:
            el = driver.find_element(By.CSS_SELECTOR, sel)
            txt = el.text.strip()
            if txt and len(txt) > 15:
                abstract_txt = txt
                break
        except NoSuchElementException:
            continue
    if not abstract_txt:
        try:
            hdrs = driver.find_elements(By.CSS_SELECTOR, "h2, h3")
            for h in hdrs:
                if "abstract" in h.text.strip().lower():
                    nxt = h.find_element(By.XPATH, "./following::*[self::div or self::p or self::section][1]")
                    txt = nxt.text.strip()
                    if txt:
                        abstract_txt = txt
                        break
        except Exception:
            pass

    time.sleep(delay)
    return {
        "title": title,
        "link": link,
        "authors": authors,
        "published_date": published_date,
        "abstract": abstract_txt or ""
    }

# =========================== Workers ===========================
def worker_detail_batch(batch: List[Dict], headless: bool, legacy_headless: bool, delay: float) -> List[Dict]:
    driver = make_driver(headless=headless, legacy_headless=legacy_headless)
    out: List[Dict] = []
    try:
        for i, it in enumerate(batch, 1):
            try:
                rec = extract_detail_for_link(driver, it["link"], it.get("title",""), delay)
                out.append(rec)
                print(f"[WORKER] {i}/{len(batch)} OK: {rec['title'][:60]}")
            except WebDriverException as e:
                print(f"[WORKER] ERR {it['link']}: {e}")
                continue
    finally:
        try:
            driver.quit()
        except Exception:
            pass
    return out

def chunk(items: List[Dict], n: int) -> List[List[Dict]]:
    if n <= 1:
        return [items]
    size = ceil(len(items) / n)
    return [items[i:i+size] for i in range(0, len(items), size)]

# =========================== Orchestrator ===========================
def main():
    ap = argparse.ArgumentParser(description="Coventry PurePortal scraper (listing → details: authors + abstract + date).")
    ap.add_argument("--outdir", default="data")
    ap.add_argument("--max-pages", type=int, default=50, help="Max listing pages to scan (stops early on empty).")
    ap.add_argument("--workers", type=int, default=8, help="Parallel headless browsers for detail pages.")
    ap.add_argument("--delay", type=float, default=0.35, help="Per-detail polite delay (seconds).")
    ap.add_argument("--listing-headless", action="store_true", help="Run listing headless (not recommended).")
    ap.add_argument("--legacy-headless", action="store_true", help="Use legacy --headless (no effect for Firefox).")
    args = ap.parse_args()

    outdir = Path(args.outdir); outdir.mkdir(parents=True, exist_ok=True)

    # -------- Stage 1: listing
    print(f"[STAGE 1] Collecting links (up to {args.max_pages} pages)…")
    listing = gather_all_listing_links(args.max_pages, headless_listing=args.listing_headless, legacy_headless=args.legacy_headless)
    if not listing:
        print("No publications found on listing pages.")
        return
    (outdir / "publications_links.json").write_text(json.dumps(listing, indent=2), encoding="utf-8")
    print(f"[STAGE 1] Collected {len(listing)} unique links.")

    # -------- Stage 2: details (parallel)
    print(f"[STAGE 2] Scraping details with {args.workers} headless workers…")
    batches = chunk(listing, args.workers)
    results: List[Dict] = []
    with ThreadPoolExecutor(max_workers=args.workers) as ex:
        futs = [ex.submit(worker_detail_batch, batch, True, args.legacy_headless, args.delay) for batch in batches]
        done = 0
        for fut in as_completed(futs):
            part = fut.result() or []
            results.extend(part)
            done += 1
            print(f"[STAGE 2] Completed {done}/{len(batches)} batches (+{len(part)} items)")

    # -------- Save
    # de-dupe by link; prefer detail results
    by_link: Dict[str, Dict] = {}
    for it in listing:
        by_link[it["link"]] = {"title": it["title"], "link": it["link"]}
    for rec in results:
        by_link[rec["link"]] = rec  # overwrite with full detail

    final_rows = list(by_link.values())
    out_path = outdir / "publications.json"
    out_path.write_text(json.dumps(final_rows, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[DONE] Saved {len(final_rows)} records → {out_path}")

if __name__ == "__main__":
    main()