-- Keep traceability true when parent records are edited after allocation.
create function guard_harvest_update() returns trigger language plpgsql as $$
begin
 if new.kg<(select coalesce(sum(kg),0) from batch_inputs where harvest_id=old.id) then raise exception 'Harvest kilograms below allocated inputs'; end if;
 if exists(select 1 from batch_inputs i join batches b on b.id=i.batch_id where i.harvest_id=old.id and b.extracted_on<new.harvested_on) then raise exception 'Harvest date follows existing extraction'; end if;
 return new;
end $$;
create trigger harvest_update_guard before update on harvests for each row execute function guard_harvest_update();
create function guard_batch_update() returns trigger language plpgsql as $$
begin
 if exists(select 1 from batch_inputs i join harvests h on h.id=i.harvest_id where i.batch_id=old.id and h.harvested_on>new.extracted_on) then raise exception 'Extraction precedes existing harvest'; end if;
 return new;
end $$;
create trigger batch_update_guard before update on batches for each row execute function guard_batch_update();
alter table inspections add constraint notification_after_inspection check(notified_on is null or notified_on>=inspected_on);
create unique index landowners_code_lower on landowners(lower(code));
create unique index sites_code_lower on sites(lower(code));
create index status_site_date on statuses(site_id,recorded_on desc);
create index jobs_site_due on jobs(site_id,due_on);
create index harvest_site on harvests(site_id);
create index treatment_site on treatments(site_id);
create index inspection_site on inspections(site_id);
create or replace view site_performance as select s.code,s.name,
 coalesce((select sum(kg) from harvests where site_id=s.id),0) as harvested_kg,
 coalesce((select sum(cost_cents) from jobs where site_id=s.id),0)+coalesce((select sum(cost_cents) from treatments where site_id=s.id),0)+coalesce((select sum(cost_cents) from consumables where site_id=s.id),0) as recorded_cost_cents,
 (select count(*) from jobs where site_id=s.id and completed_on is null and due_on<current_date) as overdue_jobs,
 (select count(*) from harvest_trace ht join harvests h on h.id=ht.id where h.site_id=s.id and ht.record_check='Evidence missing') as harvest_gaps
from sites s;
