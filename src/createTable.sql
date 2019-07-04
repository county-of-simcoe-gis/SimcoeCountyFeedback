CREATE TABLE public.tbl_os_feedback
(
    yminimum double precision,
    ymaximum double precision,
    xminimum double precision,
    xmaximum double precision,
    scale double precision,
    rating double precision,
    for_business_use integer,
    email text COLLATE pg_catalog."default",
    comments text COLLATE pg_catalog."default",
    centery double precision,
    centerx double precision,
    date_created date,
    id uuid DEFAULT uuid_generate_v1(),
    other_uses text COLLATE pg_catalog."default",
    education boolean,
    recreation boolean,
    real_estate boolean,
    business boolean,
    delivery boolean,
    economic_development boolean
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public.tbl_os_feedback
    OWNER to postgres;