-- Supabase SQL Editor, after creating the development project.
-- Private bucket; anonymous clients cannot list/download drafts or mint uploads.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('drfc-media','drfc-media',false,52428800,array['video/mp4','image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=false,file_size_limit=52428800,allowed_mime_types=excluded.allowed_mime_types;
-- Do NOT add anonymous insert/select policies. Server grants signed upload/read URLs.


