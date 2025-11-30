--
-- PostgreSQL database dump
--

\restrict EwZqeYZEYGAgv0ApLs7yWjEqt8FULe3KwEicZEb4eAncn8gpcLFcYc2qkbVQbC9

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2025-11-30 16:04:00

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 16431)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 5954 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 3 (class 3079 OID 16620)
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- TOC entry 5955 (class 0 OID 0)
-- Dependencies: 3
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 16468)
-- Name: appointments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_id uuid,
    beautician_id uuid,
    service_id uuid,
    scheduled_at timestamp without time zone,
    status character varying(20) DEFAULT 'pending'::character varying,
    payment_status character varying(20) DEFAULT 'unpaid'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.appointments OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16477)
-- Name: beauticians; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.beauticians (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    business_id uuid,
    bio text,
    experience_years integer,
    specialties text[],
    is_freelancer boolean DEFAULT false,
    rating numeric(2,1) DEFAULT 0.0
);


ALTER TABLE public.beauticians OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16485)
-- Name: business_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.business_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(50) NOT NULL,
    description text
);


ALTER TABLE public.business_types OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16491)
-- Name: businesses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.businesses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_id uuid NOT NULL,
    name character varying(100),
    description text,
    logo text,
    cover_image text,
    location_id uuid,
    business_type_id uuid,
    phone character varying(20),
    email character varying(100),
    website text,
    instagram text,
    whatsapp text,
    rating numeric(2,1) DEFAULT 0.0,
    is_verified boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.businesses OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16501)
-- Name: locations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.locations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    country character varying(50) NOT NULL,
    city character varying(50) NOT NULL,
    district character varying(50),
    address text,
    latitude numeric(9,6),
    longitude numeric(9,6),
    geom public.geography(Point,4326)
);


ALTER TABLE public.locations OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16507)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16510)
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- TOC entry 5956 (class 0 OID 0)
-- Dependencies: 225
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- TOC entry 226 (class 1259 OID 16511)
-- Name: servicecategories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.servicecategories (
    id character varying(100) DEFAULT gen_random_uuid() NOT NULL,
    name character varying(50),
    icon text
);


ALTER TABLE public.servicecategories OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16517)
-- Name: services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.services (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_id uuid,
    category_id character varying(100),
    title character varying(100),
    description text,
    price numeric(10,2),
    duration_minutes integer,
    image text,
    gender_target character varying(10),
    is_active boolean DEFAULT true,
    rating numeric(2,1) DEFAULT 0.0
);


ALTER TABLE public.services OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16525)
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    user_id uuid NOT NULL,
    role_id integer NOT NULL
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16528)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    full_name character varying(100),
    email character varying(100) NOT NULL,
    phone character varying(20),
    password_hash text NOT NULL,
    gender character varying(10),
    birth_date date,
    profile_picture text,
    bio text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 5741 (class 2604 OID 16535)
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- TOC entry 5938 (class 0 OID 16468)
-- Dependencies: 219
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointments (id, customer_id, beautician_id, service_id, scheduled_at, status, payment_status, notes, created_at) FROM stdin;
9e57a548-5c02-4fe2-acac-78c0ce37386d	664e51e1-43ff-4722-8d59-5474c0d9b780	b8fce509-ac64-4e15-85ac-5c4585348d02	a1e144bb-1cef-4e2f-bcdd-95ba63e051c7	2025-09-01 10:00:00	confirmed	paid	Please use red nail polish.	2025-08-24 17:25:55.795343
f746b753-938a-425e-9dc6-7f1cfe1b50c6	57e63a79-f4ed-4009-a133-607adb409407	17ec92de-64ff-4c1e-9b07-0bdfc7e1310a	802bce7c-9573-4dab-818b-5fb22a8aaf22	2025-09-02 14:30:00	pending	unpaid	First-time client, sensitive skin.	2025-08-24 17:25:55.795343
8d3261aa-ebe3-4382-89cd-07ce32b21893	d918e541-29fa-4fd0-b186-a1e8d622332a	09fd5796-5d7d-4933-a96a-a9739cfe1e81	e5e20d44-be7c-411a-bfb8-a0c22779f6c6	2025-09-03 16:00:00	confirmed	paid	Makeup for wedding photoshoot.	2025-08-24 17:25:55.795343
51cf730a-689b-49d7-bb41-24b90f920a51	5e169138-7435-4355-9bb2-90997dfb9947	95543895-9c18-4fd2-a9cd-be19322ca686	ae1e3ed8-f3bc-4042-a337-67d581d64dcc	2025-09-05 09:30:00	cancelled	unpaid	Client canceled due to travel.	2025-08-24 17:25:55.795343
3375438c-7e71-4445-ad14-0ff4cc6b75bf	29d063b1-4cc0-4417-aafb-539fa91cf6b7	a60d6be9-e425-4922-8424-357afe952b41	\N	2025-09-04 11:00:00	completed	unpaid	Regular haircut, no trim on sides.	2025-08-24 17:25:55.795343
\.


