-- Create database schema for Apex Support Desk

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'agent', 'admin')),
  cust_num VARCHAR(50),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table (Dynamic metadata)
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

-- Modules Table (Dynamic metadata)
CREATE TABLE IF NOT EXISTS modules (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description VARCHAR(255)
);

-- Module Program Groups Table
CREATE TABLE IF NOT EXISTS module_program_group (
  id SERIAL PRIMARY KEY,
  module VARCHAR(100),
  program_group VARCHAR(255),
  note VARCHAR(255)
);

-- Program Types Table
CREATE TABLE IF NOT EXISTS program_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

-- Issue Types Table
CREATE TABLE IF NOT EXISTS issue_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

-- Companies Table
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  customer_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL
);

-- Positions Table
CREATE TABLE IF NOT EXISTS positions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) UNIQUE NOT NULL
);

-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  base_role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (base_role IN ('customer', 'agent', 'admin'))
);

-- Customers Table (For ticket creation)
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  cust_num VARCHAR(50) UNIQUE NOT NULL,
  cust_name VARCHAR(150) NOT NULL,
  contact_email VARCHAR(100),
  contract_email VARCHAR(255),
  version VARCHAR(100),
  license VARCHAR(100),
  account_owner VARCHAR(100),
  infor_ma VARCHAR(100),
  ppcc_app_ma VARCHAR(100),
  ppcc_cust_ma VARCHAR(100),
  ppcc_tech_ma VARCHAR(100)
);

-- Seed baseline Categories
INSERT INTO categories (name) VALUES 
('Technical'), 
('Functional'), 
('Administrator') 
ON CONFLICT DO NOTHING;

-- Seed baseline Modules
INSERT INTO modules (name, description) VALUES 
('ALL', 'ALL'),
('AM', 'AutoMotion'),
('AP', 'Accounts Payable'),
('APM', 'Appointment'),
('AR', 'Accounts Receivable'),
('Automation', 'Web Automation'),
('BC', 'Barcode'),
('BG', 'Budgets'),
('BOM', 'Bill of Materials'),
('CO', 'Customer Order'),
('Co-Product', 'Co-Product'),
('CSF', 'CashFlow'),
('CST', 'Costing'),
('CU', 'Customer'),
('CUR', 'Customer Rating'),
('Cycle', 'Cycle Count'),
('DO', 'Delivery Order'),
('EDI', 'EDI'),
('EVM', 'Event Management'),
('FA', 'Fixed Assets'),
('FC', 'Forecast'),
('FNS', 'Financial Statements'),
('FS', 'Field Service'),
('FTM', 'FTM'),
('GL', 'General Ledger'),
('IC', 'Inventory Control'),
('ISH', 'I-Cash'),
('Item', 'Item'),
('MAS', 'Master Data'),
('MB', 'Mobile'),
('MIA', 'Material Issue Approval'),
('Milk Run', 'Milk Run'),
('OLS', 'OLS'),
('Oth', 'Other'),
('PAJ', 'Price Adjustment'),
('PJC', 'Projects'),
('PLN', 'Planning'),
('PO', 'Purchase Order'),
('PR', 'Purchase Order Requisitions'),
('PS', 'Production Schedule'),
('QCS', 'Quality Control System'),
('RMA', 'RMA'),
('SA', 'System Administrator'),
('SC', 'Service Contract'),
('SCH', 'Scheduling'),
('SFC', 'Shop Floor Control / Job Order'),
('SH', 'Shipping'),
('Shipment', 'Shipment'),
('SRO', 'Service Orders'),
('System', 'System'),
('Technical', 'Technical'),
('TO', 'Transfer Order'),
('Update UC1', 'Update UC1'),
('VCN', 'Vendor Connect'),
('Vendors', 'Vendors'),
('VMI', 'Vendor Management')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- Seed baseline Program Types
INSERT INTO program_types (name) VALUES 
('Standard'), 
('Customized') 
ON CONFLICT DO NOTHING;

-- Seed baseline Issue Types
INSERT INTO issue_types (name) VALUES 
('Technical'), 
('BugCustomization'),
('BugStandard'),
('Knowledge')
ON CONFLICT DO NOTHING;

