-- Apiary records. Current stock is an observed snapshot, never inferred from a harvest.
create function touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
create table landowners (id uuid primary key default gen_random_uuid(), code text not null unique, name text not null, contact text, billing_address text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger landowners_updated before update on landowners for each row execute function touch_updated_at();
create table sites (id uuid primary key default gen_random_uuid(), code text not null unique, name text not null, landowner_id uuid references landowners, site_group text, site_type text not null default 'honey', registration text, location text, active boolean not null default true, visit_days integer not null default 21 check(visit_days>0), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger sites_updated before update on sites for each row execute function touch_updated_at();
create table statuses (id uuid primary key default gen_random_uuid(), code text not null unique, site_id uuid not null references sites, recorded_on date not null, hives integer not null check(hives>=0), supers integer not null default 0 check(supers>=0), strength text, dead_hives integer not null default 0 check(dead_hives>=0), disease text, queen_notes text, notes text, unique(site_id,recorded_on), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger statuses_updated before update on statuses for each row execute function touch_updated_at();
create table jobs (id uuid primary key default gen_random_uuid(), code text not null unique, site_id uuid not null references sites, name text not null, due_on date not null, assigned_to text, completed_on date, labour_minutes integer not null default 0 check(labour_minutes>=0), cost_cents integer not null default 0 check(cost_cents>=0), notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger jobs_updated before update on jobs for each row execute function touch_updated_at();
create table inspections (id uuid primary key default gen_random_uuid(), code text not null unique, site_id uuid not null references sites, inspected_on date not null, inspector text not null, hives_checked integer not null check(hives_checked>0), afb text not null check(afb in ('clear','suspected','confirmed')), notified_on date, notification_ref text, action_notes text, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger inspections_updated before update on inspections for each row execute function touch_updated_at();
create table treatments (id uuid primary key default gen_random_uuid(), code text not null unique, site_id uuid not null references sites, applied_on date not null, product text not null, batch text, instructions text, removal_due date, removed_on date, harvest_clear_on date, cost_cents integer not null default 0 check(cost_cents>=0), check(removal_due is null or removal_due>=applied_on), check(removed_on is null or removed_on>=applied_on), check(harvest_clear_on is null or harvest_clear_on>=applied_on), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger treatments_updated before update on treatments for each row execute function touch_updated_at();
create table consumables (id uuid primary key default gen_random_uuid(), code text not null unique, site_id uuid not null references sites, used_on date not null, name text not null, quantity numeric(12,3) not null check(quantity>0), unit text not null, cost_cents integer not null default 0 check(cost_cents>=0), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger consumables_updated before update on consumables for each row execute function touch_updated_at();
create table harvests (id uuid primary key default gen_random_uuid(), code text not null unique, site_id uuid not null references sites, harvested_on date not null, boxes integer not null check(boxes>0), kg numeric(12,3) not null check(kg>0), crop text not null, declaration_ref text, tutin_option text, evidence_ref text, processor text, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger harvests_updated before update on harvests for each row execute function touch_updated_at();
create table batches (id uuid primary key default gen_random_uuid(), code text not null unique, name text not null, extracted_on date not null, drum_ref text, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger batches_updated before update on batches for each row execute function touch_updated_at();
create table batch_inputs (id uuid primary key default gen_random_uuid(), code text not null unique, batch_id uuid not null references batches, harvest_id uuid not null references harvests, kg numeric(12,3) not null check(kg>0), unique(batch_id,harvest_id), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger batch_inputs_updated before update on batch_inputs for each row execute function touch_updated_at();
create table agreements (id uuid primary key default gen_random_uuid(), code text not null unique, site_id uuid not null references sites, name text not null, starts_on date not null, ends_on date not null, terms text not null, check(ends_on>=starts_on), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger agreements_updated before update on agreements for each row execute function touch_updated_at();
create table filings (id uuid primary key default gen_random_uuid(), code text not null unique, name text not null, kind text not null check(kind in ('ADR','COI','registration','other')), due_on date not null, submitted_on date, receipt_ref text, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger filings_updated before update on filings for each row execute function touch_updated_at();
create table notes (id uuid primary key default gen_random_uuid(), code text not null unique, site_id uuid not null references sites, recorded_on date not null, note text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create trigger notes_updated before update on notes for each row execute function touch_updated_at();

create function validate_batch_input() returns trigger language plpgsql as $$
declare available numeric; used numeric; harvest_date date; extraction_date date;
begin
 select kg,harvested_on into available,harvest_date from harvests where id=new.harvest_id for update;
 select extracted_on into extraction_date from batches where id=new.batch_id;
 select coalesce(sum(kg),0) into used from batch_inputs where harvest_id=new.harvest_id and id<>new.id;
 if used+new.kg>available then raise exception 'Batch allocation exceeds harvested kilograms'; end if;
 if extraction_date<harvest_date then raise exception 'Extraction precedes harvest'; end if;
 return new;
end $$;
create trigger batch_input_guard before insert or update on batch_inputs for each row execute function validate_batch_input();
create view site_status as
select s.id,s.code,s.name,s.site_group,s.site_type,s.registration,s.active,l.name as landowner,
 x.recorded_on,x.hives,x.supers,x.strength,x.dead_hives,x.disease,x.queen_notes,
 current_date-x.recorded_on as days_since_visit,s.visit_days
from sites s left join landowners l on l.id=s.landowner_id
left join lateral(select * from statuses where site_id=s.id order by recorded_on desc limit 1)x on true;
create view visit_round as select code,name,site_group,hives,recorded_on,days_since_visit,
 case when recorded_on is null then 'No observation' when days_since_visit>visit_days then 'Visit overdue' else 'Within visit interval' end as attention
from site_status where active order by days_since_visit desc nulls first,name;
create view treatment_watch as select t.code,s.name as site,t.product,t.applied_on,t.removal_due,t.removed_on,t.harvest_clear_on,
 case when nullif(t.instructions,'') is null or nullif(t.batch,'') is null or t.harvest_clear_on is null then 'Instructions or clearance missing'
 when t.removal_due<current_date and t.removed_on is null then 'Removal overdue'
 when t.harvest_clear_on>current_date then 'Harvest hold' else 'Review recorded clearance' end as attention
from treatments t join sites s on s.id=t.site_id;
create view harvest_trace as select h.id,h.code,s.name as site,s.registration,h.harvested_on,h.crop,h.boxes,h.kg,
 coalesce((select sum(bi.kg) from batch_inputs bi where bi.harvest_id=h.id),0) as allocated_kg,
 h.declaration_ref,h.tutin_option,h.evidence_ref,h.processor,
 case when nullif(s.registration,'') is null or nullif(h.declaration_ref,'') is null or nullif(h.tutin_option,'') is null or nullif(h.evidence_ref,'') is null then 'Evidence missing' else 'Evidence recorded, review required' end as record_check
from harvests h join sites s on s.id=h.site_id;
create view site_performance as select s.code,s.name,
 coalesce((select sum(kg) from harvests where site_id=s.id),0) as harvested_kg,
 coalesce((select sum(cost_cents) from jobs where site_id=s.id),0)+coalesce((select sum(cost_cents) from treatments where site_id=s.id),0)+coalesce((select sum(cost_cents) from consumables where site_id=s.id),0) as recorded_cost_cents,
 (select count(*) from jobs where site_id=s.id and completed_on is null and due_on<current_date) as overdue_jobs,
 (select count(*) from harvest_trace where site=s.name and record_check='Evidence missing') as harvest_gaps
from sites s;
create view compliance_findings as
select 'REG' as rule,code as record,'Apiary registration missing' as finding,'https://afb.org.nz/beekeeping-and-the-law/' as source from sites where active and nullif(registration,'') is null
union all select 'AFB',code,case when inspected_on+7<current_date then 'AFB notification evidence overdue' else 'AFB notification needs attention now' end,'https://afb.org.nz/beekeeping-and-the-law/' from inspections where afb in ('suspected','confirmed') and (notified_on is null or nullif(notification_ref,'') is null)
union all select 'FILING',code,case when due_on<current_date then 'Filing evidence overdue' else 'Filing due within 30 days' end,'https://afb.org.nz/goal-of-the-afb-npmp/annual-disease-return/' from filings where (submitted_on is null or nullif(receipt_ref,'') is null) and due_on<=current_date+30
union all select 'TRACE',code,'Harvest declaration, site registration or tutin evidence missing','https://www.mpi.govt.nz/agriculture/beekeeping-loss-survey-tutin-contamination-regulations/beekeeper-requirements-honey-exports' from harvest_trace where record_check='Evidence missing'
union all select 'TREAT',code,attention,'https://www.mpi.govt.nz/dmsdocument/1021/direct' from treatment_watch where attention<>'Review recorded clearance';
