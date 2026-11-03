const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = __dirname;
const source = fs.readFileSync(path.join(root,'site.js'),'utf8');
const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
for (const name of ['index.html','privacy.html']) {
  const page = fs.readFileSync(path.join(root,name),'utf8');
  assert.equal((page.match(/<h1(?:\s|>)/g)||[]).length,1,name+' has one h1');
  for (const match of page.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    const target = match[1];
    if (!/^(https?:|mailto:|\/)/.test(target)) assert.ok(fs.existsSync(path.join(root,target)), 'Missing asset '+target);
  }
}
const schema = JSON.parse(html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/)[1]);
assert.equal(schema['@type'],'VideoGame');
assert.equal(schema.url,'https://twisty-run.com/');
assert.equal((html.match(/data-store=/g)||[]).length,4);
assert.ok(!html.includes('<iframe'),'No third-party video request on page load');

function session(saved, search='') {
  const nodes = {};
  function element() {return {hidden:true,listeners:{},dataset:{},addEventListener(type,fn){this.listeners[type]=fn;},focus(){this.focused=true;}};}
  for(const id of ['analytics-consent','analytics-settings','analytics-allow','analytics-decline','video-launch','video-shell'])nodes[id]=element();
  nodes['video-shell'].replaceChildren=function(child){this.child=child;};
  const link=element(); link.dataset={store:'android',placement:'hero'};
  const scripts=[];
  const storage=new Map(saved ? [['twisty_website_analytics_v1',saved]] : []);
  const context={window:{},document:{title:'Twisty Race',referrer:'https://example.com/private?email=secret',cookie:'',getElementById:id=>nodes[id],querySelectorAll:()=>[link],createElement:()=>element(),head:{appendChild:el=>scripts.push(el)}},location:{pathname:'/',search,hostname:'twisty-run.com'},localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,val)=>storage.set(key,val)},URL,URLSearchParams,Date};
  // No real Google script loads in this isolated test environment.
  vm.runInNewContext(source.replace(/const MEASUREMENT_ID = '[^']*';/,"const MEASUREMENT_ID = 'G-TESTONLY';"),context);
  return {nodes,scripts,context,link,commands:()=>Array.from(context.window.dataLayer||[],x=>Array.from(x))};
}
const s=session();
assert.equal(s.scripts.length,0,'No Google tag before consent');
assert.equal(s.nodes['analytics-consent'].hidden,false);
s.link.listeners.click();
assert.equal(s.commands().length,0,'No pre-consent store events');
s.nodes['analytics-decline'].listeners.click();
assert.equal(s.scripts.length,0,'Declining never loads the tag');
s.nodes['analytics-settings'].listeners.click();
s.nodes['analytics-allow'].listeners.click();
assert.equal(s.scripts.length,1,'Allow loads exactly one tag');
const config=s.commands().find(x=>x[0]==='config')[2];
assert.equal(config.send_page_view,false);
assert.equal(config.allow_google_signals,false);
assert.equal(config.page_referrer,'https://example.com');
assert.equal(config.page_location,'https://twisty-run.com/');
assert.equal(s.commands().filter(x=>x[0]==='event'&&x[1]==='page_view').length,1);
s.link.listeners.click();
assert.equal(s.commands().at(-1)[1],'store_click');
assert.equal(s.commands().at(-1)[2].store,'android');
s.nodes['analytics-decline'].listeners.click();
const count=s.commands().length;
s.link.listeners.click();
assert.equal(s.commands().length,count,'Withdrawal stops further custom events');
assert.equal(s.context.window['ga-disable-G-TESTONLY'],true);
s.nodes['analytics-allow'].listeners.click();
assert.equal(s.scripts.length,1,'Regrant does not duplicate script');
assert.equal(s.commands().at(-1)[0],'consent');
assert.equal(s.commands().at(-1)[2].analytics_storage,'granted');
s.nodes['video-launch'].listeners.click({preventDefault(){}});
assert.match(s.nodes['video-shell'].child.src,/youtube-nocookie\.com/);
assert.equal(s.commands().at(-1)[1],'trailer_play');
const declined=session(JSON.stringify({choice:'declined',savedAt:Date.now()}));
assert.equal(declined.scripts.length,0,'Remembered refusal stays untracked');
const expired=session(JSON.stringify({choice:'allowed',savedAt:0}));
assert.equal(expired.scripts.length,0,'Expired permission asks again');
const campaign=session(null,'?utm_source=youtube&utm_campaign=jump_clip&email=secret');
campaign.nodes['analytics-allow'].listeners.click();
const campaignConfig=campaign.commands().find(x=>x[0]==='config')[2];
assert.equal(campaignConfig.campaign_name,'jump_clip');
assert.ok(!JSON.stringify(campaign.commands()).includes('secret'),'Query values stay out of telemetry');
console.log('PASS: local assets, metadata, store links, deferred video, consent, withdrawal/regrant, and campaign privacy checks.');