--
-- TOC entry 5939 (class 0 OID 16477)
-- Dependencies: 220
-- Data for Name: beauticians; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.beauticians (id, user_id, business_id, bio, experience_years, specialties, is_freelancer, rating) FROM stdin;
09fd5796-5d7d-4933-a96a-a9739cfe1e81	57e63a79-f4ed-4009-a133-607adb409407	16306df6-7318-4655-a7d0-fe28124ccdaf	Experienced professional makeup artist for weddings, photo shoots, and events.	8	{Makeup,Bridal,"Event Styling"}	f	4.9
17ec92de-64ff-4c1e-9b07-0bdfc7e1310a	5e169138-7435-4355-9bb2-90997dfb9947	\N	Skincare specialist with expertise in facial treatments, massage, and wellness.	5	{Facial,Massage,Wellness}	f	4.7
a60d6be9-e425-4922-8424-357afe952b41	d918e541-29fa-4fd0-b186-a1e8d622332a	31cee161-183c-4e12-8dbf-fc6e18861551	Professional barber with expertise in haircuts, grooming, and styling for men.	7	{Haircut,"Beard Grooming",Styling}	f	4.6
95543895-9c18-4fd2-a9cd-be19322ca686	057dc2bf-8b68-4706-8cb1-d3f16d5ac200	f224e83e-e8d3-4650-b43b-bf59e62799a6	Certified hairstylist specializing in cutting, coloring, and hair treatments.	10	{Haircut,"Hair Coloring","Hair Treatment"}	t	4.7
b8fce509-ac64-4e15-85ac-5c4585348d02	29d063b1-4cc0-4417-aafb-539fa91cf6b7	374cc8f7-3aa8-4dc7-b480-f2393a7daea7	Professional nail artist specializing in manicure, pedicure, and creative nail art.	8	{Manicure,Pedicure,"Nail Art"}	t	4.8
\.


--
-- TOC entry 5940 (class 0 OID 16485)
-- Dependencies: 221
-- Data for Name: business_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.business_types (id, name, description) FROM stdin;
0eba2db0-d524-4afe-b171-a1e865252a4f	سالن آرایش مو	خدمات مربوط به کوتاهی، آرایش و مراقبت مو.
120523b6-cf61-4924-8041-d704df54b9b1	استودیو ناخن	خدمات مانیکور، پدیکور و طراحی ناخن.
cb4ce5c5-1559-4980-a84d-dcd82000719c	اسپا و سلامتی	ماساژ، فیشیال و خدمات آرامش‌بخش.
a6089edb-657c-4bc3-a56d-d769c77c32ea	آرایشگر حرفه‌ای	خدمات آرایش حرفه‌ای برای مراسم و عکاسی.
cfd6eeac-d91c-420b-b690-206c63bbcbd1	آرایشگاه مردانه	خدمات کوتاهی و پیرایش مردانه.
\.