-- Seed baseline Companies
INSERT INTO companies (customer_code, name) VALUES 
('PPCC', 'PPCC Co., Ltd.'), 
('SRN', 'SRN')
ON CONFLICT DO NOTHING;

-- Seed baseline Positions
INSERT INTO positions (name) VALUES 
('IT Support'), 
('System Admin'),
('Manager')
ON CONFLICT DO NOTHING;

-- Seed baseline Roles
INSERT INTO roles (name, base_role) VALUES 
('Customer', 'customer'), 
('Agent', 'agent'),
('Admin', 'admin')
ON CONFLICT DO NOTHING;

-- Error Types Table
CREATE TABLE IF NOT EXISTS error_types (
  error_id VARCHAR(10) PRIMARY KEY,
  description VARCHAR(150) NOT NULL,
  remark TEXT
);

-- Seed baseline Error Types
INSERT INTO error_types (error_id, description, remark) VALUES 
('C', 'Spec Changed', ''),
('D', 'Unidentified', ''),
('H', 'Human Error', ''),
('I', 'zNot Used-Issue Log', ''),
('K', 'Knowledge', ''),
('L', 'PPCC Localized', ''),
('O', 'zNot Used-Other', ''),
('OP', 'Opening Balance', ''),
('P', 'Customized Bug', ''),
('PC', 'Customized Bug By Customer', ''),
('R', 'zNot Used-Recommended working', ''),
('S', 'Standard Bug', ''),
('T', 'Technical', ''),
('U', 'zNot Used-User Edit Program', ''),
('V', 'Investigate', '')
ON CONFLICT DO NOTHING;

-- 2. Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  ticket_number VARCHAR(30) UNIQUE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'Technical',
  module VARCHAR(50) NOT NULL DEFAULT 'GeneralLedger',
  program_type VARCHAR(100) DEFAULT 'Standard',
  issue_type VARCHAR(100) DEFAULT 'Technical',
  form_name VARCHAR(255),
  additional_email VARCHAR(255),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'resolved')),
  customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  cust_num VARCHAR(50) REFERENCES customers(cust_num) ON DELETE SET NULL,
  agent_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  solution TEXT,
  workaround TEXT,
  attachment_url VARCHAR(255),
  attachment_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_at TIMESTAMP,
  resolved_at TIMESTAMP,
  resolved_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
  sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Ticket Attachments Table (Multiple files support)
