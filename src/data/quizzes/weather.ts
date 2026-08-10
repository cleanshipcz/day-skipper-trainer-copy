import type { Question } from "./types";

const weatherQuestions: readonly Question[] = [
  ["weather-1", "What do closely spaced isobars usually indicate?", ["Light winds", "Strong winds", "Fog only", "No pressure change"], 1, "A steep pressure gradient generally produces stronger wind."],
  ["weather-2", "In the Northern Hemisphere, wind around a surface low flows mainly:", ["Clockwise", "Anticlockwise", "Due north", "Parallel to latitude"], 1, "Wind circulates anticlockwise and slightly inward around a low."],
  ["weather-3", "With your back to the true wind, Buys Ballot's law places low pressure roughly:", ["To your left", "To your right", "Ahead", "Behind"], 0, "In the Northern Hemisphere, low pressure is roughly on your left."],
  ["weather-4", "A red line with semicircles marks:", ["Cold front", "Warm front", "Occlusion", "Trough"], 1, "Red semicircles are the standard warm-front symbol."],
  ["weather-5", "A cold-front passage often brings:", ["Steady drizzle only", "Squalls, showers and a wind shift", "No cloud", "Days of calm"], 1, "Cold fronts commonly bring a short active band followed by showers and clearer air."],
  ["weather-6", "An occlusion forms when:", ["A high splits", "A cold front catches a warm front", "Isobars vanish", "Sea breeze reverses"], 1, "The faster cold front overtakes the warm front."],
  ["weather-7", "Which Beaufort force is 11–16 knots?", ["2", "3", "4", "6"], 2, "Force 4 is a moderate breeze of 11–16 knots."],
  ["weather-8", "Frequent white horses and small waves becoming longer indicate approximately:", ["Force 0", "Force 2", "Force 4", "Force 9"], 2, "These are classic Force 4 observations."],
  ["weather-9", "At Beaufort Force 6, wind speed is:", ["7–10 kt", "17–21 kt", "22–27 kt", "34–40 kt"], 2, "Force 6 is 22–27 knots."],
  ["weather-10", "The Beaufort scale relates wind force primarily to:", ["Air temperature", "Observed effects on sea/land", "Barometer type", "Tidal range"], 1, "It is an empirical scale based on observed wind effects."],
  ["weather-11", "Which UK service issues the authoritative Shipping Forecast?", ["Met Office", "Harbour café", "Any chartplotter", "Marina fuel berth"], 0, "The UK Met Office produces the Shipping Forecast."],
  ["weather-12", "NAVTEX English-language safety broadcasts normally use:", ["156.8 MHz", "518 kHz", "2 MHz FM", "Channel 16 only"], 1, "International English NAVTEX broadcasts use 518 kHz."],
  ["weather-13", "In a forecast, wind 'veering' means changing:", ["Clockwise", "Anticlockwise", "Only stronger", "Only weaker"], 0, "Veering is a clockwise directional change."],
  ["weather-14", "A Shipping Forecast area section normally includes:", ["Wind, weather and visibility", "Tide tables only", "Marina prices", "Crew notices"], 0, "Area forecasts cover wind, weather, visibility and sometimes pressure tendency."],
  ["weather-15", "Why cross-check a visual model app against an official marine forecast?", ["Apps never show wind", "Model output has uncertainty and may omit warnings", "Official forecasts lack areas", "It changes tide"], 1, "Official products add forecaster judgement and warnings."],
  ["weather-16", "Advection fog forms when:", ["Cold dry air crosses warm land", "Warm moist air passes over colder water", "Rain freezes", "Pressure rises quickly"], 1, "Cooling moist air to its dew point over cold water produces advection fog."],
  ["weather-17", "Meteorological 'fog' means visibility below:", ["10 NM", "5 NM", "2 NM", "1,000 m"], 3, "Fog is visibility below 1,000 metres."],
  ["weather-18", "Your first response to unexpectedly dense fog should include:", ["Increase speed", "Safe speed and a dedicated lookout", "Turn lights off", "Rely on AIS alone"], 1, "Slow down, post a lookout and establish position and traffic awareness."],
  ["weather-19", "A power-driven vessel making way in restricted visibility sounds:", ["One prolonged blast at intervals up to two minutes", "Two short every minute", "Five short continuously", "No signal"], 0, "Rule 35 prescribes one prolonged blast at no more than two-minute intervals."],
  ["weather-20", "In a UK marine forecast, visibility of exactly 1,000 metres is:", ["Very poor", "Poor", "Moderate", "Good"], 1, "Poor begins at 1,000 metres; very poor is strictly below 1,000 metres. Meteorological fog is likewise defined by visibility below 1,000 metres."],
] .map(([id, question, options, correctAnswer, explanation]) => ({ id, question, options, correctAnswer, explanation } as Question));

export default weatherQuestions;
