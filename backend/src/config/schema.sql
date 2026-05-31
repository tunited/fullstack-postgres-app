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
  name VARCHAR(100) UNIQUE NOT NULL
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
  contact_email VARCHAR(100)
);

-- Seed baseline Categories
INSERT INTO categories (name) VALUES 
('Technical'), 
('Functional'), 
('Administrator') 
ON CONFLICT DO NOTHING;

-- Seed baseline Modules
INSERT INTO modules (name) VALUES 
('AccountPayable'), 
('AccountRecieable'), 
('FixAsset'), 
('Inventory'), 
('Planning'), 
('GeneralLedger') 
ON CONFLICT DO NOTHING;

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