--
-- TOC entry 5941 (class 0 OID 16491)
-- Dependencies: 222
-- Data for Name: businesses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.businesses (id, owner_id, name, description, logo, cover_image, location_id, business_type_id, phone, email, website, instagram, whatsapp, rating, is_verified, is_active, created_at) FROM stdin;
f224e83e-e8d3-4650-b43b-bf59e62799a6	057dc2bf-8b68-4706-8cb1-d3f16d5ac200	سالن آرایش مو	خدمات مربوط به کوتاهی، آرایش و مراقبت مو.	logo1.png	cover1.jpg	09760e48-2a35-465d-8b58-93b0d6999892	0eba2db0-d524-4afe-b171-a1e865252a4f	041-12345678	hair_salon@example.com	http://hair-salon.example.com	@hairsalon	09121234565	4.5	t	t	2025-08-24 17:03:59.406649
374cc8f7-3aa8-4dc7-b480-f2393a7daea7	29d063b1-4cc0-4417-aafb-539fa91cf6b7	استودیو ناخن	خدمات مانیکور، پدیکور و طراحی ناخن.	logo2.png	cover2.jpg	92819088-3950-4052-a639-2a8cab6e37de	120523b6-cf61-4924-8041-d704df54b9b1	051-87654321	nail_studio@example.com	http://nailstudio.example.com	@nailstudio	1234567890	4.8	t	t	2025-08-24 17:03:59.406649
16306df6-7318-4655-a7d0-fe28124ccdaf	57e63a79-f4ed-4009-a133-607adb409407	آرایشگر حرفه‌ای	خدمات آرایش حرفه‌ای برای مراسم و عکاسی.	logo3.png	cover3.jpg	a3b7fdef-4f8c-4791-9c8c-c17597734940	a6089edb-657c-4bc3-a56d-d769c77c32ea	071-11223344	pro_makeup@example.com	http://promakeup.example.com	@promakeup	09907041766	4.9	t	t	2025-08-24 17:03:59.406649
31cee161-183c-4e12-8dbf-fc6e18861551	d918e541-29fa-4fd0-b186-a1e8d622332a	آرایشگاه مردانه	خدمات کوتاهی و پیرایش مردانه.	logo5.png	cover5.jpg	ceeba6ff-c41d-4e3d-aff0-e273c96f87e4	cfd6eeac-d91c-420b-b690-206c63bbcbd1	031-66778899	mens_hair@example.com	http://menshair.example.com	@menshair	1234567890	4.6	t	t	2025-08-24 17:03:59.406649
\.


--
-- TOC entry 5942 (class 0 OID 16501)
-- Dependencies: 223
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.locations (id, country, city, district, address, latitude, longitude, geom) FROM stdin;
ac8517f8-ad36-4e53-9372-da92a146f7c3	ایران	تهران	پاسداران	خیابان گلستان، پلاک ۱۲۳	35.762100	51.422600	0101000020E610000012A5BDC117B649400B24287E8CE14140
ceeba6ff-c41d-4e3d-aff0-e273c96f87e4	ایران	اصفهان	سی و سه پل	خیابان چهارباغ عباسی، پلاک ۵۶	32.653900	51.672500	0101000020E6100000AE47E17A14D649405D6DC5FEB2534040
a3b7fdef-4f8c-4791-9c8c-c17597734940	ایران	شیراز	سعدی	خیابان لطفعلی خان، پلاک ۲۳	29.623600	52.533000	0101000020E61000004E62105839444A401DC9E53FA49F3D40
92819088-3950-4052-a639-2a8cab6e37de	ایران	مشهد	رضا	بلوار وکیل‌آباد، پلاک ۷۸	36.298800	59.604200	0101000020E6100000211FF46C56CD4D40BC0512143F264240
09760e48-2a35-465d-8b58-93b0d6999892	ایران	تبریز	راه آهن	خیابان شریعتی، پلاک ۴۵	38.096200	46.273800	0101000020E610000089D2DEE00B23474007F01648500C4340
\.


--
-- TOC entry 5943 (class 0 OID 16507)
-- Dependencies: 224
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name) FROM stdin;
1	user
2	admin
4	beautician
3	business_owner
\.


