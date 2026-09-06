import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import Handlebars from 'handlebars';
async function files(dir){const out=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=`${dir}/${e.name}`;out.push(...e.isDirectory()?await files(p):[p]);}return out;}
test('All actor compositions resolve partials for each type, tab and privacy state',async()=>{
 const h=Handlebars.create();
 for(const p of await files('templates'))h.registerPartial(`systems/eterno-azul/${p}`,await fs.readFile(p,'utf8'));
 for(const type of ['buscador','pnj','surcazul']) {
  const render=h.compile(await fs.readFile(`templates/actors/${type}/body.hbs`,'utf8'));
  for(const tab of ['play','inventory','notes'])for(const limited of [false,true]) {
   const html=render({isPC:type==='buscador',isNPC:type==='pnj',isShip:type==='surcazul',[tab]:true,limited,system:{crew:[],heart:{},naval:{},kit:{}},actions:[{key:'navegar',label:'Navegar',die:8}]});
   assert.ok(html.includes('ea-body'));
   if(limited)assert.ok(!html.includes('data-action="damage"'));
   if(tab==='play'&&!limited)assert.equal(html.includes('data-action="roll"'),type==='buscador');
  }
 }
});
test('Rules never import Foundry compatibility or access Foundry globals',async()=>{
 for(const p of await files('module/rules'))assert.doesNotMatch(await fs.readFile(p,'utf8'),/\b(game|foundry|CONFIG|Hooks)\s*\.|compat\//);
});
