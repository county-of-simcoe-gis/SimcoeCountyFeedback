CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.tbl_os_feedback (
	yminimum float8 NULL,
	ymaximum float8 NULL,
	xminimum float8 NULL,
	xmaximum float8 NULL,
	"scale" float8 NULL,
	rating float8 NULL,
	for_business_use int4 NULL,
	email text NULL,
	"comments" text NULL,
	centery float8 NULL,
	centerx float8 NULL,
	date_created date NULL,
	id uuid NULL DEFAULT uuid_generate_v1(),
	other_uses text NULL,
	education bool NULL,
	recreation bool NULL,
	real_estate bool NULL,
	business bool NULL,
	delivery bool NULL,
	economic_development bool NULL,
	report_problem bool NULL,
	my_maps_id varchar(50) NULL,
	feature_id varchar(50) NULL
);
