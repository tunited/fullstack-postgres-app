--
-- PostgreSQL database dump
--

\restrict SJfMdzdKrPBiaekYXdsd6hnsEV3Ns5mFlxf1VU0QwicOMDan6nlMJyK1314imUp

-- Dumped from database version 15.18 (Homebrew)
-- Dumped by pg_dump version 15.18 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: tunited
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    cust_num character varying(50) NOT NULL,
    cust_name character varying(150) NOT NULL,
    contact_email character varying(100),
    version character varying(100),
    license character varying(100),
    account_owner character varying(100),
    infor_ma character varying(100),
    ppcc_app_ma character varying(100),
    ppcc_cust_ma character varying(100),
    ppcc_tech_ma character varying(100),
    prefix character varying(50)
);


ALTER TABLE public.customers OWNER TO tunited;

--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: tunited
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.customers_id_seq OWNER TO tunited;

--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tunited
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: error_types; Type: TABLE; Schema: public; Owner: tunited
--

CREATE TABLE public.error_types (
    error_id character varying(10) NOT NULL,
    description character varying(150) NOT NULL,
    remark text
);


ALTER TABLE public.error_types OWNER TO tunited;

--
-- Name: issue_types; Type: TABLE; Schema: public; Owner: tunited
--

CREATE TABLE public.issue_types (
    id integer NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.issue_types OWNER TO tunited;

--
-- Name: issue_types_id_seq; Type: SEQUENCE; Schema: public; Owner: tunited
--

CREATE SEQUENCE public.issue_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.issue_types_id_seq OWNER TO tunited;

--
-- Name: issue_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tunited
--

ALTER SEQUENCE public.issue_types_id_seq OWNED BY public.issue_types.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: tunited
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    ticket_id integer,
    sender_id integer,
    message_text text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_internal boolean DEFAULT false
);


ALTER TABLE public.messages OWNER TO tunited;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: tunited
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.messages_id_seq OWNER TO tunited;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tunited
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: module_program_group; Type: TABLE; Schema: public; Owner: tunited
--

CREATE TABLE public.module_program_group (
    id integer NOT NULL,
    module character varying(100),
    program_group character varying(255),
    note character varying(255)
);


ALTER TABLE public.module_program_group OWNER TO tunited;

--
-- Name: module_program_group_id_seq; Type: SEQUENCE; Schema: public; Owner: tunited
--

CREATE SEQUENCE public.module_program_group_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.module_program_group_id_seq OWNER TO tunited;

--
-- Name: module_program_group_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tunited
--

ALTER SEQUENCE public.module_program_group_id_seq OWNED BY public.module_program_group.id;


--
-- Name: modules; Type: TABLE; Schema: public; Owner: tunited
--

CREATE TABLE public.modules (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(255)
);


ALTER TABLE public.modules OWNER TO tunited;

--
-- Name: modules_id_seq; Type: SEQUENCE; Schema: public; Owner: tunited
--

CREATE SEQUENCE public.modules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.modules_id_seq OWNER TO tunited;

--
-- Name: modules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tunited
--

ALTER SEQUENCE public.modules_id_seq OWNED BY public.modules.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: tunited
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer,
    title character varying(200) NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    type character varying(50),
    ticket_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notifications OWNER TO tunited;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: tunited
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notifications_id_seq OWNER TO tunited;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tunited
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: program_types; Type: TABLE; Schema: public; Owner: tunited
--

CREATE TABLE public.program_types (
    id integer NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.program_types OWNER TO tunited;

--
-- Name: program_types_id_seq; Type: SEQUENCE; Schema: public; Owner: tunited
--

CREATE SEQUENCE public.program_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.program_types_id_seq OWNER TO tunited;

--
-- Name: program_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tunited
--

ALTER SEQUENCE public.program_types_id_seq OWNED BY public.program_types.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: tunited
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    base_role character varying(20) DEFAULT 'customer'::character varying NOT NULL,
    CONSTRAINT roles_base_role_check CHECK (((base_role)::text = ANY ((ARRAY['customer'::character varying, 'agent'::character varying, 'admin'::character varying])::text[])))
);


ALTER TABLE public.roles OWNER TO tunited;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: tunited
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.roles_id_seq OWNER TO tunited;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tunited
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: support_stats; Type: TABLE; Schema: public; Owner: tunited
--

CREATE TABLE public.support_stats (
    stat character varying(10) NOT NULL,
    description character varying(255) NOT NULL,
    remark text
);


ALTER TABLE public.support_stats OWNER TO tunited;

--
-- Name: ticket_attachments; Type: TABLE; Schema: public; Owner: tunited
--

CREATE TABLE public.ticket_attachments (
    id integer NOT NULL,
    ticket_id integer,
    file_url character varying(255) NOT NULL,
    file_name character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.ticket_attachments OWNER TO tunited;

--
-- Name: ticket_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: tunited
--

CREATE SEQUENCE public.ticket_attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ticket_attachments_id_seq OWNER TO tunited;

--
-- Name: ticket_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tunited
--

ALTER SEQUENCE public.ticket_attachments_id_seq OWNED BY public.ticket_attachments.id;


--
-- Name: tickets; Type: TABLE; Schema: public; Owner: tunited
--

CREATE TABLE public.tickets (
    id integer NOT NULL,
    title character varying(200) NOT NULL,
    description text NOT NULL,
    priority character varying(20) DEFAULT 'medium'::character varying NOT NULL,
    status character varying(20) DEFAULT 'open'::character varying NOT NULL,
    customer_id integer,
    agent_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    module character varying(50) DEFAULT 'GeneralLedger'::character varying NOT NULL,
    resolved_at timestamp without time zone,
    solution text,
    workaround text,
    attachment_url character varying(255),
    attachment_name character varying(255),
    resolved_by integer,
    cust_num character varying(50),
    ticket_number character varying(30),
    assigned_at timestamp without time zone,
    form_name character varying(255),
    additional_email character varying(255),
    program_type character varying(100) DEFAULT 'Standard'::character varying,
    issue_type character varying(100) DEFAULT 'Technical'::character varying,
    CONSTRAINT tickets_priority_check CHECK (((priority)::text = ANY ((ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying])::text[]))),
    CONSTRAINT tickets_status_check CHECK (((status)::text = ANY ((ARRAY['open'::character varying, 'assigned'::character varying, 'resolved'::character varying])::text[])))
);


