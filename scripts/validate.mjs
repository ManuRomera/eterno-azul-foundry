import fs from 'node:fs/promises';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';import Handlebars from 'handlebars';
const manifest=JSON.parse(await fs.readFile('system.json'));const pkg=JSON.parse(await fs.readFile('package.json'));
assert.equal(manifest.id,'eterno-azul');assert.equal(manifest.version,pkg.version);assert.equal(manifest.download,`https://github.com/ManuRomera/eterno-azul-foundry/releases/download/v${manifest.version}/eterno-azul.zip`);
const tag=process.env.RELEASE_TAG;if(tag)assert.equal(tag,`v${manifest.version}`);
async function walk(dir){const out=[];for(const f of await fs.readdir(dir,{withFileTypes:true})){const p=dir+'/'+f.name;if(f.isDirectory())out.push(...await walk(p));else out.push(p);}return out;}
for(const path of [...manifest.esmodules,...manifest.styles,...manifest.languages.map(l=>l.path)])await fs.access(path);
for(const p of await walk('module'))if(p.endsWith('.mjs'))execFileSync(process.execPath,['--check',p]);
for(const p of await walk('templates'))Handlebars.precompile(await fs.readFile(p,'utf8'));
for(const p of await walk('lang'))JSON.parse(await fs.readFile(p));
for(const p of await walk('_data')){const rows=JSON.parse(await fs.readFile(p));assert.equal(new Set(rows.map(r=>r._id)).size,rows.length);for(const row of rows)assert.match(row._id,/^[a-zA-Z0-9]{16}$/);}
console.log('Manifest, versiones, módulos, plantillas e IDs válidos');
