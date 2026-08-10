export interface ForecastArea {
  name: string;
  label: readonly [number, number];
  polygon: string;
  description: string;
  neighbours: readonly string[];
}

export const SHIPPING_FORECAST_MAP_SOURCE = {
  guide: "https://weather.metoffice.gov.uk/guides/coast-and-sea",
  liveForecast: "https://weather.metoffice.gov.uk/specialist-forecasts/coast-and-sea/shipping-forecast",
  referenceImage: "https://www.metoffice.gov.uk/api/images/file/sea-areas-mapjpg.jpg?prefix=images",
  tracedReferenceSize: "600×739 pixels",
  checked: "2026-08-10",
} as const;

const area = (name: string, label: readonly [number, number], polygon: string, description: string, neighbours: readonly string[]): ForecastArea => ({ name, label, polygon, description, neighbours });

// Project-native SVG trace of the Met Office 600×739 sea-areas raster. Coordinates
// are deliberately explicit so a future source-map revision can be diffed and retraced.
export const forecastAreas: readonly ForecastArea[] = [
  area("Southeast Iceland", [285,118], "205,0 382,0 370,96 267,126 208,80", "Waters southeast of Iceland", ["Bailey", "Faeroes"]),
  area("Faeroes", [355,180], "267,126 370,96 421,166 350,216 299,198", "Waters around and east of the Faroe Islands", ["Southeast Iceland", "Bailey", "Hebrides", "Fair Isle"]),
  area("Bailey", [267,204], "208,80 267,126 299,198 276,267 211,248", "Atlantic waters northwest of Scotland", ["Southeast Iceland", "Faeroes", "Hebrides", "Rockall"]),
  area("Fair Isle", [388,234], "350,216 421,166 450,200 451,266 347,272", "Waters between Orkney and Shetland", ["Faeroes", "Hebrides", "Cromarty", "Viking"]),
  area("Viking", [470,224], "450,200 493,207 491,279 451,266", "Northern North Sea east of Shetland", ["Fair Isle", "North Utsire", "Forties"]),
  area("North Utsire", [523,229], "493,207 548,211 539,274 491,279", "Northern waters off western Norway", ["Viking", "South Utsire"]),
  area("South Utsire", [522,282], "491,279 539,274 538,337 490,337", "Southern waters off western Norway", ["North Utsire", "Viking", "Fisher"]),
  area("Hebrides", [304,257], "276,267 299,198 350,216 347,272 329,311 259,291", "Atlantic waters west of the Hebrides", ["Bailey", "Faeroes", "Fair Isle", "Cromarty", "Malin", "Rockall"]),
  area("Rockall", [224,285], "211,248 276,267 259,291 260,349 186,323", "Atlantic waters west of Scotland", ["Bailey", "Hebrides", "Malin", "Shannon"]),
  area("Cromarty", [376,287], "347,272 451,266 450,311 400,311 365,303 329,311", "Waters north and northeast of Scotland", ["Hebrides", "Fair Isle", "Forties", "Forth"]),
  area("Forties", [448,301], "451,266 491,279 490,337 450,337 450,311", "North Sea east of Scotland", ["Viking", "South Utsire", "Cromarty", "Fisher", "Forth"]),
  area("Malin", [301,317], "259,291 329,311 365,303 359,349 313,354 260,349", "Waters north of Ireland and west of Scotland", ["Hebrides", "Rockall", "Cromarty", "Forth", "Irish Sea", "Shannon"]),
  area("Forth", [387,332], "365,303 400,311 450,311 450,365 404,364 359,349", "Waters east of central Scotland", ["Cromarty", "Forties", "Malin", "Tyne"]),
  area("Fisher", [516,351], "490,337 538,337 545,407 490,406", "Central and eastern North Sea", ["South Utsire", "Forties", "Dogger", "German Bight"]),
  area("Tyne", [404,381], "359,349 404,364 450,365 452,411 417,421 375,405", "Waters east of northeast England", ["Forth", "Dogger", "Humber"]),
  area("Dogger", [459,384], "450,337 490,337 490,406 452,411 450,365", "North Sea east of northern England", ["Forties", "Fisher", "Tyne", "German Bight", "Humber"]),
  area("German Bight", [516,411], "490,406 545,407 548,472 489,465", "Southeastern North Sea off Germany and Denmark", ["Fisher", "Dogger", "Humber", "Thames"]),
  area("Shannon", [186,369], "186,323 260,349 260,412 158,400", "Atlantic waters west of Ireland", ["Rockall", "Malin", "Fastnet", "Sole"]),
  area("Irish Sea", [335,389], "313,354 359,349 375,405 359,437 321,431 302,393", "Waters between Ireland and Great Britain", ["Malin", "Tyne", "Lundy", "Fastnet"]),
  area("Humber", [442,432], "375,405 417,421 452,411 489,406 489,465 445,467 407,452", "North Sea east of Yorkshire and Lincolnshire", ["Tyne", "Dogger", "German Bight", "Thames"]),
  area("Fastnet", [278,447], "260,412 302,393 321,431 310,468 240,466", "Waters south of Ireland", ["Shannon", "Irish Sea", "Lundy", "Sole"]),
  area("Lundy", [346,451], "321,431 359,437 407,452 398,482 347,483 310,468", "Bristol Channel and its approaches", ["Irish Sea", "Fastnet", "Humber", "Plymouth"]),
  area("Thames", [458,471], "445,467 489,465 502,495 462,509 422,495 398,482 407,452", "Southern North Sea and Thames approaches", ["German Bight", "Humber", "Dover", "Wight"]),
  area("Dover", [439,505], "398,482 422,495 462,509 438,530 400,518", "Dover Strait", ["Thames", "Wight"]),
  area("Sole", [216,482], "158,400 260,412 240,466 289,492 276,535 127,507", "Atlantic waters southwest of Ireland", ["Shannon", "Fastnet", "Plymouth", "FitzRoy"]),
  area("Plymouth", [311,504], "240,466 310,468 347,483 344,520 319,535 276,535 289,492", "Western English Channel and southwest approaches", ["Sole", "Fastnet", "Lundy", "Portland", "FitzRoy"]),
  area("Portland", [363,513], "347,483 398,482 400,518 375,537 344,520", "English Channel south of Dorset", ["Plymouth", "Wight", "Lundy"]),
  area("Wight", [399,498], "398,482 422,495 400,518 375,537 375,513", "English Channel south of the Isle of Wight", ["Portland", "Dover", "Thames"]),
  area("FitzRoy", [174,574], "127,507 276,535 319,535 263,662 63,620", "Atlantic waters west of the Bay of Biscay", ["Sole", "Plymouth", "Biscay", "Trafalgar"]),
  area("Biscay", [306,588], "319,535 375,537 366,634 263,662", "Bay of Biscay", ["Plymouth", "FitzRoy", "Trafalgar"]),
  area("Trafalgar", [116,678], "63,620 263,662 246,739 0,694", "Atlantic waters west of Iberia", ["FitzRoy", "Biscay"]),
];