--
-- TOC entry 5945 (class 0 OID 16511)
-- Dependencies: 226
-- Data for Name: servicecategories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.servicecategories (id, name, icon) FROM stdin;
fa09405d-fc5b-4897-8521-c55d3034d185	Haircut	✂️
86f3cca9-6ed2-43be-b643-a7bbe1e99e68	Hair Coloring	🎨
aab1be4c-c9bc-459d-b8bc-b03a6bbc539b	Facial	💆‍♀️
ffb444d0-fcdd-4cbb-8536-de1f20b23696	Massage	💆‍♂️
aa63d7b0-bf48-47bd-8782-2428cf60ea26	Manicure	💅
cc417d23-df13-4834-8b51-7e96972af4b5	Pedicure	🦶
26740bbf-9879-4071-9d87-650162c2b727	Makeup	💄
788f0b0c-d00f-4c3e-be73-50e167e6de76	Bridal Styling	👰
16ca5bbc-9510-41a2-a798-6916f932e595	Beard Grooming	🧔
9cb8d376-195d-4567-a706-21083f67cb6b	Wellness	🌿
075b182a-181a-4f89-bb16-94e4a25986a3	Skincare	🧴
e315bc3e-4376-45eb-a623-66247fb9a919	Hair Treatment	🧖‍♀️
e4814fb8-c609-4199-b1dc-caceddabc7f7	Nail Art	🎨
b248229f-359f-41bf-ae12-9aa25b4bca60	Eyebrow Shaping	🪞
08cfa949-fa2d-453c-afac-54aaf7327d5d	Spa Services	🏖️
\.


--
-- TOC entry 5946 (class 0 OID 16517)
-- Dependencies: 227
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.services (id, business_id, category_id, title, description, price, duration_minutes, image, gender_target, is_active, rating) FROM stdin;
ae1e3ed8-f3bc-4042-a337-67d581d64dcc	f224e83e-e8d3-4650-b43b-bf59e62799a6	fa09405d-fc5b-4897-8521-c55d3034d185	Classic Haircut	Professional haircut tailored to your style.	150000.00	45	haircut1.jpg	all	t	0.0
5ad7d9cd-f9f8-4169-844c-e6da2c0b3d2d	f224e83e-e8d3-4650-b43b-bf59e62799a6	86f3cca9-6ed2-43be-b643-a7bbe1e99e68	Full Hair Coloring	Color your hair with professional products and techniques.	400000.00	90	haircolor1.jpg	all	t	0.0
a1e144bb-1cef-4e2f-bcdd-95ba63e051c7	374cc8f7-3aa8-4dc7-b480-f2393a7daea7	aa63d7b0-bf48-47bd-8782-2428cf60ea26	Basic Manicure	Nail shaping, cuticle care, and polish application.	120000.00	40	manicure1.jpg	female	t	0.0
31c2fa2f-c38a-4fd9-8d5f-6ed6fa68364b	374cc8f7-3aa8-4dc7-b480-f2393a7daea7	cc417d23-df13-4834-8b51-7e96972af4b5	Classic Pedicure	Foot soak, nail care, and polish application.	150000.00	50	pedicure1.jpg	female	t	0.0
e5e20d44-be7c-411a-bfb8-a0c22779f6c6	16306df6-7318-4655-a7d0-fe28124ccdaf	26740bbf-9879-4071-9d87-650162c2b727	Event Makeup	Professional makeup for events and photoshoots.	300000.00	60	makeup1.jpg	female	t	0.0
ad06ff3d-491f-48de-ae6a-72ff932ddb3c	16306df6-7318-4655-a7d0-fe28124ccdaf	788f0b0c-d00f-4c3e-be73-50e167e6de76	Bridal Makeup & Hair	Complete bridal look with hair and makeup services.	800000.00	180	bridal1.jpg	female	t	0.0
1167c030-4758-4883-9838-68290f08bbe2	\N	ffb444d0-fcdd-4cbb-8536-de1f20b23696	Relaxing Full-Body Massage	Therapeutic massage for relaxation and stress relief.	350000.00	60	massage1.jpg	all	t	0.0
802bce7c-9573-4dab-818b-5fb22a8aaf22	\N	aab1be4c-c9bc-459d-b8bc-b03a6bbc539b	Deep Cleansing Facial	Professional facial for skin cleansing and rejuvenation.	300000.00	50	facial1.jpg	all	t	0.0
7d0a78ae-6671-4040-b77a-0452242ce6f0	31cee161-183c-4e12-8dbf-fc6e18861551	fa09405d-fc5b-4897-8521-c55d3034d185	Men Haircut	Professional haircut for men.	120000.00	40	mens_haircut1.jpg	male	t	0.0
d5626d45-a904-4112-9fe6-2419645d228c	31cee161-183c-4e12-8dbf-fc6e18861551	16ca5bbc-9510-41a2-a798-6916f932e595	Beard Trim & Grooming	Shaping and grooming of beards.	80000.00	30	beard1.jpg	male	t	0.0
\.


