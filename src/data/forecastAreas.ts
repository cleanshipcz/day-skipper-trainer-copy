export interface ForecastArea {
  name: string;
  x: number;
  y: number;
  description: string;
}

export const forecastAreas: readonly ForecastArea[] = [
  { name: "Viking", x: 67, y: 12, description: "Northern North Sea, east of Shetland" },
  { name: "Forties", x: 64, y: 27, description: "North Sea east of Scotland" },
  { name: "Fisher", x: 76, y: 35, description: "Central North Sea" },
  { name: "Dogger", x: 67, y: 47, description: "North Sea east of northern England" },
  { name: "Humber", x: 63, y: 58, description: "North Sea east of Yorkshire and Lincolnshire" },
  { name: "Thames", x: 69, y: 72, description: "Southern North Sea and Thames approaches" },
  { name: "Dover", x: 62, y: 82, description: "Dover Strait" },
  { name: "Wight", x: 49, y: 82, description: "English Channel south of the Isle of Wight" },
  { name: "Portland", x: 39, y: 82, description: "English Channel south of Dorset" },
  { name: "Plymouth", x: 28, y: 82, description: "Western English Channel" },
  { name: "Biscay", x: 24, y: 94, description: "Bay of Biscay" },
  { name: "Trafalgar", x: 8, y: 91, description: "Atlantic west of Iberia" },
  { name: "FitzRoy", x: 13, y: 76, description: "Atlantic west of Biscay" },
  { name: "Sole", x: 20, y: 65, description: "Atlantic south-west approaches" },
  { name: "Lundy", x: 33, y: 68, description: "Bristol Channel approaches" },
  { name: "Fastnet", x: 20, y: 56, description: "South of Ireland" },
  { name: "Irish Sea", x: 35, y: 53, description: "Between Ireland and Great Britain" },
  { name: "Shannon", x: 12, y: 48, description: "Atlantic west of Ireland" },
  { name: "Rockall", x: 12, y: 31, description: "Atlantic west of Scotland" },
  { name: "Malin", x: 31, y: 35, description: "North of Ireland and west of Scotland" },
  { name: "Hebrides", x: 31, y: 22, description: "Atlantic west of the Hebrides" },
  { name: "Bailey", x: 18, y: 15, description: "Atlantic north-west of Scotland" },
  { name: "Fair Isle", x: 47, y: 19, description: "Between Orkney and Shetland" },
  { name: "Faeroes", x: 43, y: 7, description: "Around the Faroe Islands" },
  { name: "South-east Iceland", x: 20, y: 4, description: "Waters south-east of Iceland" },
];
