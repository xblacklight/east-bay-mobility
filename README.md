# East Bay Mobility

Practice website for a concept Oakland dispatch. It books wheelchair, companion, dialysis, and discharge rides across Alameda and Contra Costa the way a small desk actually can: door-through-door, quoted before the van leaves, same-day only where the board can keep the promise.

This is not a licensed carrier. The phone number uses the reserved 555 exchange. The email uses `.example`. The booking form stores a practice request in the browser and does not dispatch anything.

## Pages

- `index.html` — the desk, a sample board, and a sample quote
- `services.html` — five ride types and the jobs the desk refuses
- `coverage.html` — same-day core, day-ahead cities, cross-bay
- `facilities.html` — intake for discharge planners and clinics
- `book.html` — four-step practice request
- `about.html` — operating rules, and how this differs from East Bay Paratransit

## Preview

From this folder:

```bash
python3 -m http.server 8765
```

Open `http://127.0.0.1:8765`.

The Grok project linked with the build request is private, so the site is built from this repo’s brief and from how East Bay non-emergency transportation actually works: families and facilities are both customers, geography is the capacity limit, and clinical transport is a different job.
