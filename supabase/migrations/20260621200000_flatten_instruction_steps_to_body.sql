-- Flatten instruction_steps into instructions.body JSON and drop the steps table.
--
-- New body format:
--   { "steps": [ { "id": "<uuid>", "text": "...", "imageUrl": "..." | null } ] }
--
-- Steps are ordered by their existing saved stepOrder (parsed from old body JSON),
-- falling back to created_at ASC for any steps not listed there.

do $$
declare
  r record;
  old_order text[];
  ordered_steps jsonb;
  step record;
  step_row jsonb;
begin
  for r in select id, body from public.instructions loop
    -- Parse existing stepOrder from body if present
    begin
      old_order := array(
        select jsonb_array_elements_text((r.body::jsonb) -> 'stepOrder')
      );
    exception when others then
      old_order := '{}';
    end;

    -- Build ordered steps array
    ordered_steps := '[]'::jsonb;

    -- First: steps in saved order
    for step in
      select s.id, s.text, s.image_url
      from public.instruction_steps s
      where s.instruction_id = r.id
        and s.id::text = any(old_order)
      order by array_position(old_order, s.id::text)
    loop
      step_row := jsonb_build_object(
        'id',       step.id,
        'text',     step.text,
        'imageUrl', step.image_url
      );
      ordered_steps := ordered_steps || jsonb_build_array(step_row);
    end loop;

    -- Then: any steps NOT in the saved order (created_at ASC)
    for step in
      select s.id, s.text, s.image_url
      from public.instruction_steps s
      where s.instruction_id = r.id
        and not (s.id::text = any(old_order))
      order by s.created_at asc
    loop
      step_row := jsonb_build_object(
        'id',       step.id,
        'text',     step.text,
        'imageUrl', step.image_url
      );
      ordered_steps := ordered_steps || jsonb_build_array(step_row);
    end loop;

    update public.instructions
    set body = jsonb_build_object('steps', ordered_steps)::text
    where id = r.id;
  end loop;
end;
$$;

drop table public.instruction_steps;
