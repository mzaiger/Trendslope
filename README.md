# Trendslope

One page that pulls the best of my other sites into a single live feed: what's trending, the day's top games, new movies, deals, music, software, stocks, and today's meals. Tap a tile to open it, tap the star to save it, or open any of the full sites from the menu without leaving the page.

It is a plain static site: one `index.html`, a few stylesheets, and no build step.

**Live:** `https://marcitech.is-a.dev/Trendslope/`

## What it shows

The page has two tabs, **Live Stream** and **Favorites**, and a **Popular / Latest** sort. Source chips under the tabs show or hide each site's tiles. The grid draws once everything has loaded, shows 60 tiles at a time, and loads more as you scroll. Switching tab or sort jumps back to the top, and a **Top** button appears after you scroll down. Each tile type has its own rules:

| Source | Repo | What goes into the Live Stream |
| --- | --- | --- |
| **Trending Topics** | `TrendingTopics` | Social media: top 20. Reddit: top 25. Google: everything added in the past hour (up to 25) plus the top 20 overall, each by rank. |
| **Slickdeals** | `SlickDealsTracker` | Every deal from the past 2 hours plus the top 20 overall by rating. Expired deals show an "Expired" badge, and the rating comes from `expired.xml` when it has one. |
| **Sports** | `SportsDashboard` | NFL, NHL, MLB, NBA, college football and college basketball. The day's top 2 matchups per sport (by `matchup_rank`), through the end of tomorrow. Live scores are added to tiles. |
| **Movies** | `Movies` | The Movies site's overall board for the last 3 months. A movie is ranked if it has a box office, or both a Rotten Tomatoes score and an IMDb rating, and the tile date is the release date. |
| **Music** | `Music` | The Music site's all-sources list. |
| **Software** | `Software` | Top GitHub (stars), Steam (most played) and iTunes (Apple ranking) lists. |
| **Stocks** | `Stocks` | The Stocks site's overall board (its All tab): stocks that are on at least 2 of its 3 rankings (Gainers, Most Active, Buzz), in that board's order. The tile time is when the stock started trending (the "35m ago" on the tile). The board has no time window of its own: it is the latest snapshot, refreshed every 15 minutes on business days. |
| **Single Man's Diet** | `SingleManDiet` | Today's and tomorrow's meals from the latest week saved in the planner. On Popular, the meal closest to now comes first, then the rest go forward in time. |

The trending, deals and diet feeds ignore the date filter on purpose. They always show their own top lists so no one source takes over the page. Everything else uses a fixed window of the last 30 days (plus the next 12 hours). The old 1 hour / 1 day / 1 week / 1 month buttons were removed.

## How it works

- **No backend.** On load the page fetches each site's JSON (and `deals.xml` / `expired.xml` for Slickdeals) straight from `raw.githubusercontent.com`. Requests are cached for 5 minutes with a `?v=` parameter, and the page re-renders every 60 seconds.
- **The data repos do the work.** Each of those repos has its own scheduled job (usually GitHub Actions) that refreshes its JSON. Trendslope only reads it, so a tile is only as fresh as its repo's last run.
- **Same origin matters.** Every site lives under `marcitech.is-a.dev/<repo>`. That lets Trendslope share favorites with the sites, read their dark/light theme and scroll position, and slide its banner away as a frame scrolls.
- **Menu and in-page viewer.** The menu (or `#/<site>` in the URL) opens a site in a full-screen frame under the Trendslope banner. The **Main page** button returns to the grid, and the banner scrolls up and away as you scroll the site.
- **Per-site look.** Each source's tiles are styled by its own file in `css/`, copied from that site so tiles match.

## Favorites and saved settings

- Stars are stored per site in the browser (`movies_favs`, `music_favs`, `stocks_favs` and so on), using the same storage as each site, so a favorite saved here shows up there and the other way round.
- Sports picks use the same `pick_<sport>_<id>` cookies as the Sports Dashboard.
- A starred stock only shows on the Favorites tab while it is on the Stocks board (the Stocks site shows it greyed out when it is not).
- Single Man's Diet meals come from the weekly plan saved by the planner in the same browser. If no plan with dates has been saved, no diet tiles show.
- Your last tab, sort and hidden sources are kept in cookies (`ts_tab`, `ts_sort2`, `ts_hide`) for a year.

## Mobile

- On screens 700px wide or less, the banner becomes a slim slanted bar with a small menu button, and the controls and fonts are smaller.
- On touch phones, each site opens in the frame at its own mobile scale. A viewport tag inside a frame is ignored, so Trendslope sets the scale itself: Movies, Music, Software and Stocks 0.8, Trending Topics 0.75, Slickdeals 0.6, Sports 0.85, Single Man's Diet 1.0. Desktop and tablet are not scaled.

## Files

```
index.html      the whole app (markup, logic, banner, menu, viewer)
css/            per-source tile styles: deals, diet, fonts, movies, music, software, sports, stocks, trends
diet-shared.js  copy of the Single Man's Diet planner code, used to build the meal tiles
picks-store.js  copy of the Sports Dashboard picks and scores code
runner.gif      banner image
favicon.gif     favicon
```

`diet-shared.js` and `picks-store.js` are copies of files from the other repos. If those change, update the copies here.

## Configuration

Settings are constants near the top of the script in `index.html`:

- `U` and `BRANCH`: the GitHub user and branch the data is read from (`mzaiger`, `main`).
- `SITE`: the repo name for each source (for example `deals: 'SlickDealsTracker'`).
- `SITEBASE`: where the full sites are served from (`https://marcitech.is-a.dev/`). Set `window.TS_BASE` before the script to override it.
- `COLORS` and `NAMES`: each source's chip color and label.
- `SITESCALE`: the mobile scale used when a site opens in the frame.

The Stocks tile is drawn by `stkTile()` in `index.html` and styled by `css/stocks.css`, which is the Stocks site's own stylesheet (`:root` became `:host`). If the tile changes on the Stocks site, copy its `<style>` block over `css/stocks.css` the same way and update `stkTile()`.

To add a source: add it to `SITE`, `COLORS` and `NAMES`, write a loader that calls `add([...])` with items shaped like the others, add a tile renderer, and put its styles in `css/`.

## Run locally

Any static server works:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

The data still comes from GitHub, so the grid works locally. The full-site viewer needs the sites to be served from the same origin as Trendslope, so locally the frames can't be read for theme, scroll or favorites.

## Deploy

Push to `main` and turn on GitHub Pages for the repo (Settings, then Pages, then deploy from the `main` branch root). There is nothing to build.

## Credits

Tile data, images and styles come from the repos listed above. Each of them lists its own upstream sources, such as TMDb and OMDb for movies.
