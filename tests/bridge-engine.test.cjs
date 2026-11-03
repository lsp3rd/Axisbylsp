'use strict';
const test=require('node:test'), assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const E=require('../bridge-engine.js');
const root=path.resolve(__dirname,'..');
test('both directions use the same staged funding protocol',()=>{
  for(const [direction,source,target] of [
    ['CRYPTO_TO_STOCK','BTC','CORZ'],
    ['STOCK_TO_CRYPTO','CORZ','BTC']]){
    let s=E.create(direction,source,target,1000);
    assert.equal(s.state,'REVIEW');
    assert.equal(s.availableUSD,0);
    assert.equal(s.net,995);
    assert.equal(s.sourceFee,5);
    assert.throws(()=>E.transition(s,'DESTINATION_FILL'));
    s=E.transition(s,'SOURCE_FILL');
    assert.equal(s.state,'SOURCE_FILLED');
    assert.equal(s.availableUSD,0,'sale proceeds must not become buying power automatically');
    assert.throws(()=>E.transition(s,'DESTINATION_FILL'));
    s=E.transition(s,'VERIFY_FUNDS');
    assert.equal(s.availableUSD,995);
    s=E.transition(s,'DESTINATION_FILL');
    assert.equal(s.state,'COMPLETED');
    assert.equal(s.availableUSD,0);
    assert.equal(s.purchasedUSD,990.02);
    assert.equal(s.receiptLog.length,4);
    assert.throws(()=>E.transition(s,'DESTINATION_FILL'));
  }
});
test('a rejected destination preserves cash and never claims success',()=>{
  let s=E.create('STOCK_TO_CRYPTO','CORZ','SOL',300);
  s=E.transition(E.transition(s,'SOURCE_FILL'),'VERIFY_FUNDS');
  const net=s.net;
  s=E.transition(s,'DESTINATION_REJECT');
  assert.equal(s.state,'DESTINATION_REJECTED');
  assert.equal(s.availableUSD,net);
  assert.equal(s.purchasedUSD,0);
  assert.throws(()=>E.transition(s,'DESTINATION_FILL'));
});
test('evidence conflict keeps the bridge on HOLD',()=>{
  const s=E.transition(E.create('CRYPTO_TO_STOCK','ETH','NVDA',500),'EVIDENCE_CONFLICT');
  assert.equal(s.state,'HOLD');
  assert.throws(()=>E.transition(s,'SOURCE_FILL'));
});
test('invalid amounts, identical or malformed assets and direction are refused',()=>{
  for(const a of [0,-1,1e9,NaN,Infinity,'not a number'])assert.throws(()=>E.create('CRYPTO_TO_STOCK','BTC','CORZ',a));
  assert.throws(()=>E.create('CRYPTO_TO_STOCK','BTC','BTC',100));
  assert.throws(()=>E.create('CRYPTO_TO_STOCK','<script>','CORZ',100));
  assert.throws(()=>E.create('CRYPTO_TO_STOCK','BTC',';',100));
  assert.throws(()=>E.create('OTHER','BTC','CORZ',100));
});
test('representative dollar values round safely, with no negative buying power',()=>{
  for(const n of [1,2.49,10,99.99,1000,1000000]){
    let s=E.create('CRYPTO_TO_STOCK','BTC','SPY',n);
    s=E.transition(E.transition(E.transition(s,'SOURCE_FILL'),'VERIFY_FUNDS'),'DESTINATION_FILL');
    assert.ok(s.purchasedUSD>=0);
    assert.ok(s.purchasedUSD<=n);
    assert.ok(Number.isFinite(s.purchasedUSD));
  }
});
test('public static pages are local-only and referenced assets exist',()=>{
  const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const bridge=fs.readFileSync(path.join(root,'wealth-bridge.html'),'utf8');
  assert.match(index,/wealth-bridge\.html/);
  assert.match(index,/story\.html/);
  assert.match(bridge,/NO REAL FUNDS/);
  assert.match(bridge,/connect-src 'none'/);
  for(const file of ['index.html','ui.js','data.js','cases.json','receipts.json','tracer-lab.html','scam-shield.html','story.html','wealth-bridge.html','bridge-engine.js','bridge-ui.js']) {
    assert.ok(fs.statSync(path.join(root,file)).size>0,'missing '+file);
  }
  for(const f of ['bridge-engine.js','bridge-ui.js']){
    const src=fs.readFileSync(path.join(root,f),'utf8');
    assert.doesNotMatch(src,/\bfetch\s*\(|\bXMLHttpRequest\b|\bWebSocket\b/);
  }
});