CREATE TABLE IF NOT EXISTS ticket_attachments (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
  file_url VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add some index optimization
CREATE INDEX IF NOT EXISTS idx_tickets_customer ON tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_agent ON tickets(agent_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_messages_ticket ON messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_attachments_ticket ON ticket_attachments(ticket_id);

-- Seed baseline Customers from Master Data
INSERT INTO customers VALUES (1, 'ART', 'ART-SERINA PISTON CO., LTD.', 'art.support@ppcc.co.th', 'SL70420', '', 'PPCC', 'x', 'YES', 'x', 'YES', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO customers VALUES (7, 'BISW', 'THE BANGKOK IRON AND STEEL WORKS CO., LTD.', NULL, 'SL10.0.0.421', '25CCL', '', 'x', '', '', '', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO customers VALUES (8, 'CCH', 'CHUE CHIN HUA CO., LTD.', NULL, 'SL80311', '80 CCL', 'PPCC', 'YES', 'YES', 'YES', 'YES', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO customers VALUES (9, 'NST', 'NEW SOMTHAI MOTOR WORK CO., LTD.', NULL, 'SL70420', '50 CCL', 'PPCC', 'x', 'x', 'x', 'x', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO customers VALUES (3, 'NTH', 'NICHICON (THAILAND) CO.,LTD.', 'nth.support@ppcc.co.th', 'SL10 2024.09.01.5', '12 NU', 'HISYS', 'YES', 'YES', 'YES', 'x', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO customers VALUES (11, 'OTC', 'OGIHARA (THAILAND) CO.,LTD.', NULL, 'SL80010', '40 CCL', 'Infor Direct', 'YES', 'YES', 'x', 'YES', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO customers VALUES (12, 'PK', 'PATKOL PUBLIC CO., LTD.', NULL, 'SL90020', '680 NU', 'PPCC', 'YES', 'x', 'YES', 'YES', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO customers VALUES (13, 'PK-TG', 'TYGIENIC CO.,LTD.', NULL, 'SL90020', '680 NU', 'PPCC', 'YES', 'x', 'YES', 'YES', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO customers VALUES (14, 'PK-HA', 'HEATAWAY CO.,LTD.', NULL, 'SL90020', '680 NU', 'PPCC', 'YES', 'x', 'YES', 'YES', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO customers VALUES (15, 'PK-PKM', 'PATKOL MANUFACTURING CO.,LTD', NULL, 'SL90020', '680 NU', 'PPCC', 'YES', 'x', 'YES', 'YES', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO customers VALUES (16, 'RXM', 'R.X. MANUFACTURING CO., LTD.', NULL, 'SL70308', '52 CCL', 'PPCC', 'NO', 'YES', 'x', 'x', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO customers VALUES (17, 'SNPR', 'SIAM NPR CO., LTD.', NULL, 'SL80311', '21 CCL', 'PPCC', 'YES', 'YES', 'YES', 'YES', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO customers VALUES (4, 'SRN', 'SRN SOUND PROOF CO.,LTD', 'srn.support@ppcc.co.th', 'SL90110', '15 CCL', 'PPCC', 'YES', 'x', 'x', 'x', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO customers VALUES (19, 'SST', 'SIAM SENATER CO., LTD.', NULL, 'SL90030', '10 CCL', 'PPCC', 'YES', 'x', 'x', 'x', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO customers VALUES (20, 'TAIYO', 'TAIYO CABLETEC (THAILAND) CO.,LTD.', NULL, 'SL80311', '', 'HISYS', 'YES', 'x', 'x', 'x', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO customers VALUES (21, 'TAK', 'T.A.K.PACKAGING CO., LTD.', NULL, 'SL80311', '69 NU', 'PPCC', 'YES', 'YES', 'YES', 'YES', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO customers VALUES (22, 'TTSC', 'THAI TAKAGI SEIKO CO.,LTD.', NULL, 'SL80311', '', 'HISYS', 'YES', 'YES', 'YES', 'x', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO customers VALUES (41, 'TBFST', 'TBFST', NULL, 'SL10 2023.03.1.7', '', 'PPCC', 'YES', '', '', '', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO customers VALUES (2, 'CNI', 'C.N.I ENGINEERING SUPPLY Co., Ltd.', 'cni.support@ppcc.co.th', 'SL10 2022.03.1.8', '', 'PPCC', 'YES', 'YES', 'YES', 'YES', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO customers VALUES (43, 'SSMC', 'SSMC', NULL, '', '', '', '', '', 'x', 'x', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO customers VALUES (44, 'IIT', 'IIT', NULL, '', '', '', '', '', '', '', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO customers VALUES (45, 'CIS', 'CIS', NULL, '', '', '', '', '', '', '', NULL) ON CONFLICT (id) DO NOTHING;
INSERT INTO customers VALUES (5, 'ADI', 'ADVANCE DIE CASTING CO., LTD.', 'adi.support@ppcc.co.th', 'SL90110', '', '', 'YES', 'YES', '', '', '') ON CONFLICT (id) DO NOTHING;

-- Seed baseline Users from Master Data
INSERT INTO users VALUES (10, 'tee', 'supachai.athan@gmail.com', '$2a$10$Xe6Qgy0Ph3apKbiwzgJplOkFJ37yPr59BrlH4nljA9wL3Xa07/iHe', 'agent', NULL, '2026-06-02 13:32:36.225101', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO users VALUES (11, 'somchai', 'supachai.athan@live.com', '$2a$10$VzzqwSpxtjy7eJRKciryOevSJSAG4toOtSf2yYYwo0zdJ9qUO9afS', 'customer', 'ADI', '2026-06-02 13:32:54.76252', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO users VALUES (1, 'tunited', 'supachai.a@ppcc.co.th', '$2a$10$8TTaP1kOivDx6GiMtmxkv.ez/H2oCQCHZKCBPwE6i3NTc9ygJ5Qr2', 'admin', 'CUST001', '2026-05-26 09:32:28.57279', true) ON CONFLICT (id) DO NOTHING;

SELECT pg_catalog.setval('public.customers_id_seq', 69, true);
SELECT pg_catalog.setval('public.users_id_seq', 11, true);