--
-- TOC entry 5726 (class 0 OID 16942)
-- Dependencies: 231
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- TOC entry 5947 (class 0 OID 16525)
-- Dependencies: 228
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_roles (user_id, role_id) FROM stdin;
664e51e1-43ff-4722-8d59-5474c0d9b780	1
29d063b1-4cc0-4417-aafb-539fa91cf6b7	1
d918e541-29fa-4fd0-b186-a1e8d622332a	1
\.


--
-- TOC entry 5948 (class 0 OID 16528)
-- Dependencies: 229
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, full_name, email, phone, password_hash, gender, birth_date, profile_picture, bio, created_at) FROM stdin;
664e51e1-43ff-4722-8d59-5474c0d9b780	Mohammad Karimi	mohammad.karimi@example.com	09121234567	hashed_password_3	male	1985-03-30	\N	System administrator.	2025-08-13 12:42:16.74254+03:30
d918e541-29fa-4fd0-b186-a1e8d622332a	Jane Doe	jane.doe@example.com	1234567890	$2b$10$xXff.V6WPlDpSDGU9KO/GOi.RAvECHOOSztybqpcYehd037pF4yk6	female	1990-05-15	https://example.com/images/jane.jpg	Passionate about beauty and skincare.	2025-08-14 13:32:51.516952+03:30
645b49a8-90f1-4b72-94a4-6864399f1093	Alice Johnson	alice.johnson@example.com	+1234567890	$2b$10$gzkbmK7sUUriYa6FVTuxZuMFFizS1SFyIaSai1WW69yHN2m0Ip7aa	female	1995-08-21	https://example.com/images/alice.jpg	Certified beautician with 5 years of experience in skincare and makeup.	2025-08-17 18:23:28.447319+03:30
29d063b1-4cc0-4417-aafb-539fa91cf6b7	Alice Johnson	sara.ahmadi@example.com	1234567890	$2b$10$fgQTHygKAcX7kyuFZcXOkeryFmdefxsDU9iRwNFekTueIm3G02bp.	female	1992-06-15	https://example.com/images/alice.jpg	Professional beauty enthusiast and freelance stylist.	2025-08-13 12:42:16.74254+03:30
5e169138-7435-4355-9bb2-90997dfb9947	Emily Carter	emily.carter@example.com	5551239876	$2b$10$y38iQ7Tfo9P8ygFBMovEnuUAK4dsJr8qSLcrfYOSsxiXrc8ItAXR6	female	1995-11-05	https://example.com/images/emily.jpg	Professional beautician and skincare expert.	2025-08-17 19:12:32.508922+03:30
57e63a79-f4ed-4009-a133-607adb409407	Mohammad Ahmadi	mohammad.pr285@gmial.com	09907041766	$2b$10$heUH9.r3yvy7W/iivTjOX.O6WTmsbmrORF6lXRSS/mISXYy8YYb2i	male	2002-03-29	\N	System administrator.	2025-08-24 15:49:22.533677+03:30
057dc2bf-8b68-4706-8cb1-d3f16d5ac200	Sasan Beyranvand	sasysasy@example.com	09121234565	$2b$10$68D.7Q6YPVQIUH08vp.0duZX6qlklfbJRfn.ET1H/tyuqYqaWVp8e	male	1985-03-29	\N	System administrator.	2025-08-24 16:13:23.253524+03:30
09f9679d-b74d-4b39-ac38-24d76a6f6391	mohamad	admin@gmail.com	09050948148	$2b$10$rlsNC0b9ju7R.HFZ6T9lku8Ciovy6tiGCdDR9sJ7DiROtm6E9Bdua	male	\N			2025-09-08 10:51:57.210564+03:30
\.