ALTER TABLE public.tickets OWNER TO tunited;

--
-- Name: tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: tunited
--

CREATE SEQUENCE public.tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tickets_id_seq OWNER TO tunited;

--
-- Name: tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tunited
--

ALTER SEQUENCE public.tickets_id_seq OWNED BY public.tickets.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: tunited
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(20) DEFAULT 'customer'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_verified boolean DEFAULT false,
    cust_num character varying(255),
    reset_password_token character varying(255),
    reset_password_expires timestamp without time zone
);


ALTER TABLE public.users OWNER TO tunited;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: tunited
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO tunited;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tunited
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: issue_types id; Type: DEFAULT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.issue_types ALTER COLUMN id SET DEFAULT nextval('public.issue_types_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: module_program_group id; Type: DEFAULT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.module_program_group ALTER COLUMN id SET DEFAULT nextval('public.module_program_group_id_seq'::regclass);


--
-- Name: modules id; Type: DEFAULT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.modules ALTER COLUMN id SET DEFAULT nextval('public.modules_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: program_types id; Type: DEFAULT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.program_types ALTER COLUMN id SET DEFAULT nextval('public.program_types_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: ticket_attachments id; Type: DEFAULT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.ticket_attachments ALTER COLUMN id SET DEFAULT nextval('public.ticket_attachments_id_seq'::regclass);


--
-- Name: tickets id; Type: DEFAULT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.tickets ALTER COLUMN id SET DEFAULT nextval('public.tickets_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: customers customers_cust_num_key; Type: CONSTRAINT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_cust_num_key UNIQUE (cust_num);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: error_types error_types_pkey; Type: CONSTRAINT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.error_types
    ADD CONSTRAINT error_types_pkey PRIMARY KEY (error_id);


--
-- Name: issue_types issue_types_name_key; Type: CONSTRAINT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.issue_types
    ADD CONSTRAINT issue_types_name_key UNIQUE (name);


--
-- Name: issue_types issue_types_pkey; Type: CONSTRAINT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.issue_types
    ADD CONSTRAINT issue_types_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: module_program_group module_program_group_pkey; Type: CONSTRAINT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.module_program_group
    ADD CONSTRAINT module_program_group_pkey PRIMARY KEY (id);


--
-- Name: modules modules_name_key; Type: CONSTRAINT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_name_key UNIQUE (name);


--
-- Name: modules modules_pkey; Type: CONSTRAINT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: program_types program_types_name_key; Type: CONSTRAINT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.program_types
    ADD CONSTRAINT program_types_name_key UNIQUE (name);


--
-- Name: program_types program_types_pkey; Type: CONSTRAINT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.program_types
    ADD CONSTRAINT program_types_pkey PRIMARY KEY (id);


--
-- Name: roles roles_name_key; Type: CONSTRAINT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_name_key UNIQUE (name);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: support_stats support_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.support_stats
    ADD CONSTRAINT support_stats_pkey PRIMARY KEY (stat);


--
-- Name: ticket_attachments ticket_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.ticket_attachments
    ADD CONSTRAINT ticket_attachments_pkey PRIMARY KEY (id);


--
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- Name: tickets tickets_ticket_number_key; Type: CONSTRAINT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_ticket_number_key UNIQUE (ticket_number);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_messages_ticket; Type: INDEX; Schema: public; Owner: tunited
--

CREATE INDEX idx_messages_ticket ON public.messages USING btree (ticket_id);


--
-- Name: idx_notifications_unread; Type: INDEX; Schema: public; Owner: tunited
--

CREATE INDEX idx_notifications_unread ON public.notifications USING btree (user_id, is_read);


--
-- Name: idx_notifications_user; Type: INDEX; Schema: public; Owner: tunited
--

CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id);


--
-- Name: idx_ticket_attachments_ticket; Type: INDEX; Schema: public; Owner: tunited
--

CREATE INDEX idx_ticket_attachments_ticket ON public.ticket_attachments USING btree (ticket_id);


--
-- Name: idx_tickets_agent; Type: INDEX; Schema: public; Owner: tunited
--

CREATE INDEX idx_tickets_agent ON public.tickets USING btree (agent_id);


--
-- Name: idx_tickets_customer; Type: INDEX; Schema: public; Owner: tunited
--

CREATE INDEX idx_tickets_customer ON public.tickets USING btree (customer_id);


--
-- Name: idx_tickets_status; Type: INDEX; Schema: public; Owner: tunited
--

CREATE INDEX idx_tickets_status ON public.tickets USING btree (status);


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: ticket_attachments ticket_attachments_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.ticket_attachments
    ADD CONSTRAINT ticket_attachments_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE CASCADE;


--
-- Name: tickets tickets_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: tickets tickets_cust_num_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_cust_num_fkey FOREIGN KEY (cust_num) REFERENCES public.customers(cust_num) ON DELETE SET NULL;


--
-- Name: tickets tickets_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: tickets tickets_resolved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tunited
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict SJfMdzdKrPBiaekYXdsd6hnsEV3Ns5mFlxf1VU0QwicOMDan6nlMJyK1314imUp

