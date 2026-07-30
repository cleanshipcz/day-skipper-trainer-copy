import type { Question } from "./types";
const q=(id:string,question:string,options:string[],correctAnswer:number,explanation:string):Question=>({id:`passage-${id}`,question,options,correctAnswer,explanation});
export default [
q("1","What is the first P in PREPARE?",["Passage appraisal","Pilot book","Position fix","Port entry"],0,"Appraise the proposed passage before detailed planning."),
q("2","What does the A in PREPARE require?",["Acceleration","Alternatives","Anchoring only","Arrival"],1,"Identify refuges, abort points and fallback actions."),
q("3","When should a passage plan be revised?",["Never after writing","Only after arrival","When forecasts or circumstances change","Only by the owner"],2,"A plan must reflect the latest available information."),
q("4","A 24 nm leg at 6 knots takes:",["2 hours","4 hours","6 hours","8 hours"],1,"Time = distance ÷ speed."),
q("5","Four hours at 3 L/h uses:",["7 L","12 L","16 L","24 L"],1,"Fuel = time × consumption rate."),
q("6","A 20% reserve on 10 L gives a total of:",["10 L","11 L","12 L","20 L"],2,"10 × 1.2 = 12 litres."),
q("7","What is SOG?",["Sea orientation guide","Speed over ground","Safety operating grade","Stream offset gauge"],1,"SOG is actual speed relative to the seabed."),
q("8","A tidal gate is:",["A marina barrier","A time window for safe or favourable passage","A chart datum","A type of buoy"],1,"Tide can make a location unsafe or impractical outside its window."),
q("9","Why record leg ETAs?",["Decoration","To monitor progress and trigger decisions","To replace position fixing","To avoid forecasts"],1,"Comparing actual and planned progress exposes delay early."),
q("10","A waypoint should be:",["On a hazard","Unambiguous and safely navigable","Chosen only by distance","Kept from the crew"],1,"Waypoints need a safe, identifiable position."),
q("11","A weather window states:",["Paint drying time","Acceptable forecast conditions and timing","Only sunrise","Engine hours"],1,"It makes weather limits explicit."),
q("12","Why identify ports of refuge?",["For cheaper fuel only","To support a safe diversion","To avoid a passage log","To increase distance"],1,"Alternatives are essential when the original plan becomes unsafe."),
q("13","Which should be checked immediately before departure?",["Latest forecast","Last year's log","Only the chart scale","Nothing if planned yesterday"],0,"Conditions and forecasts can change quickly."),
q("14","Why test the VHF?",["To consume battery","To ensure communications are available","To receive music","To calibrate depth"],1,"VHF is vital for information and distress communications."),
q("15","Navigation lights should be checked:",["Only after dark","Before departure","Once per season only","Only offshore"],1,"They may be needed unexpectedly in darkness or poor visibility."),
q("16","What should a crew brief include?",["Roles and emergency actions","Only destination restaurants","Private chart notes","Nothing for experienced crew"],0,"A shared mental model makes routine and emergency actions safer."),
q("17","If actual progress is slower than planned, first:",["Ignore it","Recalculate ETAs and assess gates/alternatives","Increase chart distance","Switch off the log"],1,"Updated timing reveals whether the plan remains viable."),
q("18","A bearing to next waypoint is mainly used to:",["Estimate fuel price","Guide and monitor the leg","Measure air pressure","Select lifejackets"],1,"It gives the intended direction of travel."),
q("19","Which combination best supports a go/no-go decision?",["Weather, tide, crew and vessel","Fuel colour only","Destination name","Chart age alone"],0,"The whole operating context must be acceptable."),
q("20","Execution of a plan includes:",["No further decisions","Position checks, logging and adapting","Deleting alternatives","Ignoring trigger points"],1,"A passage plan is actively monitored, not merely filed."),
] satisfies readonly Question[];
