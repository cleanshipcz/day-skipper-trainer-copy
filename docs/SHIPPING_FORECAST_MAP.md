# Shipping Forecast area map

## Authority and provenance

The canonical names, count and reference layout come from the Met Office [Guide to marine forecasts](https://weather.metoffice.gov.uk/guides/coast-and-sea), its linked `sea-areas-map` raster (600×739 px), and the current [Shipping Forecast](https://weather.metoffice.gov.uk/specialist-forecasts/coast-and-sea/shipping-forecast). They were checked on 2026-08-10. The current canonical spelling is **Southeast Iceland**.

The Met Office page does not publish machine-readable sea-area polygons. `src/data/forecastAreas.ts` is therefore a project-native, hand-traced SVG teaching approximation of the straight divisions visible in that official raster. It is not navigation data and must not be treated as legal or survey-grade boundary coordinates. Coastlines are original simplified orientation drawings, not copied cartographic artwork.

## Update process

1. Open the current Met Office guide and live forecast; confirm the count and exact capitalization of every area.
2. Download the guide's linked `sea-areas-map` image and record its pixel dimensions and review date in `SHIPPING_FORECAST_MAP_SOURCE`.
3. Overlay the project SVG at the same aspect ratio. Re-trace changed vertices in the explicit `polygon` strings; do not infer offshore limits from place names.
4. Check every label remains inside its polygon and that the simplified coastlines do not hide selectable water.
5. Update each symmetric neighbour relationship, then run the weather integration and map interaction tests at narrow and desktop widths.
6. If the Met Office publishes authoritative vector/GIS geometry, replace this trace and retain source/version metadata here.
