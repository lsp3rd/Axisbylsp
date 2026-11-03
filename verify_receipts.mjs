import fs from 'node:fs';import crypto from 'node:crypto';import path from 'node:path';
const here=path.dirname(new URL(import.meta.url).pathname);
const j=JSON.parse(fs.readFileSync(path.join(here,'receipts.json'),'utf8'));
const d=JSON.parse(fs.readFileSync(path.join(here,'cases.json'),'utf8'));
function validate(list,root){
 let prev='0'.repeat(64),seq=1;
 const pub=crypto.createPublicKey(j.public_key_pem);
 for(const {body,hash,signature} of list){
  if(body.sequence!==seq++)return false;
  if(body.prev_hash!==prev)return false;
  if(body.source!=='AXIS_PUBLIC_SYNTHETIC_FIXTURE')return false;
  const h=crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex');
  if(h!==hash)return false;
  if(!crypto.verify(null,Buffer.from(h,'hex'),pub,Buffer.from(signature,'base64')))return false;
  prev=hash;
 }
 return prev===root;
}
if(!validate(j.records,j.root))throw Error('SYNTHETIC_LEDGER_INVALID');
if(d.receipt_root!==j.root||d.receipt_count!==j.records.length)throw Error('RECEIPT_COUNT_OR_ROOT');
if(d.cases.length!==20||d.capabilities.length!==21)throw Error('EXPECTED_DEMO_COVERAGE_NOT_PRESENT');
if(d.mode!=='OFFLINE_ONLY'||d.external_model!=='NOT_CALLED'||d.authority!=='NONE')throw Error('INVALID_RUNTIME_CLAIM');
const seen=new Set();
for(const c of d.cases){
 if(seen.has(c.id))throw Error('DUPLICATE_CASE');
 seen.add(c.id);
 if(c.proof!=='SYNTHETIC_FIXTURE')throw Error('UNSUPPORTED_PROOF');
 if(!['HOLD','DENY_SIM','REVIEW','NO_ALERT','LOCAL_QUEUED','DISPLAY_ONLY'].includes(c.decision))throw Error('UNSAFE_DECISION');
}
const damaged=structuredClone(j.records);damaged[2].body.decision='DISPLAY_ONLY';
if(validate(damaged,j.root))throw Error('TAMPER_DETECTION_FAILED');
const forged=structuredClone(j.records);forged[1].signature=j.records[0].signature;
if(validate(forged,j.root))throw Error('FORGED_SIGNER_DETECTION_FAILED');
const replay=structuredClone(j.records);replay[6].body.sequence=1;
if(validate(replay,j.root))throw Error('REPLAY_DETECTION_FAILED');
const html=fs.readFileSync(path.join(here,'index.html'),'utf8');
if(!html.includes("connect-src 'none'"))throw Error('NO_EGRESS_POLICY_MISSING');
for(const f of ['data.js','ui.js','ghostgrid-v10.html','ghostgrid-v8.html']){
 if(!fs.existsSync(path.join(here,f)))throw Error('MISSING_DEMO_ASSET_'+f);
}
console.log('AXIS_HACKATHON_OFFLINE_INTEGRITY=PASS');
console.log('FIXTURE_CASES='+d.cases.length);
console.log('ED25519_SOFTWARE_RECEIPTS='+j.records.length);
console.log('NEGATIVE_TAMPER_FORGERY_REPLAY=3/3_PASS');
console.log('PUBLIC_WORKSTREAMS='+d.capabilities.length);
console.log('META_CALLS=0 NETWORK_CALLS=0 PRODUCTION_ACTIONS=0');