--
-- TOC entry 5957 (class 0 OID 0)
-- Dependencies: 225
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 4, true);


--
-- TOC entry 5750 (class 2606 OID 16537)
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- TOC entry 5752 (class 2606 OID 16539)
-- Name: beauticians beauticians_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beauticians
    ADD CONSTRAINT beauticians_pkey PRIMARY KEY (id);


--
-- TOC entry 5756 (class 2606 OID 16541)
-- Name: businesses businesses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_pkey PRIMARY KEY (id);


--
-- TOC entry 5754 (class 2606 OID 16543)
-- Name: business_types businesstypes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_types
    ADD CONSTRAINT businesstypes_pkey PRIMARY KEY (id);


--
-- TOC entry 5759 (class 2606 OID 16545)
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- TOC entry 5761 (class 2606 OID 16547)
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- TOC entry 5763 (class 2606 OID 16549)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 5765 (class 2606 OID 17737)
-- Name: servicecategories servicecategories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicecategories
    ADD CONSTRAINT servicecategories_pkey PRIMARY KEY (id);


--
-- TOC entry 5767 (class 2606 OID 16553)
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- TOC entry 5769 (class 2606 OID 16555)
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id);


--
-- TOC entry 5771 (class 2606 OID 16557)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 5773 (class 2606 OID 16559)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5757 (class 1259 OID 17706)
-- Name: idx_locations_geom; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_locations_geom ON public.locations USING gist (geom);


--
-- TOC entry 5776 (class 2606 OID 16560)
-- Name: appointments appointments_beautician_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_beautician_id_fkey FOREIGN KEY (beautician_id) REFERENCES public.beauticians(id);


--
-- TOC entry 5777 (class 2606 OID 16565)
-- Name: appointments appointments_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.users(id);


--
-- TOC entry 5778 (class 2606 OID 16570)
-- Name: appointments appointments_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- TOC entry 5779 (class 2606 OID 16575)
-- Name: beauticians beauticians_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beauticians
    ADD CONSTRAINT beauticians_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id);


--
-- TOC entry 5780 (class 2606 OID 16580)
-- Name: beauticians beauticians_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.beauticians
    ADD CONSTRAINT beauticians_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5781 (class 2606 OID 16585)
-- Name: businesses businesses_business_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_business_type_id_fkey FOREIGN KEY (business_type_id) REFERENCES public.business_types(id);


--
-- TOC entry 5782 (class 2606 OID 16590)
-- Name: businesses businesses_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id);


--
-- TOC entry 5783 (class 2606 OID 16595)
-- Name: businesses businesses_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- TOC entry 5784 (class 2606 OID 17750)
-- Name: services service_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT service_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.servicecategories(id) ON DELETE CASCADE;


--
-- TOC entry 5785 (class 2606 OID 16600)
-- Name: services services_business_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_business_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id);


--
-- TOC entry 5786 (class 2606 OID 16610)
-- Name: user_roles user_roles_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- TOC entry 5787 (class 2606 OID 16615)
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2025-11-30 16:04:01

--
-- PostgreSQL database dump complete
--

\unrestrict EwZqeYZEYGAgv0ApLs7yWjEqt8FULe3KwEicZEb4eAncn8gpcLFcYc2qkbVQbC9

