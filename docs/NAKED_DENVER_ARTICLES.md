# Naked Denver Articles Layer

Put your article export in:

`/Users/shaquillecarter/Documents/Playground/src/data/nakedDenverArticles.json`

Expected JSON format:

```json
[
  {
    "id": "nd-upton-residences",
    "title": "Upton Residences Reimagining Skyline Living in Downtown Denver",
    "url": "https://www.nakeddenver.com/post/upton-residences-reimagining-skyline-living-in-downtown-denver",
    "publishedAt": "2025-10-08",
    "address": "1800 Welton Street, Denver, CO",
    "neighborhood": "Downtown",
    "lat": 39.7467,
    "lng": -104.9919,
    "summary": "461-home mixed-use residential development with street-level commercial space.",
    "developmentType": "Residential High-Rise",
    "tags": ["multifamily", "mixed-use", "downtown"]
  }
]
```

Required fields:

- `id`
- `title`
- `url`

Recommended fields:

- `publishedAt`
- `address`
- `neighborhood`
- `lat`
- `lng`
- `summary`
- `developmentType`
- `tags`

How the app uses it:

- Shows article points as a toggleable map layer when `lat` and `lng` are present
- Lets you click article points for quick article context
- Surfaces nearby article coverage in the selected parcel's `Activity` tab
- Sorts nearby articles by distance from the parcel

If an article has no coordinates yet, it can still live in the dataset as a staging record, but it will not appear on the map or in parcel proximity results until `lat` and `lng` are filled in.
