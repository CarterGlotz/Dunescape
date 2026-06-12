import React from "react";
import RunDebriefCard from "./RunDebriefCard.jsx";
import { getDailyRiteStatusContract } from "../game/dailyRiteStatusContract.js";

export default function DailyRiteStatus({
  dailyRun,
  dailyDebrief,
  playedDailyToday,
  onStart,
  onCopyShare,
  onDownloadScroll,
  onCopyChallenge,
  onCommitRouteChoice,
}) {
  const contract = getDailyRiteStatusContract({ dailyRun, playedDailyToday });
  if (!dailyRun) {
    return (
      <div>
        <button onClick={onStart} style={{width:"100%",background:"linear-gradient(180deg,#3a1808,#280e04)",border:"2px solid #c8a84e",color:"#da0",fontSize:10,padding:"8px 4px",cursor:"pointer",borderRadius:4,fontWeight:700,marginBottom:3,boxShadow:!playedDailyToday?"0 0 14px rgba(240,192,96,0.28)":"none",animation:!playedDailyToday?"pulse 1.5s ease-in-out infinite":"none"}}>☀️ {contract.headline}</button>
        <div style={{fontSize:7,color:"#555",textAlign:"center",lineHeight:1.4}}>{contract.progress_label}<br/>same dungeon for all players worldwide</div>
      </div>
    );
  }

  if (!dailyRun.done) {
    return (
      <div style={{background:"rgba(40,20,5,0.6)",border:"1px solid #5a3010",borderRadius:4,padding:"6px 4px",textAlign:"center"}}>
        <div style={{color:"#da0",fontSize:12,fontWeight:700}}>⚔️ {contract.headline}</div>
        <div style={{fontSize:8,color:"#888",marginTop:2}}>{contract.progress_label}</div>
        {contract.stake_label&&<div style={{fontSize:7,color:"#d8a86a",lineHeight:1.4,marginTop:4}}>Stake: {contract.stake_label} · {contract.risk_label}</div>}
        {contract.modifier_label&&<div style={{fontSize:7,color:"#9fc6a0",lineHeight:1.4,marginTop:3}}>{contract.modifier_label}</div>}
        {contract.latest_outcome&&<div style={{marginTop:5,padding:"5px 6px",background:"rgba(5,12,10,0.58)",border:"1px solid rgba(127,211,166,0.22)",borderRadius:4,textAlign:"left"}}>
          <div style={{fontSize:7,color:"#7fd3a6",fontWeight:800,marginBottom:2}}>Last clear · {contract.latest_outcome.segment_label}</div>
          <div style={{fontSize:7,color:"#d8c38a",lineHeight:1.35}}>{contract.latest_outcome.rewards.label||contract.latest_outcome.receipt}</div>
          {contract.latest_outcome.route_choice_adjustment&&<div style={{fontSize:7,color:"#c8a0ff",lineHeight:1.35,marginTop:2}}>Route tuned: {contract.latest_outcome.route_choice_adjustment.choice_label} · {contract.latest_outcome.route_choice_adjustment.posture}</div>}
          {contract.latest_outcome.shrine_bargain&&<div style={{fontSize:7,color:"#ffd28a",lineHeight:1.35,marginTop:2}}>Shrine bargain: {contract.latest_outcome.shrine_bargain.choice_label} · {contract.latest_outcome.shrine_bargain.economy?.summary||contract.latest_outcome.shrine_bargain.posture}</div>}
          {contract.latest_outcome.next_action&&<div style={{fontSize:7,color:"#8fb7d8",lineHeight:1.35,marginTop:2}}>🧭 {contract.latest_outcome.next_action}</div>}
        </div>}
        {contract.route_choice?.choices?.length>0&&<div style={{marginTop:5,padding:"5px 6px",background:"rgba(18,10,26,0.56)",border:"1px solid rgba(190,140,255,0.22)",borderRadius:4,textAlign:"left"}}>
          <div style={{fontSize:7,color:"#c8a0ff",fontWeight:800,marginBottom:2}}>{contract.route_choice.headline}</div>
          {contract.route_commitment&&<div style={{fontSize:7,color:"#7fd3a6",lineHeight:1.32,marginBottom:3}}>Committed: {contract.route_commitment.choice_label} · {contract.route_commitment.next_room_bias}</div>}
          {contract.route_choice.choices.slice(0,3).map(choice=><div key={choice.id} style={{fontSize:7,color:choice.id===contract.route_choice.recommended_choice_id?"#f0d8ff":"#9f8bb8",lineHeight:1.32,marginTop:2}}>
            {choice.id===contract.route_choice.recommended_choice_id?"◆ ":"◇ "}{choice.label} — {choice.payoff}
            {onCommitRouteChoice&&(!contract.route_commitment||contract.route_commitment.choice_id!==choice.id)&&<button onClick={()=>onCommitRouteChoice(choice.id)} style={{marginLeft:4,background:"rgba(40,18,52,0.78)",border:"1px solid rgba(200,160,255,0.35)",color:"#f0d8ff",fontSize:7,padding:"1px 4px",borderRadius:3,cursor:"pointer"}}>Commit</button>}
          </div>)}
        </div>}
        <div style={{height:4,background:"#120604",borderRadius:2,marginTop:4}}><div style={{height:"100%",background:"#c8a84e",borderRadius:2,width:((dailyRun.wave/30)*100)+"%"}}/></div>
      </div>
    );
  }

  return (
    <div style={{background:"rgba(40,20,5,0.6)",border:"1px solid rgba(200,168,78,0.2)",borderRadius:4,padding:6}}>
      <RunDebriefCard debrief={dailyDebrief} />
      <div style={{color:dailyRun.deathWave>=30?"#da0":"#f44",fontSize:11,fontWeight:700,textAlign:"center",marginBottom:4}}>
        {dailyRun.deathWave>=30?"🏆 "+contract.headline:"💀 "+contract.headline}
      </div>
      {contract.progress_label&&<div style={{fontSize:7,color:"#d8a86a",lineHeight:1.4,marginBottom:3,textAlign:"center"}}>☀️ {contract.progress_label}</div>}
      {contract.modifier_label&&<div style={{fontSize:7,color:"#9fc6a0",lineHeight:1.4,marginBottom:3,textAlign:"center"}}>{contract.modifier_label}</div>}
      {contract.latest_outcome&&<div style={{fontSize:7,color:"#d8c38a",lineHeight:1.4,marginBottom:3,textAlign:"center"}}>Last clear: {contract.latest_outcome.rewards.label||contract.latest_outcome.segment_label}</div>}
      {contract.latest_outcome?.route_choice_adjustment&&<div style={{fontSize:7,color:"#c8a0ff",lineHeight:1.4,marginBottom:3,textAlign:"center"}}>Route tuned: {contract.latest_outcome.route_choice_adjustment.choice_label} · {contract.latest_outcome.route_choice_adjustment.posture}</div>}
      {contract.latest_outcome?.shrine_bargain&&<div style={{fontSize:7,color:"#ffd28a",lineHeight:1.4,marginBottom:3,textAlign:"center"}}>Shrine bargain: {contract.latest_outcome.shrine_bargain.choice_label} · {contract.latest_outcome.shrine_bargain.economy?.summary||contract.latest_outcome.shrine_bargain.posture}</div>}
      {contract.route_choice?.choices?.length>0&&<div style={{fontSize:7,color:"#c8a0ff",lineHeight:1.4,marginBottom:3,textAlign:"center"}}>{contract.route_choice.headline}: {contract.route_choice.choices.find(choice=>choice.id===contract.route_choice.recommended_choice_id)?.label||contract.route_choice.choices[0].label}</div>}
      {contract.route_commitment&&<div style={{fontSize:7,color:"#7fd3a6",lineHeight:1.4,marginBottom:3,textAlign:"center"}}>Committed: {contract.route_commitment.choice_label} · {contract.route_commitment.posture}</div>}
      {dailyRun.vowResult&&<div style={{fontSize:7,color:dailyRun.vowResult.kept?"#e0b050":"#a06050",lineHeight:1.4,marginBottom:3,textAlign:"center"}}>{dailyRun.vowResult.kept?"⚜️":"🕯️"} {dailyRun.vowResult.debriefLine}</div>}
      {dailyRun.challengeResult&&<div style={{fontSize:7,color:dailyRun.challengeResult.beaten?"#6c4":"#c86",lineHeight:1.4,marginBottom:3,textAlign:"center"}}>🔥 {dailyRun.challengeResult.line}</div>}
      {dailyRun.pacingCoach&&<div style={{fontSize:7,color:"#7fd3a6",lineHeight:1.4,marginBottom:3,textAlign:"center"}}>🧭 {dailyRun.pacingCoach.next_action}</div>}
      {dailyRun.shareCard&&<>
        <pre style={{fontSize:7,color:"#8a7a5a",background:"rgba(0,0,0,0.4)",padding:4,borderRadius:3,marginBottom:4,whiteSpace:"pre-wrap",wordBreak:"break-word",fontFamily:"'Courier New',monospace"}}>{dailyRun.shareCard}</pre>
        <button onClick={onCopyShare} style={{width:"100%",background:"#1a3010",border:"1px solid #3a6020",color:"#4c0",fontSize:8,padding:"3px 0",cursor:"pointer",borderRadius:3,fontWeight:600}}>📋 Copy &amp; Share</button>
        <button onClick={onDownloadScroll} style={{width:"100%",background:"#101a20",border:"1px solid #206080",color:"#60c0f0",fontSize:8,padding:"3px 0",cursor:"pointer",borderRadius:3,fontWeight:600,marginTop:3}}>📸 Download Scroll</button>
        <button onClick={onCopyChallenge} style={{width:"100%",background:"#1c1208",border:"1px solid #c8642e",color:"#f0884e",fontSize:8,padding:"3px 0",cursor:"pointer",borderRadius:3,fontWeight:600,marginTop:3}}>🔗 Copy Challenge Link</button>
      </>}
    </div>
  );
}
