# Trendslope

One page that pulls the best of my other sites into a single live feed: what's trending, the day's top games, new movies, deals, music, software, books and audio, stocks, and today's meals. Tap a tile to open it, tap the star to save it, or open any of the full sites from the menu without leaving the page.

It is a plain static site: one `index.html`, a few stylesheets, and no build step.

**Live:** `https://www.trendslope.com/`

The old address, `https://marcitech.is-a.dev/Trendslope/`, stays up until 1/1/2027 with a notice and a one-click way to move your saved data (see [Moving from the old address](#moving-from-the-old-address)). The other sites still live at `marcitech.is-a.dev/<repo>`.

## What it shows

The page has two tabs, **Live Stream** and **Favorites**, and a **Popular / Latest** sort. Source chips under the tabs show or hide each site's tiles (Sports, Movies, Music, Software, Stocks, Books & Audio, Trending Topics, Deals, Diet; on phones they sit on two even lines, and the menu keeps its own order). The grid draws once everything has loaded, shows 60 tiles at a time, and loads more as you scroll. Switching tab or sort jumps back to the top, and a **Top** button appears after you scroll down (it also appears inside every site opened from the menu, once you scroll that site down about a screen). **Mixing.** The sources take turns so the page is not one source after another. On **Popular**, each source keeps its own ranking order, but the grid shows one tile from each source in turn (a different random source order each round: one sport, one trending topic, one music tile, and so on, then the second tile of each). On **Latest**, the grid stays in date order **between 4-hour blocks** (local time: 0 to 4, 4 to 8, and so on, never crossing midnight), and inside each block the sources are mixed the same way. The random order is seeded by the clock, so it holds still for 4 hours and then reshuffles on Popular; on Latest a given block always mixes the same way. Day headings (Today, Yesterday...) work as before.

Each tile type has its own rules:

| Source | Repo | What goes into the Live Stream |
| --- | --- | --- |
| **Sports** | `SportsDashboard` | NFL, NHL, MLB, NBA, college football and college basketball. The day's top 3 matchups (by `matchup_rank`, which ranks the whole day, not each time slot), only for games on the Sports Dashboard's own board: football (NFL and college football) shows the current week and the next, every other sport shows yesterday, today and tomorrow. The Live Stream runs through the end of tomorrow. Live scores are added to tiles, and sports tiles are always light. |
| **Movies** | `Movies` | The Movies site's overall board for the last 3 months. A movie is ranked if it has a box office of $2M or more (or $1M or more with a Rotten Tomatoes or IMDb score), or both a Rotten Tomatoes score and an IMDb rating, and the tile date is the release date. Ranks come from the 3-month board, but only movies released in roughly the last month (through tomorrow) get a Live Stream tile. |
| **Music** | `Music` | The Music site's all-sources list. Each link button (Spotify, Apple, Video, Billboard) shows that service's favicon. |
| **Software** | `Software` | Top GitHub (stars), Steam (most played) and App Store (Apple ranking) lists. The Open button on each tile shows that store's favicon, and a "Search Google Play" button with the Play favicon sits under it on App Store tiles only. |
| **Books & Audio** | `BooksAudio` | Apple's Top Paid Books, Top Audiobooks and Top Podcasts charts, shown as Books, Audio Books and Podcasts tiles. Only the top 20 of each chart get a tile, and, like every other source, only if the item's date falls in the 30-day window. Each tile has link buttons in lines of two (Amazon and Google Books, then Apple Books and Goodreads, then Barnes & Noble on a line of its own for books; Audible and Amazon, then Apple Books and Spotify for audio books; Apple Podcasts and Spotify, then YouTube and Amazon Music for podcasts). |
| **Stocks** | `Stocks` | The Stocks site's overall board (its All tab): stocks that are on at least 2 of its 4 rankings (Gainers, Losers, Most Active, Buzz), in that board's order, and only the top 20 of that board get tiles. Losers appear on the tile with a red negative change; the Chg box shows the stock's Gainers or Losers rank. The tile time is when the stock started trending (the "35m ago" on the tile). The board has no time window of its own: it is the latest snapshot, refreshed every 15 minutes on business days. Like Trending Topics and Slickdeals, it also ignores the page's 30-day window, so the top 20 always have tiles, even a stock that has been on the board for more than 30 days. |
| **Trending Topics** | `TrendingTopics` | Social media: top 20. Reddit: top 25. Google: everything added in the past hour (up to 25) plus the top 20 overall, each by rank. Google and Reddit tiles show the site's favicon in a boxed button; Social Media tiles show a row of five favicon-only search links (Facebook, X, Threads, Bluesky, Mastodon) for the topic. |
| **Slickdeals** | `SlickDealsTracker` | Every deal from the past 2 hours plus the top 20 overall by rating. Expired deals show an "Expired" badge, and the rating comes from `expired.xml` when it has one. Each tile ends with a centered, boxed "View deal" button with the Slickdeals favicon. |
| **Single Man's Diet** | `SingleManDiet` | Today's and tomorrow's meals from the planner's saved weeks (every week that has dates; if two weeks cover the same day the higher-numbered week wins, and the unsaved current week is used only when no saved week has dates). Meals sit at 8am (breakfast), 10am (brunch), 12pm (lunch), 7pm (dinner) and 10pm (late dinner). On Popular, the meal closest to now comes first, then the rest go forward in time. A Select button opens the planner to pick a replacement. |

The trending, deals, stocks and diet feeds ignore the date filter on purpose. They always show their own top lists so no one source takes over the page. Everything else uses a fixed window of the last 30 days (plus the next 12 hours). The old 1 hour / 1 day / 1 week / 1 month buttons were removed. **Tomorrow's items stay hidden until 6pm local time tonight**, then appear on the next minute's refresh.

### Tiles and the header

- Every tile has a purple banner on top with the source name (and the sub category where there is one: Reddit / Google / Social Media for Trending Topics, GitHub / Steam / App Store for Software, Books / Audio Books / Podcasts for Books & Audio). Tapping it opens that site in the in-page viewer. Sports banners go to that sport's own Sports Dashboard page (`index.html` for college football, `nfl.html`, `mlb.html`, `nba.html`, `nhl.html`, `ncaamb.html`).
- The slanted header line scrolls the titles of what landed on the board in the last hour, separated by stars. If nothing landed in the last hour it falls back to the last day.

## How it works

- **No backend.** On load the page fetches each site's JSON (and `deals.xml` / `expired.xml` for Slickdeals) straight from `raw.githubusercontent.com`. Requests are cached for 5 minutes with a `?v=` parameter, and the page re-renders every 60 seconds.
- **The data repos do the work.** Each of those repos has its own scheduled job (usually GitHub Actions) that refreshes its JSON. Trendslope only reads it, so a tile is only as fresh as its repo's last run.
- **Two domains.** Trendslope lives at `www.trendslope.com`; the sites it shows live at `marcitech.is-a.dev/<repo>`, so inside Trendslope they are cross-origin frames. Three small pieces make that work (details under [Cross-domain pieces](#cross-domain-pieces)): a storage bridge for favorites, `ts-embed.js` loaded by each site so the banner can follow its scroll, and a one-time data transfer from the old address.
- **Menu and in-page viewer.** The menu (or `#/<site>` in the URL) opens a site in a full-screen frame under the Trendslope banner. The **Main page** button returns to the grid. A site that loads `ts-embed.js` runs behind the banner and the banner scrolls up and away as you scroll the site (the sliver under the banner's slanted edge takes the site's own color, in light and dark). A site without it opens in a frame that starts below a fixed banner. The **Top** button works in the viewer too: the site reports how far it has scrolled, the button shows after about a screen, and tapping it asks the site to scroll back up (on the Sports pages it sits just above their own Key button).
- **Per-site look.** Each source's tiles are styled by its own file in `css/`, copied from that site so tiles match.

## Favorites and saved settings

- **Favorites tab.** It shows anything you starred here or on the other sites, today's diet meals, and any sports game you made a pick on. Items you starred on another site that are no longer in today's data are rebuilt from the snapshot that site saved.
- **Loading.** Changing the tab, sort or a source chip, and the first load, show a plain "Loading…" right away and then draw the tiles a moment later, so the page never sits frozen on the old view.
- Stars are stored per site in the browser (`movies_favs`, `music_favs`, `stocks_favs` and so on), using the same storage as each site, so a favorite saved here shows up there and the other way round. On `www.trendslope.com` that storage is reached through the bridge (below).
- Sports picks are kept in `localStorage` under `fb_pick_pick_<sport>_<id>` (each entry carries an expiry, so picks still lapse every Aug 1). Older `pick_<sport>_<id>` cookies are still read, and removed as picks change. Cookies can't be written from a frame on another site, which is why picks moved to storage.
- A starred stock only shows on the Favorites tab while it is on the Stocks board (the Stocks site shows it greyed out when it is not).
- Single Man's Diet meals come from the weekly plan saved by the planner in the same browser. If no plan with dates has been saved, no diet tiles show.
- Your last tab, sort and hidden sources are kept in cookies (`ts_tab`, `ts_sort2`, `ts_win`, `ts_hide`) for a year. These belong to whichever address you are on, so they are separate on the old and new address until you transfer them.
- Safari clears script-written storage after about 7 days without a visit to the site. Browsers other than Safari keep it until you clear it.

## Mobile

- On screens 700px wide or less, the banner becomes a slim slanted bar with a small menu button, and the controls and fonts are smaller.
- The page runs under Safari's bars (`viewport-fit=cover`), with padding to keep content clear of the notch and home indicator. Safari decides how its own bar looks, and it stays white on some versions.
- On touch phones, each site opens in the frame at its own mobile scale. A viewport tag inside a frame is ignored, so Trendslope sets the scale itself: Movies, Music and Software 0.8, Stocks and Trending Topics 0.75, Books & Audio 0.62, Slickdeals 0.6, Sports 0.85, Single Man's Diet 1.0. Desktop and tablet are not scaled.

## Cross-domain pieces

- **Storage bridge** (`bridge.html`, in the **root of the `marcitech.is-a.dev` base repo**, not in this repo). On `www.trendslope.com`, `transfer.js` loads it in a hidden frame and reads and writes the favorites keys through `postMessage`. The bridge only answers `www.trendslope.com` and `trendslope.com`, and only for an allowlist of keys (the favorites, the diet planner's saved weeks, and anything starting `fb_`, which includes sports picks and theme). Its address is the `BRIDGE` constant at the top of `transfer.js`; if the file moves, change it there. Keep the bridge on `marcitech.is-a.dev`, because that is where the sites' storage lives.
- **`ts-embed.js`** (also in the base repo's root). Each site loads it with `<script src="/ts-embed.js"></script>` (Sports does it once from `site-key.js`, which every Sports page already loads). Inside Trendslope it says hello, pads the top of the page by the banner's height (a flat strip in the site's own color for Sports), reports how far the page has scrolled so the banner can follow, and scrolls the page back to the top when the Top button is tapped. Outside Trendslope it does nothing.
- **`transfer.js`** (this repo). It is the storage layer (`TSB`) used by `index.html` and the data transfer described below.

Add `?tsdebug=1` to the address to see a small readout of what the frame is sending (`hello`, or a warning if `ts-embed.js` isn't loaded).

## Moving from the old address

On `marcitech.is-a.dev/Trendslope` (the old site) `transfer.js` shows a banner saying the site will be removed on **1/1/2027**, plus a popup with a **Transfer my data** button. The button gathers your favorites, diet weeks, sports picks, `fb_` settings and the `ts_*` cookies, compresses them into the address, and sends you to `www.trendslope.com/#migrate=...`. The new page merges them with anything already there (what is already on the new site wins), clears the address, and reloads once. Nothing is removed from the old site. From 1/1/2027 (`AUTO_FROM` in `transfer.js`) the old site transfers and redirects without asking. Keep `bridge.html` up for as long as the new site is live.

## Files

```
index.html      the whole app (markup, logic, banner, menu, viewer)
transfer.js     storage layer for the cross-domain bridge, plus the old-to-new data transfer and the old site's notice
css/            per-source tile styles: books, deals, diet, fonts, movies, music, software, sports, stocks, trends
diet-shared.js  copy of the Single Man's Diet planner code, used to build the meal tiles
picks-store.js  copy of the Sports Dashboard picks and scores code
runner.gif      banner image
favicon.gif     favicon
```

`diet-shared.js` and `picks-store.js` are copies of files from the other repos. If those change, update the copies here. `picks-store.js` here and in the Sports Dashboard repo must both be the version that keeps picks in `localStorage`.

## Configuration

Settings are constants near the top of the script in `index.html`:

- `U` and `BRANCH`: the GitHub user and branch the data is read from (`mzaiger`, `main`).
- `SITE`: the repo name for each source (for example `deals: 'SlickDealsTracker'`).
- `SITEBASE`: where the full sites are served from (`https://marcitech.is-a.dev/`). Set `window.TS_BASE` before the script to override it.
- `COLORS` and `NAMES`: each source's chip color and label.
- `SITESCALE`: the mobile scale used when a site opens in the frame.
- `SPAGE`: which Sports Dashboard page each sport's tile banner links to.

The Stocks tile is drawn by `stkTile()` in `index.html` and styled by `css/stocks.css`, which is the Stocks site's own stylesheet (`:root` became `:host`). If the tile changes on the Stocks site, copy its `<style>` block over `css/stocks.css` the same way and update `stkTile()`.

To add a source: add it to `SITE`, `COLORS` and `NAMES`, write a loader that calls `add([...])` with items shaped like the others, add a tile renderer, and put its styles in `css/`.

## Run locally

Any static server works:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

The data still comes from GitHub, so the grid works locally. On `localhost` the bridge is off and favorites use local storage, so they won't match the sites' real data, and the frames are cross-origin so sites open below a fixed banner.

## Deploy

Push to `main` and turn on GitHub Pages for the repo (Settings, then Pages, then deploy from the `main` branch root). There is nothing to build.

**Custom domain.** In Settings, then Pages, the custom domain is `www.trendslope.com`, with Enforce HTTPS on. At the registrar (Spaceship) the apex has four A records (`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`) and `www` is a CNAME to `mzaiger.github.io`. GitHub redirects `trendslope.com` to `www`. The repo can be renamed without affecting the site, since nothing uses the repo name.

## Credits

Tile data, images and styles come from the repos listed above. Each of them lists its own upstream sources, such as TMDb and OMDb for movies.
