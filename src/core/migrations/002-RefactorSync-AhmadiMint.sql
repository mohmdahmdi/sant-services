-- Table: public.servicecategories

-- DROP TABLE IF EXISTS public.servicecategories;

CREATE TABLE IF NOT EXISTS public.servicecategories
(
    id character varying(100) COLLATE pg_catalog."default" NOT NULL DEFAULT gen_random_uuid(),
    name character varying(50) COLLATE pg_catalog."default",
    icon text COLLATE pg_catalog."default",
    CONSTRAINT servicecategories_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.servicecategories
    OWNER to postgres;