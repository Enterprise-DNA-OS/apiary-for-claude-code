#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { getDb, REPO_ROOT } from './lib/db.mjs';
import { parseCsv } from './lib/csv.mjs';
import { table } from './lib/format.mjs';
const entities=JSON.parse(fs.readFileSync(new URL('./entities.json',import.meta.url)));
export const reads={
 'sites':'select code,name,site_group,landowner,hives,supers,recorded_on from site_status order by name',
 'visit-round':'select * from visit_round',
 'attention':"select code,name,attention from visit_round where attention<>'Within visit interval' union all select code,site,attention from treatment_watch where attention<>'Review recorded clearance' union all select j.code,s.name,'Job overdue: '||j.name from jobs j join sites s on s.id=j.site_id where j.completed_on is null and j.due_on<current_date",
 'job-board':"select j.code,s.name as site,j.name as job,j.due_on,j.assigned_to,j.completed_on from jobs j join sites s on s.id=j.site_id order by j.due_on,j.code",
 'disease-watch':"select i.code,s.name as site,i.inspected_on,i.afb,i.hives_checked,i.notified_on,i.notification_ref,i.action_notes from inspections i join sites s on s.id=i.site_id order by i.inspected_on desc",
 'treatment-watch':'select * from treatment_watch order by code',
 'harvest-ready':"select s.code,s.name,(select count(*) from treatment_watch tw join treatments t on t.code=tw.code where t.site_id=s.id and tw.attention<>'Review recorded clearance') as treatment_reviews,(select count(*) from inspections i where i.site_id=s.id and i.afb<>'clear' and nullif(i.action_notes,'') is null) as unresolved_disease_records,case when s.registration is null then 'Registration missing' else 'Review history and destination requirements' end as review from sites s where s.active order by s.code",
 'harvest-trace':'select code,site,harvested_on,kg,allocated_kg,declaration_ref,record_check from harvest_trace order by code',
 'site-performance':'select * from site_performance order by code',
 'consumables':"select c.code,s.name as site,c.used_on,c.name,c.quantity,c.unit,c.cost_cents from consumables c join sites s on s.id=c.site_id order by used_on,code",
 'stock-review':'select code,name,hives,supers,strength,dead_hives,disease,queen_notes,recorded_on from site_status order by code',
 'agreements-due':"select a.code,s.name as site,a.name,a.ends_on,a.terms from agreements a join sites s on s.id=a.site_id where a.ends_on<=current_date+60 order by a.ends_on",
 'filings-due':"select code,name,kind,due_on,submitted_on,receipt_ref from filings where submitted_on is null or receipt_ref is null order by due_on",
 'compliance':'select * from compliance_findings order by rule,record',
 'landowners':'select code,name,contact,billing_address from landowners order by code',
};
const refTables={landowner_id:'landowners',site_id:'sites',batch_id:'batches',harvest_id:'harvests'};
function entity(name){if(!entities[name])throw Error(`Unknown entity ${name}. Choose ${Object.keys(entities).join(', ')}`);return entities[name];}
export async function resolve(db,name,value,exact=false){
 entity(name);const label=entities[name].name?'name':'code';
 let rows=await db.query(`select id,code,${label} as label from ${name} where lower(code)=lower($1) or id::text=$1`,[value]);
 if(!rows.length)rows=await db.query(`select id,code,${label} as label from ${name} where lower(${label})=lower($1) ${exact?'':"or starts_with(lower("+label+"),lower($1)) or starts_with(id::text,lower($1))"} order by code`,[value]);
 if(rows.length!==1)throw Error(rows.length?`Ambiguous ${name}: ${rows.map(r=>r.code+' '+r.label+' '+r.id).join('; ')}`:`No ${name} matches ${value}`);
 return rows[0].id;
}
function typed(k,v,spec){
 if(v===undefined||v===null)throw Error(`${k} is required`);
 if(v==='NULL'){if(spec.required)throw Error(`${k} is required`);return null;}
 if(spec.type==='integer'||spec.type==='numeric'){
  if(String(v).trim()===''||!Number.isFinite(Number(v))||(spec.type==='integer'&&!Number.isSafeInteger(Number(v))))throw Error(`Invalid number for ${k}`);
  return Number(v);
 }
 if(spec.type==='boolean'){if(!['true','false','yes','no','1','0'].includes(String(v).toLowerCase()))throw Error(`Invalid boolean for ${k}`);return ['true','yes','1'].includes(String(v).toLowerCase());}
 if(spec.type==='date'){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(Date.parse(v+'T00:00:00Z'))||new Date(v+'T00:00:00Z').toISOString().slice(0,10)!==v)throw Error(`Invalid date for ${k}: use YYYY-MM-DD`);
 }
 if(spec.required&&!String(v).trim())throw Error(`${k} is required`);
 return v;
}
export async function save(db,name,input,{update=false,exact=false}={}){
 const spec=entity(name),data={};
 for(const [k,v]of Object.entries(input)){
  if(!spec[k])throw Error(`Unknown ${name} field: ${k}`);
  data[k]=typed(k,v,spec[k]);
  if(data[k]!==null&&refTables[k])data[k]=await resolve(db,refTables[k],String(v),exact);
 }
 if(!update)for(const [k,s]of Object.entries(spec))if(s.required&&!(k in data))throw Error(`Missing ${name}.${k}`);
 const keys=Object.keys(data);if(!keys.length)throw Error('No fields supplied');
 if(update){
  const id=await resolve(db,name,update,exact);
  if(keys.includes('code'))throw Error('Record codes are stable; add a new record instead');
  return (await db.query(`update ${name} set ${keys.map((k,i)=>`${k}=$${i+1}`).join(',')} where id=$${keys.length+1} returning *`,[...Object.values(data),id]))[0];
 }
 return (await db.query(`insert into ${name} (${keys.join(',')}) values (${keys.map((_,i)=>'$'+(i+1)).join(',')}) returning *`,Object.values(data)))[0];
}
const aliases={
 landowners:{'landowner':'name','landowner name':'name','primary contact':'contact','billing address':'billing_address','landowner id':'code'},
 sites:{'site':'name','site name':'name','site id':'code','site group':'site_group','site type':'site_type','apiary registration':'registration','landowner':'landowner_id','landowner name':'landowner_id','address':'location','active':'active'},
 statuses:{'site':'site_id','site name':'site_id','site id':'site_id','date':'recorded_on','hive count':'hives','hives':'hives','number of hives':'hives','supers':'supers','hive strength':'strength','dead hives':'dead_hives','diseases':'disease','queen notes':'queen_notes'},
};
export async function importCsv(db,opts){
 const supplied=Object.keys(entities).filter(n=>opts[n]);
 if(!supplied.length)throw Error('Supply --landowners, --sites or --statuses CSV files; see docs/replace-myapiary.md');
 for(const k of Object.keys(opts))if(!entities[k]&&!['dry-run','json'].includes(k))throw Error(`Unknown import option ${k}`);
 const result={inserted:0,updated:0,files:supplied.length,dry_run:!!opts['dry-run']};
 await db.exec('BEGIN');
 try{
 for(const name of supplied){
  const rows=parseCsv(fs.readFileSync(path.resolve(opts[name]),'utf8'));
  if(!rows.length)throw Error(`${name} CSV has no data rows`);
  for(const row of rows){
   const data={};
   for(const [raw,v]of Object.entries(row)){
    const norm=raw.trim().toLowerCase(),k=aliases[name]?.[norm]||norm.replaceAll(' ','_');
    if(!entities[name][k])throw Error(`Unmapped ${name} column ${raw}; map it before import`);
    if(k in data)throw Error(`Multiple columns map to ${name}.${k}`);
    if(v!=='')data[k]=v;
   }
   if(!data.code){
    if(name==='landowners'||name==='sites')data.code='MYA-'+String(data.name||'').trim();
    else if(name==='statuses')data.code='MYA-'+data.site_id+'-'+data.recorded_on;
    else throw Error(`${name} requires a stable code`);
   }
   if(data.code==='MYA-')throw Error(`${name} requires a name or stable code`);
   const old=await db.query(`select id from ${name} where lower(code)=lower($1)`,[data.code]);
   if(old.length){const code=data.code;delete data.code;await save(db,name,data,{update:code,exact:true});result.updated++;}
   else{await save(db,name,data,{exact:true});result.inserted++;}
  }
 }
 await db.exec(opts['dry-run']?'ROLLBACK':'COMMIT');return result;
 }catch(e){await db.exec('ROLLBACK');throw e;}
}
export function parseArgs(args){const pos=[],opts={};for(const a of args){if(a.startsWith('--')){const i=a.indexOf('=');const k=a.slice(2,i<0?undefined:i);if(k in opts)throw Error(`Repeated flag ${k}`);opts[k]=i<0?true:a.slice(i+1);}else pos.push(a);}return{pos,opts};}
export function print(value,json=false){if(json)return JSON.stringify(value,null,2);if(Array.isArray(value))return table(value,value.length?Object.keys(value[0]).map(key=>({key,label:key})):[]);return JSON.stringify(value,null,2);}
export async function run(db,args){
 const {pos,opts}=parseArgs(args),[cmd='help',name,ref]=pos;
 if(cmd==='help'||cmd==='--help')return {reads:Object.keys(reads),writes:['add <entity> --field=value','set <entity> <code> --field=value','log <site> --code= --date= --note='],other:['site <name|code|id>','batch <code>','weekly-review','draft-landowner <site>','import myapiary --sites=file.csv --dry-run','export --out=exports/apiary.json'],entities};
 if(reads[cmd])return db.query(reads[cmd]);
 if(cmd==='weekly-review')return{visits:await db.query(reads['visit-round']),jobs:await db.query(reads['job-board']),checks:await db.query(reads.compliance)};
 if(cmd==='add'||cmd==='set'){const data={...opts};delete data.json;return save(db,name,data,{update:cmd==='set'?ref:false});}
 if(cmd==='log')return save(db,'notes',{code:opts.code,site_id:name,recorded_on:opts.date,note:opts.note});
 if(cmd==='import'){if(name!=='myapiary')throw Error('Supported import: myapiary');return importCsv(db,opts);}
 if(cmd==='site'){
  const id=await resolve(db,'sites',name),out={site:await db.query('select * from site_status where id=$1',[id])};
  for(const n of Object.keys(entities).filter(n=>entities[n].site_id))out[n]=await db.query(`select * from ${n} where site_id=$1 order by code`,[id]);return out;
 }
 if(cmd==='batch'){
  const id=await resolve(db,'batches',name);
  return db.query('select b.code as batch,b.extracted_on,b.drum_ref,h.code as harvest,s.name as site,s.registration,h.harvested_on,i.kg,h.declaration_ref,h.tutin_option,h.evidence_ref from batch_inputs i join batches b on b.id=i.batch_id join harvests h on h.id=i.harvest_id join sites s on s.id=h.site_id where b.id=$1 order by h.code',[id]);
 }
 if(cmd==='export'){
  const out={format:'apiary-records-v1',exported_at:new Date().toISOString(),entities:{}};
  for(const n of Object.keys(entities))out.entities[n]=await db.query(`select * from ${n} order by code`);
  if(opts.out){const dest=path.resolve(opts.out);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,JSON.stringify(out,null,2)+'\n');return {file:dest,entities:Object.keys(entities).length};}return out;
 }
 if(cmd==='draft-landowner'){
  const id=await resolve(db,'sites',name),[s]=await db.query('select * from site_status where id=$1',[id]);
  const jobs=await db.query('select name,due_on,completed_on from jobs where site_id=$1 order by due_on',[id]);
  const dir=path.join(process.env.OUTPUT_DIR||REPO_ROOT,'drafts');fs.mkdirSync(dir,{recursive:true});
  const file=path.join(dir,`landowner-${id}.md`);
  fs.writeFileSync(file,`# Draft for review: ${s.name}\n\nLandowner: ${s.landowner||'Not recorded'}\nLatest observation: ${s.recorded_on||'None'}; hives: ${s.hives??'Unknown'}.\n\n${print(jobs)}\n\nConfirm access and dates with the landowner. This file has not been sent.\n`);return {file};
 }
 throw Error(`Unknown command ${cmd}; run help`);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 let db;try{db=await getDb();console.log(print(await run(db,process.argv.slice(2)),process.argv.includes('--json')));}catch(e){console.error(e.message);process.exitCode=1;}finally{if(db)await db.close();}
}
