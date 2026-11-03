'use strict';
(()=>{
  const Engine=window.AXISBridgeEngine;
  const el=id=>document.getElementById(id);
  if(!Engine || !el('review')){document.body.textContent='BRIDGE DEMO UNAVAILABLE — SAFE HOLD';return;}
  const money=n=>'$'+Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  let session=null;
  function show(){
    el('state').textContent=session?session.state:'No ticket reviewed';
    el('gross').textContent=session?money(session.gross):'—';
    el('sourceFee').textContent=session?money(session.sourceFee):'—';
    el('available').textContent=session?money(session.availableUSD):'—';
    el('destinationFee').textContent=session?money(session.destinationFee):'—';
    el('purchased').textContent=session?money(session.purchasedUSD):'—';
    const state=session&&session.state;
    el('sell').disabled=state!=='REVIEW';
    el('funds').disabled=state!=='SOURCE_FILLED';
    el('buy').disabled=state!=='FUNDS_AVAILABLE';
    el('reject').disabled=state!=='FUNDS_AVAILABLE';
    const log=el('log');log.replaceChildren();
    (session?session.receiptLog:[{note:'Waiting for a reviewed ticket.'}]).forEach(r=>{
      const li=document.createElement('li');li.textContent=r.note;log.append(li);
    });
  }
  function safe(action){
    try {action();show();}
    catch(error){el('state').textContent='HOLD — '+error.message;}
  }
  el('direction').addEventListener('change',()=>{
    const isCrypto=el('direction').value==='CRYPTO_TO_STOCK';
    el('from').value=isCrypto?'BTC':'CORZ';
    el('to').value=isCrypto?'CORZ':'BTC';
    session=null;show();
  });
  el('review').addEventListener('click',()=>{
    safe(()=>{session=Engine.create(el('direction').value,el('from').value,el('to').value,el('amount').value);});
  });
  [['sell','SOURCE_FILL'],['funds','VERIFY_FUNDS'],['buy','DESTINATION_FILL'],['reject','DESTINATION_REJECT']].forEach(([id,eventType])=>{
    el(id).addEventListener('click',()=>safe(()=>{session=Engine.transition(session,eventType);}));
  });
  el('reset').addEventListener('click',()=>{session=null;show();});
  const status=el('marketStatus'),explain=el('explain');
  const signals={
    bull:['Synthetic bullish pressure','BULLISH CANDIDATE','Illustrative rising short-term trend and stronger volume. Needs independent confirmation and held-out calibration. No guarantee of continued gains.'],
    bear:['Synthetic bearish pressure','BEARISH CANDIDATE','Illustrative falling trend and increasing volatility. Loss may already have occurred; no alert can guarantee protection.'],
    unknown:['Data stale or contradictory','UNKNOWN → HOLD','Provider feed is stale or evidence conflicts. Do not generate a directional call or actionable trade recommendation.']
  };
  Object.entries(signals).forEach(([id,entry])=>el(id).addEventListener('click',()=>{
    status.replaceChildren();
    const span=document.createElement('span');span.textContent=entry[0];
    const strong=document.createElement('strong');strong.textContent=entry[1];
    status.append(span,strong);explain.textContent=entry[2];
  }));
  show();
})();
