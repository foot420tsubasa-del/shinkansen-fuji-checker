# Hotel-funnel insight report

`scripts/hotel-funnel-report.mjs` connects to **GA4** (Analytics Data API) and
**Google Search Console** (Search Analytics API) read-only, focuses on the
hotel funnel, and writes a prioritized markdown report to
`reports/hotel-funnel-latest.md` (+ a dated copy).

It reports:

1. **Hotel pages — views vs affiliate clicks**: per hotel page, the
   `affiliate_click` rate, flagging high-traffic / low-CTR pages (CTA candidates).
2. **Tokyo hotel-area finder funnel**: `finder_start → step_answered →
   results_view → area_details_click → result_hotel_page` drop-off.
3. **Affiliate clicks by placement** (needs a registered `placement` custom
   dimension; otherwise noted).
4. **Search Console hotel-intent quick wins**: hotel queries ranking 5–20 with
   real impressions — the cheapest SEO gains.
5. **Suggested next steps** (heuristic): the 1–3 highest-leverage fixes.

The output is data + heuristics. For a deeper read, paste the markdown into
Claude and ask for prioritized funnel fixes.

## One-time setup

1. In **Google Cloud**, create/pick a project and enable **Google Analytics
   Data API** and **Search Console API**.
2. Create a **service account** and download its **JSON key**. Treat it as a
   secret — it is gitignored (`*service-account*.json`); never commit it.
3. In **GA4** (property `534386847`) → Admin → *Property Access Management* →
   add the service-account email as **Viewer**.
4. In **Search Console** (`fujiseat.com`) → Settings → *Users and permissions* →
   add the service-account email (Restricted is enough).
5. Set the environment variables (e.g. a local `.env`, which is gitignored):

   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS=/abs/path/to/service-account.json
   export GA4_PROPERTY_ID=534386847
   export GSC_SITE_URL=sc-domain:fujiseat.com   # or https://fujiseat.com/
   ```

## Run

```bash
node scripts/hotel-funnel-report.mjs          # last 28 days
node scripts/hotel-funnel-report.mjs 90        # last 90 days
```

Then open `reports/hotel-funnel-latest.md`.

## Notes

- Read-only: the script never writes to Google and never prints the key.
- Steps 1, 2, 4 work with the default GA4 dimensions. Step 3 (placement
  breakdown) needs a `placement` custom dimension registered in GA4
  (Admin → Custom definitions → Create custom dimension, event-scoped,
  parameter `placement`). The funnel events are already sent by `lib/analytics.ts`.
- To automate weekly, wrap this in a cron / GitHub Action and commit the
  generated `reports/hotel-funnel-latest.md`, or pipe it to email/Slack.
