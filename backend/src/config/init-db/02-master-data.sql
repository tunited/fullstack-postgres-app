--
-- PostgreSQL database dump
--

\restrict chSB9DgbdGuZXCZEGq3nhvrgqdGtCTa9WftNVmaykIjuuOzcNxfeBphPSbUHp9C

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

--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: tunited
--

INSERT INTO public.customers VALUES (70, 'PKF', 'PATKOL FOOD INDUSTRY PARTNER CO., LTD.', 'test.support@ppcc.co.th', 'SL90020', '680NU', 'PPCC', 'NO', 'x', 'YES', 'YES', 'PKF');
INSERT INTO public.customers VALUES (5, 'ADI', 'ADVANCE DIE CASTING CO., LTD.', 'test.support@ppcc.co.th', 'SL90110', '', '', 'YES', 'YES', '', '', 'ADI');
INSERT INTO public.customers VALUES (1, 'ART', 'ART-SERINA PISTON CO., LTD.', 'test.support@ppcc.co.th', 'SL70420', '', 'PPCC', 'x', 'YES', 'x', 'YES', 'ART');
INSERT INTO public.customers VALUES (2, 'CNI', 'C.N.I ENGINEERING SUPPLY Co., Ltd.', 'test.support@ppcc.co.th', 'SL10 2022.03.1.8', '', 'PPCC', 'YES', 'YES', 'YES', 'YES', 'CNI');
INSERT INTO public.customers VALUES (8, 'CCH', 'CHUE CHIN HUA CO., LTD.', 'test.support@ppcc.co.th', 'SL80311', '80 CCL', 'PPCC', 'YES', 'YES', 'YES', 'YES', 'CCH');
INSERT INTO public.customers VALUES (45, 'CIS', 'CIS', 'test.support@ppcc.co.th', '', '', '', '', '', '', '', 'CIS');
INSERT INTO public.customers VALUES (14, 'PK-HA', 'HEATAWAY CO.,LTD.', 'test.support@ppcc.co.th', 'SL90020', '680 NU', 'PPCC', 'YES', 'x', 'YES', 'YES', 'HA');
INSERT INTO public.customers VALUES (44, 'IIT', 'IIT', 'test.support@ppcc.co.th', '', '', '', '', '', '', '', 'IIT');
INSERT INTO public.customers VALUES (9, 'NST', 'NEW SOMTHAI MOTOR WORK CO., LTD.', 'test.support@ppcc.co.th', 'SL70420', '50 CCL', 'PPCC', 'x', 'x', 'x', 'x', 'NST');
INSERT INTO public.customers VALUES (3, 'NTH', 'NICHICON (THAILAND) CO.,LTD.', 'test.support@ppcc.co.th', 'SL10 2024.09.01.5', '12 NU', 'HISYS', 'YES', 'YES', 'YES', 'x', 'NTH');
INSERT INTO public.customers VALUES (11, 'OTC', 'OGIHARA (THAILAND) CO.,LTD.', 'test.support@ppcc.co.th', 'SL80010', '40 CCL', 'Infor Direct', 'YES', 'YES', 'x', 'YES', 'OTC');
INSERT INTO public.customers VALUES (15, 'ICE', 'PATKOL ICE SOLUTIONS CO.,LTD.', 'test.support@ppcc.co.th', 'SL90020', '680 NU', 'PPCC', 'YES', 'x', 'YES', 'YES', 'ICE');
INSERT INTO public.customers VALUES (12, 'PK', 'PATKOL PUBLIC CO., LTD.', 'test.support@ppcc.co.th', 'SL90020', '680 NU', 'PPCC', 'YES', 'x', 'YES', 'YES', 'PK');
INSERT INTO public.customers VALUES (16, 'RX', 'R.X. MANUFACTURING CO., LTD.', 'test.support@ppcc.co.th', 'SL70308', '52 CCL', 'PPCC', 'NO', 'YES', 'x', 'x', 'RX');
INSERT INTO public.customers VALUES (17, 'SNPR', 'SIAM NPR CO., LTD.', 'test.support@ppcc.co.th', 'SL80311', '21 CCL', 'PPCC', 'YES', 'YES', 'YES', 'YES', 'SNPR');
INSERT INTO public.customers VALUES (19, 'SST', 'SIAM SENATER CO., LTD.', 'test.support@ppcc.co.th', 'SL90030', '10 CCL', 'PPCC', 'YES', 'x', 'x', 'x', 'SST');
INSERT INTO public.customers VALUES (4, 'SRN', 'SRN SOUND PROOF CO.,LTD', 'test.support@ppcc.co.th', 'SL90110', '15 CCL', 'PPCC', 'YES', 'x', 'x', 'x', 'SRN');
INSERT INTO public.customers VALUES (43, 'SSMC', 'SSMC', 'test.support@ppcc.co.th', '', '', '', '', '', 'x', 'x', 'SSMC');
INSERT INTO public.customers VALUES (21, 'TAK', 'T.A.K.PACKAGING CO., LTD.', 'test.support@ppcc.co.th', 'SL80311', '69 NU', 'PPCC', 'YES', 'YES', 'YES', 'YES', 'TAK');
INSERT INTO public.customers VALUES (20, 'TAIYO', 'TAIYO CABLETEC (THAILAND) CO.,LTD.', 'test.support@ppcc.co.th', 'SL80311', '', 'HISYS', 'YES', 'x', 'x', 'x', 'TAIYO');
INSERT INTO public.customers VALUES (41, 'TBFST', 'TBFST', 'test.support@ppcc.co.th', 'SL10 2023.03.1.7', '', 'PPCC', 'YES', '', '', '', 'TBFS');
INSERT INTO public.customers VALUES (22, 'TTSC', 'THAI TAKAGI SEIKO CO.,LTD.', 'test.support@ppcc.co.th', 'SL80311', '', 'HISYS', 'YES', 'YES', 'YES', 'x', 'TTSC');
INSERT INTO public.customers VALUES (7, 'BISW', 'THE BANGKOK IRON AND STEEL WORKS CO., LTD.', 'test.support@ppcc.co.th', 'SL10.0.0.421', '25CCL', '', 'x', '', '', '', 'BISW');
INSERT INTO public.customers VALUES (13, 'PK-TG', 'TYGIENIC CO.,LTD.', 'test.support@ppcc.co.th', 'SL90020', '680 NU', 'PPCC', 'YES', 'x', 'YES', 'YES', 'TG');


--
-- Data for Name: error_types; Type: TABLE DATA; Schema: public; Owner: tunited
--

INSERT INTO public.error_types VALUES ('D', 'Unidentified', '');
INSERT INTO public.error_types VALUES ('H', 'Human Error', '');
INSERT INTO public.error_types VALUES ('I', 'zNot Used-Issue Log', '');
INSERT INTO public.error_types VALUES ('K', 'Knowledge', '');
INSERT INTO public.error_types VALUES ('L', 'PPCC Localized', '');
INSERT INTO public.error_types VALUES ('O', 'zNot Used-Other', '');
INSERT INTO public.error_types VALUES ('OP', 'Opening Balance', '');
INSERT INTO public.error_types VALUES ('P', 'Customized Bug', '');
INSERT INTO public.error_types VALUES ('PC', 'Customized Bug By Customer', '');
INSERT INTO public.error_types VALUES ('R', 'zNot Used-Recommended working', '');
INSERT INTO public.error_types VALUES ('S', 'Standard Bug', '');
INSERT INTO public.error_types VALUES ('T', 'Technical', '');
INSERT INTO public.error_types VALUES ('U', 'zNot Used-User Edit Program', '');
INSERT INTO public.error_types VALUES ('V', 'Investigate', '');
INSERT INTO public.error_types VALUES ('C', 'Spec Changed', 'Spec Changed');


--
-- Data for Name: issue_types; Type: TABLE DATA; Schema: public; Owner: tunited
--

INSERT INTO public.issue_types VALUES (1, 'Technical');
INSERT INTO public.issue_types VALUES (2, 'BugCustomization');
INSERT INTO public.issue_types VALUES (3, 'BugStandard');
INSERT INTO public.issue_types VALUES (4, 'Knowledge');


--
-- Data for Name: module_program_group; Type: TABLE DATA; Schema: public; Owner: tunited
--

INSERT INTO public.module_program_group VALUES (1, 'AP', 'Petty Cash Payment', 'Petty Cash Payment');
INSERT INTO public.module_program_group VALUES (2, 'AP', 'Generate Bank File', 'Generate Bank File');
INSERT INTO public.module_program_group VALUES (3, 'AP', 'AP Voucher and Adjustments', 'AP Voucher and Adjustments');
INSERT INTO public.module_program_group VALUES (5, 'SC', 'Service Contract', NULL);
INSERT INTO public.module_program_group VALUES (6, 'AP', 'AP Posted Transactions Detail', 'AP Posted Transactions Detail');
INSERT INTO public.module_program_group VALUES (7, 'AR', 'Customer Order Invoice', 'Customer Order Invoice');
INSERT INTO public.module_program_group VALUES (8, 'AR', 'Delivery Order Invoice', 'Delivery Order Invoice');
INSERT INTO public.module_program_group VALUES (9, 'AR', 'Project Invoice', 'Project Invoice');
INSERT INTO public.module_program_group VALUES (10, 'AR', 'Service Order Invoice', 'Service Order Invoice');
INSERT INTO public.module_program_group VALUES (11, 'AR', 'Service Tax Invoice', 'Service Tax Invoice');
INSERT INTO public.module_program_group VALUES (12, 'AR', 'Service Contract Invoice', 'Service Contract Invoice');
INSERT INTO public.module_program_group VALUES (13, 'AR', 'RMA Invoice', 'RMA Invoice');
INSERT INTO public.module_program_group VALUES (14, 'AR', 'Price Adjustment Invoice', 'Price Adjustment Invoice');
INSERT INTO public.module_program_group VALUES (15, 'AR', 'Customer Rating', 'Customer Rating');
INSERT INTO public.module_program_group VALUES (16, 'AR', 'AR Billing', 'AR Billing');
INSERT INTO public.module_program_group VALUES (17, 'AR', 'AR Invoice Voucher Report', 'AR Invoice Voucher Report');
INSERT INTO public.module_program_group VALUES (18, 'AR', 'AR Payment', 'AR Payment');
INSERT INTO public.module_program_group VALUES (19, 'AR', 'AR Posted Transactions', 'AR Posted Transactions');
INSERT INTO public.module_program_group VALUES (20, 'GL', 'Journal Entrie', 'Journal Entrie');
INSERT INTO public.module_program_group VALUES (21, 'GL', 'Journal Recurring', 'Journal Recurring');
INSERT INTO public.module_program_group VALUES (22, 'GL', 'Journal Posting', 'Journal Posting');
INSERT INTO public.module_program_group VALUES (23, 'GL', 'GL Posted Transactions', 'GL Posted Transactions');
INSERT INTO public.module_program_group VALUES (24, 'GL', 'General Ledger By Account Report', 'General Ledger By Account Report');
INSERT INTO public.module_program_group VALUES (25, 'CST', 'Project Inquiry', 'Project Inquiry');
INSERT INTO public.module_program_group VALUES (26, 'CST', 'Project Costing', 'Project Costing');
INSERT INTO public.module_program_group VALUES (27, 'CST', 'FS Costing', 'FS Costing');
INSERT INTO public.module_program_group VALUES (28, 'CST', 'Project Revenue', 'Project Revenue');
INSERT INTO public.module_program_group VALUES (29, 'CST', 'Production Costing', 'Production Costing');
INSERT INTO public.module_program_group VALUES (30, 'CST', 'CO Costing', 'CO Costing');
INSERT INTO public.module_program_group VALUES (31, 'Update UC1', 'Update UC1', NULL);
INSERT INTO public.module_program_group VALUES (32, 'System', 'System Error', NULL);
INSERT INTO public.module_program_group VALUES (33, 'FNS', 'Cash Flow', 'Cash Flow');
INSERT INTO public.module_program_group VALUES (34, 'PJC', 'Project Labor', 'Project Labor');
INSERT INTO public.module_program_group VALUES (35, 'PO', 'Purchase Orders', 'Purchase Orders');
INSERT INTO public.module_program_group VALUES (36, 'PJC', 'Project Revenue Milestones Genration', 'Project Revenue Milestones Genration');
INSERT INTO public.module_program_group VALUES (37, 'PO', 'Goods Receiving Notes', 'Goods Receiving Notes');
INSERT INTO public.module_program_group VALUES (38, 'APM', 'ICash', 'ICash ICash Distribution');
INSERT INTO public.module_program_group VALUES (39, 'APM', 'ICash Transfer', 'ICash Transfer');
INSERT INTO public.module_program_group VALUES (40, 'APM', 'Generate Bank File', 'Generate Bank File');
INSERT INTO public.module_program_group VALUES (41, 'ISH', 'Easy Voucher', 'Easy Voucher');
INSERT INTO public.module_program_group VALUES (42, 'AP', 'Input Vat', 'Input Vat Report');
INSERT INTO public.module_program_group VALUES (43, 'AR', 'Output Vat', 'Output Vat Report');
INSERT INTO public.module_program_group VALUES (44, 'Automation', 'Job Material Transaction', 'Job Material Transaction');
INSERT INTO public.module_program_group VALUES (45, 'Automation', 'Transfer Order Ship', 'Transfer Order Ship');
INSERT INTO public.module_program_group VALUES (46, 'Automation', 'Quantity Move', 'Quantity Move');
INSERT INTO public.module_program_group VALUES (47, 'AR', 'Pre Invoice', 'Pre Invoice');
INSERT INTO public.module_program_group VALUES (48, 'Automation', '??????', '??????');
INSERT INTO public.module_program_group VALUES (49, 'Milk Run', 'Milk Run', 'Milk Run');
INSERT INTO public.module_program_group VALUES (50, 'SFC', 'Job Order', NULL);
INSERT INTO public.module_program_group VALUES (51, 'EDI', 'EDI Load Forecast', 'EDI Load Forecast');
INSERT INTO public.module_program_group VALUES (52, 'Cycle', 'Cycle Count Posting', 'Cycle Count Posting');
INSERT INTO public.module_program_group VALUES (53, 'FA', 'Fixed Asset Generate Card', 'Fixed Asset Generate Card');
INSERT INTO public.module_program_group VALUES (54, 'FA', 'Fixed Asset Depreciation', 'Fixed Asset Depreciation');
INSERT INTO public.module_program_group VALUES (55, 'FA', 'Fixed Asset Disposal', 'Fixed Asset Disposal');
INSERT INTO public.module_program_group VALUES (56, 'FA', 'Fixed Assest Transfer', 'Fixed Assest Transfer');
INSERT INTO public.module_program_group VALUES (57, 'SRO', 'Service Orders', NULL);
INSERT INTO public.module_program_group VALUES (58, 'APM', 'Cutoff', 'Cutoff Cutoff Report');
INSERT INTO public.module_program_group VALUES (59, 'Automation', 'Print Tag', 'Print Tag');
INSERT INTO public.module_program_group VALUES (60, 'Automation', 'Unposted Job Transaction', 'Unposted Job Transaction');
INSERT INTO public.module_program_group VALUES (61, 'AR', 'AR Receipt', 'AR Receipt');
INSERT INTO public.module_program_group VALUES (62, 'SFC', 'Print Tag', 'Print Tag');
INSERT INTO public.module_program_group VALUES (63, 'SFC', 'Process Slip', 'Process Slip');
INSERT INTO public.module_program_group VALUES (64, 'RMA', 'RMA Credit Memos', 'RMA Credit Memos');
INSERT INTO public.module_program_group VALUES (65, 'SH', 'Order Shipping', NULL);
INSERT INTO public.module_program_group VALUES (66, 'SFC', 'Job Material Transactions', NULL);
INSERT INTO public.module_program_group VALUES (67, 'Cycle', 'Cycle Count Variance Report', 'Cycle Count Variance Report');
INSERT INTO public.module_program_group VALUES (68, 'DO', 'Order Pick List', 'Order Pick List');
INSERT INTO public.module_program_group VALUES (69, 'PR', 'Purchase Order Requisitions', 'Purchase Order Requisitions');
INSERT INTO public.module_program_group VALUES (70, 'Technical', 'Report', NULL);
INSERT INTO public.module_program_group VALUES (71, 'AP', 'Budget Code', 'Budget Code');
INSERT INTO public.module_program_group VALUES (72, 'BG', 'Budget Control', 'Budget Control');
INSERT INTO public.module_program_group VALUES (73, 'RMA', 'RMA', 'RMA');
INSERT INTO public.module_program_group VALUES (74, 'RMA', 'RMA Return Transactions', 'RMA Return Transactions');
INSERT INTO public.module_program_group VALUES (75, 'PO', 'Purchase Order Report', 'Purchase Order Report');
INSERT INTO public.module_program_group VALUES (76, 'PO', 'Purchase Po Dist Report', 'Purchase Po Dist Report');
INSERT INTO public.module_program_group VALUES (77, 'IC', 'Spare Part Return Slip', 'Spare Part Return Slip');
INSERT INTO public.module_program_group VALUES (78, 'AR', 'Account Receivable Aging Report', 'Account Receivable Aging Report');
INSERT INTO public.module_program_group VALUES (79, 'IC', 'Miscellaneous Receipt', 'Miscellaneous Receipt');
INSERT INTO public.module_program_group VALUES (80, 'GL', 'Excel Add-In', 'Excel Add-In');
INSERT INTO public.module_program_group VALUES (81, 'BC', 'Barcode-PO', '?????? SRN');
INSERT INTO public.module_program_group VALUES (82, 'BC', 'Barcode-CO', '?????? SRN');
INSERT INTO public.module_program_group VALUES (83, 'BC', 'Barcode-JOB', '?????? SRN');
INSERT INTO public.module_program_group VALUES (84, 'BC', 'Barcode-Master', '?????? SRN');
INSERT INTO public.module_program_group VALUES (85, 'BC', 'Barcode-IC', '?????? SRN');
INSERT INTO public.module_program_group VALUES (86, 'GL', 'Budget Control', 'Budget Control');
INSERT INTO public.module_program_group VALUES (87, 'MIA', 'MIA', 'MIA');
INSERT INTO public.module_program_group VALUES (88, 'SFC', 'Job Transactions', NULL);
INSERT INTO public.module_program_group VALUES (89, 'Oth', 'PDS', 'PDS');
INSERT INTO public.module_program_group VALUES (90, 'IC', 'Weight Interface Incoming', 'BISW');
INSERT INTO public.module_program_group VALUES (91, 'SFC', 'Weight Interface Production', 'BISW');
INSERT INTO public.module_program_group VALUES (92, 'DO', 'Delivery Order Lines', 'Delivery Order Lines');
INSERT INTO public.module_program_group VALUES (93, 'SH', 'Picking List', NULL);
INSERT INTO public.module_program_group VALUES (94, 'MB', 'Mobile', 'Mobile');
INSERT INTO public.module_program_group VALUES (95, 'CU', 'Customers', 'Customers');
INSERT INTO public.module_program_group VALUES (96, 'SFC', 'Unposted Job Transactions', 'Unposted Job Transactions');
INSERT INTO public.module_program_group VALUES (97, 'TO', 'Transfer Order Line', NULL);
INSERT INTO public.module_program_group VALUES (98, 'PJC', 'Project Generate Order Pick List', 'Project Generate Order Pick List');
INSERT INTO public.module_program_group VALUES (99, 'CO', 'Invoicing Report', 'Invoicing Report');
INSERT INTO public.module_program_group VALUES (100, 'CUR', 'Customer Rating', 'Customer Rating');
INSERT INTO public.module_program_group VALUES (101, 'FA', 'Fixed Assets', 'Fixed Assets');
INSERT INTO public.module_program_group VALUES (102, 'PJC', 'Project Invoice Milestone', 'Project Invoice Milestone');
INSERT INTO public.module_program_group VALUES (103, 'CO', 'Progressive Billings', 'Progressive Billings');
INSERT INTO public.module_program_group VALUES (104, 'GL', 'Journal Voucher Report', 'Journal Voucher Report');
INSERT INTO public.module_program_group VALUES (105, 'CO', 'Price Adjustments Invoice Report', 'Price Adjustments Invoice Report');
INSERT INTO public.module_program_group VALUES (106, 'FA', 'Fixed Asset Depreciation Posted Report', 'Fixed Asset Depreciation Posted Report');
INSERT INTO public.module_program_group VALUES (107, 'AP', 'AP Payment Distributions', 'AP Payment Distributions');
INSERT INTO public.module_program_group VALUES (108, 'CO', 'Customer Orders', 'Customer Orders');
INSERT INTO public.module_program_group VALUES (109, 'CO', 'Order Shipping', 'Order Shipping');
INSERT INTO public.module_program_group VALUES (110, 'Automation', 'Scan Order PickList', NULL);
INSERT INTO public.module_program_group VALUES (4, 'AP', 'AP Payment', 'AP Payment');
INSERT INTO public.module_program_group VALUES (111, 'RMA', 'RMA Lines Item', 'RMA Lines Item');
INSERT INTO public.module_program_group VALUES (112, 'TO', 'Transfer Order', NULL);
INSERT INTO public.module_program_group VALUES (113, 'AM', 'Web Service', 'Web Service');
INSERT INTO public.module_program_group VALUES (114, 'MAS', 'Chart of Accounts', 'Chart of Accounts');
INSERT INTO public.module_program_group VALUES (115, 'Oth', 'Material Planner Workbench', 'Material Planner Workbench');
INSERT INTO public.module_program_group VALUES (116, 'AP', 'Voucher Adjustment Distribution', 'Voucher Adjustment Distribution');
INSERT INTO public.module_program_group VALUES (117, 'DO', 'Delivery Order Line Sequences', 'Delivery Order Line Sequences');
INSERT INTO public.module_program_group VALUES (118, 'PO', 'API Vendor Contract Price All', 'API Vendor Contract Price All');
INSERT INTO public.module_program_group VALUES (119, 'IC', 'Part Delivery Sheet Report', 'Part Delivery Sheet Report');
INSERT INTO public.module_program_group VALUES (120, 'PO', 'API Vendor', 'API Vendor');
INSERT INTO public.module_program_group VALUES (121, 'PO', 'API Create PO/PO Line', 'API Create PO/PO Line');
INSERT INTO public.module_program_group VALUES (122, 'IC', 'API PDS', 'API PDS');
INSERT INTO public.module_program_group VALUES (123, 'IC', 'API WC Matl Issue', 'API WC Matl Issue');
INSERT INTO public.module_program_group VALUES (124, 'IC', 'Web Service (JSON)', 'Web Service (JSON)');
INSERT INTO public.module_program_group VALUES (125, 'DO', 'Consolidated Invoicing', 'Consolidated Invoicing');
INSERT INTO public.module_program_group VALUES (126, 'AP', 'Petty Cash Payment Distribution', 'Petty Cash Payment Distribution');
INSERT INTO public.module_program_group VALUES (127, 'AP', 'AP Voucher Posting', 'AP Voucher Posting');
INSERT INTO public.module_program_group VALUES (128, 'AR', 'AR Payment Posting', 'AR Payment Posting');
INSERT INTO public.module_program_group VALUES (129, 'FA', 'Fixed Asset Costs', 'Fixed Asset Costs');
INSERT INTO public.module_program_group VALUES (130, 'FA', 'Fixed Asset Acquisition Report', 'Fixed Asset Acquisition Report');
INSERT INTO public.module_program_group VALUES (131, 'FA', 'Fixed Asset Monitoring GL Report', 'Fixed Asset Monitoring GL Report');
INSERT INTO public.module_program_group VALUES (132, 'PO', 'Generate AP Transactions', 'Generate AP Transactions');
INSERT INTO public.module_program_group VALUES (133, 'PO', 'Purchase Order Receiving', 'Purchase Order Receiving');
INSERT INTO public.module_program_group VALUES (134, 'PJC', 'Project Report', 'Project Report');
INSERT INTO public.module_program_group VALUES (135, 'SC', 'Service Contract To Be Invoiced Report', NULL);
INSERT INTO public.module_program_group VALUES (136, 'DO', 'Consolidate Invoice Generations', NULL);
INSERT INTO public.module_program_group VALUES (137, 'SFC', 'Job Material', NULL);
INSERT INTO public.module_program_group VALUES (138, 'PJC', 'Print Post Project Reveune Milestone', NULL);
INSERT INTO public.module_program_group VALUES (139, 'IC', 'Lots', 'Lots');
INSERT INTO public.module_program_group VALUES (140, 'PJC', 'Confirm Qty Pick History', NULL);
INSERT INTO public.module_program_group VALUES (141, 'PJC', 'Project Inquiry', 'Project Inquiry');
INSERT INTO public.module_program_group VALUES (142, 'AP', 'Voucher Payable Report', 'Voucher Payable Report');
INSERT INTO public.module_program_group VALUES (143, 'PJC', 'Projects', NULL);
INSERT INTO public.module_program_group VALUES (144, 'AR', 'Invoice Transaction Report', 'Invoice Transaction Report');
INSERT INTO public.module_program_group VALUES (145, 'PJC', 'Revenue Milestones', 'Revenue Milestones');
INSERT INTO public.module_program_group VALUES (146, 'AR', 'Progressive Invoice', NULL);
INSERT INTO public.module_program_group VALUES (147, 'GL', 'Mass Journal Posting', 'Mass Journal Posting');
INSERT INTO public.module_program_group VALUES (148, 'GL', 'Ledger Posting for Journal', 'Ledger Posting for Journal');
INSERT INTO public.module_program_group VALUES (149, 'Oth', 'Yusen', 'Yusen');
INSERT INTO public.module_program_group VALUES (150, 'CU', 'Vendor Customer Contract Prices', 'Vendor Customer Contract Prices');
INSERT INTO public.module_program_group VALUES (151, 'MAS', 'Currency Rate', 'Currency Rate');
INSERT INTO public.module_program_group VALUES (152, 'AP', 'AP Payment Generation', 'AP Payment Generation');
INSERT INTO public.module_program_group VALUES (153, 'IC', 'Roll Current Cost to Standard Cost', 'Roll Current Cost to Standard Cost');
INSERT INTO public.module_program_group VALUES (154, 'IC', 'Work Centers', 'Work Centers');
INSERT INTO public.module_program_group VALUES (155, 'Automation', 'Order Shipping', 'Order Shipping');
INSERT INTO public.module_program_group VALUES (156, 'Automation', 'Generate GRN', 'Generate GRN');
INSERT INTO public.module_program_group VALUES (157, 'Automation', 'Transfer Order Receive', 'Transfer Order Receive');
INSERT INTO public.module_program_group VALUES (158, 'AP', 'Suspense Input Tax Clear', 'Suspense Input Tax Clear');
INSERT INTO public.module_program_group VALUES (159, 'AP', 'AP Billing', 'AP Billing');
INSERT INTO public.module_program_group VALUES (160, 'AP', 'Withholding Tax Statement Report', 'Withholding Tax Statement Report');
INSERT INTO public.module_program_group VALUES (161, 'Shipment', 'Shipment', 'Shipment');
INSERT INTO public.module_program_group VALUES (162, 'EDI', 'EDI Load Order', 'EDI Load Order');
INSERT INTO public.module_program_group VALUES (163, 'FC', 'Forecast', 'Forecast');
INSERT INTO public.module_program_group VALUES (164, 'PJC', 'Project Invoice Milestone Nomination', 'Project Invoice Milestone Nomination');
INSERT INTO public.module_program_group VALUES (165, 'IC', 'Miscellaneous Issue', 'Miscellaneous Issue');
INSERT INTO public.module_program_group VALUES (166, 'AP', 'Accounts Payable Aging Report', 'Accounts Payable Aging Report');
INSERT INTO public.module_program_group VALUES (167, 'Shipment', 'Pick Workbench', NULL);
INSERT INTO public.module_program_group VALUES (168, 'Technical', 'Forms', NULL);
INSERT INTO public.module_program_group VALUES (169, 'IC', 'Quantity Move', 'Quantity Move');
INSERT INTO public.module_program_group VALUES (170, 'GL', 'General Ledger', 'General Ledger');
INSERT INTO public.module_program_group VALUES (171, 'Cycle', 'Cycle Count Update', NULL);
INSERT INTO public.module_program_group VALUES (172, 'PLN', 'APS Planning', 'APS Planning');
INSERT INTO public.module_program_group VALUES (173, 'CO', 'Barcode', 'Barcode');
INSERT INTO public.module_program_group VALUES (174, 'Oth', 'Tag', 'Tag');
INSERT INTO public.module_program_group VALUES (175, 'AR', 'Export Invoice', 'Export Invoice');
INSERT INTO public.module_program_group VALUES (176, 'DO', 'Delivery Order', 'Delivery Order');
INSERT INTO public.module_program_group VALUES (177, 'AR', 'AR Check Due Posting', 'AR Check Due Posting');
INSERT INTO public.module_program_group VALUES (178, 'SA', 'Reports', NULL);
INSERT INTO public.module_program_group VALUES (179, 'Co-Product', 'Co-Product Mix Operations', 'Co-Product Mix Operations');
INSERT INTO public.module_program_group VALUES (180, 'Oth', 'PPCC Localized', 'PPCC Localized');
INSERT INTO public.module_program_group VALUES (181, 'AM', 'API', 'API');
INSERT INTO public.module_program_group VALUES (182, 'Oth', 'WMS', 'WMS');
INSERT INTO public.module_program_group VALUES (183, 'PJC', 'Project Invoice Milestone Lines', 'Project Invoice Milestone Lines');
INSERT INTO public.module_program_group VALUES (184, 'Co-Product', 'Co-Product Mix', 'Co-Product Mix');
INSERT INTO public.module_program_group VALUES (185, 'Vendors', 'Vendors', NULL);
INSERT INTO public.module_program_group VALUES (186, 'PJC', 'Project Order Pickups', 'Project Order Pickups');
INSERT INTO public.module_program_group VALUES (187, 'IC', 'Copy Routing BOM', NULL);
INSERT INTO public.module_program_group VALUES (188, 'AP', 'AP Invoice Voucher Report', 'AP Invoice Voucher Report');
INSERT INTO public.module_program_group VALUES (189, 'AR', 'Invoices Debit and Credit Memos', 'Invoices Debit and Credit Memos');
INSERT INTO public.module_program_group VALUES (190, 'AR', 'AR Payment Voucher Report', 'AR Payment Voucher Report');
INSERT INTO public.module_program_group VALUES (191, 'IC', 'FG Receiving Report', 'FG Receiving Report');
INSERT INTO public.module_program_group VALUES (192, 'FA', 'Fixed Asset Transfer Report', 'Fixed Asset Transfer Report');
INSERT INTO public.module_program_group VALUES (193, 'PO', 'Goods Receiving Note Lines', 'Goods Receiving Note Lines');
INSERT INTO public.module_program_group VALUES (194, 'CO', 'Order Invoicing/Credit Memos', 'Order Invoicing/Credit Memos');
INSERT INTO public.module_program_group VALUES (195, 'IC', 'Daily Inventory Checking Report', 'Daily Inventory Checking Report');
INSERT INTO public.module_program_group VALUES (196, 'IC', 'Item/Warehouse', 'Item/Warehouse');
INSERT INTO public.module_program_group VALUES (197, 'AR', 'Item Sale Invoice Report', 'Item Sale Invoice Report');
INSERT INTO public.module_program_group VALUES (198, 'IC', 'Material Transaction Report', 'Material Transaction Report');
INSERT INTO public.module_program_group VALUES (199, 'PLN', 'Planning Detail', 'Planning Detail');
INSERT INTO public.module_program_group VALUES (200, 'AP', 'Po Vch GL Comparison Report', 'Po Vch GL Comparison Report');
INSERT INTO public.module_program_group VALUES (201, 'GL', 'Journal Voucher Report List', 'Journal Voucher Report List');
INSERT INTO public.module_program_group VALUES (202, 'AR', 'Sale Invoice Report', 'Sale Invoice Report');
INSERT INTO public.module_program_group VALUES (203, 'IC', 'Production Lable', 'Production Lable');
INSERT INTO public.module_program_group VALUES (204, 'PO', 'Purchase Order Status Receive Report', 'Purchase Order Status Receive Report');
INSERT INTO public.module_program_group VALUES (205, 'IC', 'Spare Part Issue Slip', 'Spare Part Issue Slip');
INSERT INTO public.module_program_group VALUES (206, 'IC', 'Inventory Aging Report', 'Inventory Aging Report');
INSERT INTO public.module_program_group VALUES (207, 'IC', 'Inventory Balance Warehouse Report', 'Inventory Balance Warehouse Report');
INSERT INTO public.module_program_group VALUES (208, 'AR', 'AR Receipt Report', 'AR Receipt Report');
INSERT INTO public.module_program_group VALUES (209, 'PO', 'Generate PDS', 'Generate PDS');
INSERT INTO public.module_program_group VALUES (210, 'PO', 'PDS Report', 'PDS Report');
INSERT INTO public.module_program_group VALUES (211, 'CO', 'Price Adjustments', 'Price Adjustments');
INSERT INTO public.module_program_group VALUES (212, 'PO', 'Web PR&PO Approve', 'Web PR&PO Approve');
INSERT INTO public.module_program_group VALUES (213, 'PO', 'Purchase Order Lines', 'Purchase Order Lines');
INSERT INTO public.module_program_group VALUES (214, 'AR', 'Invoice Debit and Credit Memos G/L Distributions', 'Invoice Debit and Credit Memos G/L Distributions');
INSERT INTO public.module_program_group VALUES (215, 'IC', 'API Item', 'API Item');
INSERT INTO public.module_program_group VALUES (216, 'AP', 'Withholding Tax Certificate Report', 'Withholding Tax Certificate Report');
INSERT INTO public.module_program_group VALUES (217, 'AP', 'Withholding Tax Statement Export File', 'Withholding Tax Statement Export File');
INSERT INTO public.module_program_group VALUES (218, 'FA', 'Fixed Asset Disposal Report', 'Fixed Asset Disposal Report');
INSERT INTO public.module_program_group VALUES (219, 'PO', 'API Vendor Contract Price', 'API Vendor Contract Price');
INSERT INTO public.module_program_group VALUES (220, 'PO', 'API Item', 'API Item');
INSERT INTO public.module_program_group VALUES (221, 'IC', 'API Item Location', 'API Item Location');
INSERT INTO public.module_program_group VALUES (222, 'CO', 'Customer Order Lines', 'Customer Order Lines');
INSERT INTO public.module_program_group VALUES (223, 'PO', 'Generate Landed Cost Voucher', 'Generate Landed Cost Voucher');
INSERT INTO public.module_program_group VALUES (224, 'AP', 'AP Check Printing/Posting', 'AP Check Printing/Posting');
INSERT INTO public.module_program_group VALUES (225, 'AP', 'Suspense Input Tax Clear Posting', 'Suspense Input Tax Clear Posting');
INSERT INTO public.module_program_group VALUES (226, 'AR', 'AR Check Due Aging Report', 'AR Check Due Aging Report');
INSERT INTO public.module_program_group VALUES (227, 'AR', 'AR Payment Distributions', 'AR Payment Distributions');
INSERT INTO public.module_program_group VALUES (228, 'AR', 'Invoice Posting', 'Invoice Posting');
INSERT INTO public.module_program_group VALUES (229, 'FA', 'Fixed Asset Class Codes', 'Fixed Asset Class Codes');
INSERT INTO public.module_program_group VALUES (230, 'FA', 'Fixed Asset By Department Report', 'Fixed Asset By Department Report');
INSERT INTO public.module_program_group VALUES (231, 'PR', 'Purchase Order Requisition Lines', 'Purchase Order Requisition Lines');
INSERT INTO public.module_program_group VALUES (232, 'AP', 'AP Payment Voucher Report', 'AP Payment Voucher Report');
INSERT INTO public.module_program_group VALUES (233, 'AR', 'AR Invoice Debit and Credit Memos Report', 'AR Invoice Debit and Credit Memos Report');
INSERT INTO public.module_program_group VALUES (234, 'AP', 'Bank Transfer', 'Bank Transfer');
INSERT INTO public.module_program_group VALUES (235, 'DO', 'Daily Delivery Report', NULL);
INSERT INTO public.module_program_group VALUES (236, 'IC', 'Finish Goods Receiving', 'Finish Goods Receiving');
INSERT INTO public.module_program_group VALUES (237, 'FA', 'Fixed Asset Register', 'Fixed Asset Register');
INSERT INTO public.module_program_group VALUES (238, 'FA', 'Fixed Assets Label', 'Fixed Assets Label');
INSERT INTO public.module_program_group VALUES (239, 'PO', 'Goods Receiving Note Report', 'Goods Receiving Note Report');
INSERT INTO public.module_program_group VALUES (240, 'IC', 'Inventory Balance Report By Warehoue', 'Inventory Balance Report By Warehoue');
INSERT INTO public.module_program_group VALUES (241, 'IC', 'Items', 'Items');
INSERT INTO public.module_program_group VALUES (242, 'IC', 'Item Lot Locations', 'Item Lot Locations');
INSERT INTO public.module_program_group VALUES (243, 'PO', 'Item Purchase History', 'Item Purchase History');
INSERT INTO public.module_program_group VALUES (244, 'PLN', 'Material Planner Workbench', 'Material Planner Workbench');
INSERT INTO public.module_program_group VALUES (245, 'CO', 'Order Status Report', 'Order Status Report');
INSERT INTO public.module_program_group VALUES (246, 'FA', 'Fixed Asset Transfer History', 'Fixed Asset Transfer History');
INSERT INTO public.module_program_group VALUES (247, 'IC', 'Work Center Material Transaction', 'Work Center Material Transaction');
INSERT INTO public.module_program_group VALUES (248, 'IC', 'Tag Barcode for Spare Part YTB', 'Tag Barcode for Spare Part YTB');
INSERT INTO public.module_program_group VALUES (249, 'PO', 'Vendor Contract Prices', 'Vendor Contract Prices');
INSERT INTO public.module_program_group VALUES (250, 'CO', 'Send Data', 'Send Data');
INSERT INTO public.module_program_group VALUES (251, 'FA', 'Fixed Asset Transfer History Report', 'Fixed Asset Transfer History Report');
INSERT INTO public.module_program_group VALUES (252, 'GL', 'Year End Closing Journal Entries', 'Year End Closing Journal Entries');
INSERT INTO public.module_program_group VALUES (253, 'SH', 'Order PickList', 'Order PickList');
INSERT INTO public.module_program_group VALUES (254, 'AP', 'AP Quick Payment Application', 'AP Quick Payment Application');
INSERT INTO public.module_program_group VALUES (255, 'IC', 'Item Stockroom Location Mass Creation', 'Item Stockroom Location Mass Creation');
INSERT INTO public.module_program_group VALUES (256, 'IC', 'Stock Card Report', NULL);
INSERT INTO public.module_program_group VALUES (257, 'Oth', 'Create Request', 'ART');
INSERT INTO public.module_program_group VALUES (258, 'SFC', 'Pending Material Transactions', 'Pending Material Transactions');
INSERT INTO public.module_program_group VALUES (259, 'SFC', 'Current Operations', 'Current Operations');
INSERT INTO public.module_program_group VALUES (260, 'PAJ', 'Price Adjustments', NULL);
INSERT INTO public.module_program_group VALUES (261, 'IC', 'Inventory Balance Report', NULL);
INSERT INTO public.module_program_group VALUES (262, 'IC', 'Inventory Month End Freeze Process', NULL);
INSERT INTO public.module_program_group VALUES (263, 'IC', 'Goods And Material Transaction Report', NULL);
INSERT INTO public.module_program_group VALUES (264, 'SFC', 'Job Status Change/Delete Utility', NULL);
INSERT INTO public.module_program_group VALUES (265, 'IC', 'Material Transactions', NULL);
INSERT INTO public.module_program_group VALUES (266, 'DO', 'Consolidate Invoices Workbench', NULL);
INSERT INTO public.module_program_group VALUES (267, 'IC', 'Inventory Consigned From Vendor Usage', 'Inventory Consigned From Vendor Usage');
INSERT INTO public.module_program_group VALUES (268, 'SFC', 'Pending Job Labor Transactions', 'Pending Job Labor Transactions');


--
-- Data for Name: modules; Type: TABLE DATA; Schema: public; Owner: tunited
--

INSERT INTO public.modules VALUES (27, 'ALL', 'ALL');
INSERT INTO public.modules VALUES (28, 'AM', 'AutoMotion');
INSERT INTO public.modules VALUES (29, 'AP', 'Accounts Payable');
INSERT INTO public.modules VALUES (30, 'APM', 'Appointment');
INSERT INTO public.modules VALUES (31, 'AR', 'Accounts Receivable');
INSERT INTO public.modules VALUES (32, 'Automation', 'Web Automation');
INSERT INTO public.modules VALUES (33, 'BC', 'Barcode');
INSERT INTO public.modules VALUES (34, 'BG', 'Budgets');
INSERT INTO public.modules VALUES (35, 'BOM', 'Bill of Materials');
INSERT INTO public.modules VALUES (36, 'CO', 'Customer Order');
INSERT INTO public.modules VALUES (37, 'Co-Product', 'Co-Product');
INSERT INTO public.modules VALUES (38, 'CSF', 'CashFlow');
INSERT INTO public.modules VALUES (39, 'CST', 'Costing');
INSERT INTO public.modules VALUES (40, 'CU', 'Customer');
INSERT INTO public.modules VALUES (41, 'CUR', 'Customer Rating');
INSERT INTO public.modules VALUES (42, 'Cycle', 'Cycle Count');
INSERT INTO public.modules VALUES (43, 'DO', 'Delivery Order');
INSERT INTO public.modules VALUES (44, 'EDI', 'EDI');
INSERT INTO public.modules VALUES (45, 'EVM', 'Event Management');
INSERT INTO public.modules VALUES (46, 'FA', 'Fixed Assets');
INSERT INTO public.modules VALUES (47, 'FC', 'Forecast');
INSERT INTO public.modules VALUES (48, 'FNS', 'Financial Statements');
INSERT INTO public.modules VALUES (49, 'FS', 'Field Service');
INSERT INTO public.modules VALUES (50, 'FTM', 'FTM');
INSERT INTO public.modules VALUES (51, 'GL', 'General Ledger');
INSERT INTO public.modules VALUES (52, 'IC', 'Inventory Control');
INSERT INTO public.modules VALUES (53, 'ISH', 'I-Cash');
INSERT INTO public.modules VALUES (54, 'Item', 'Item');
INSERT INTO public.modules VALUES (55, 'MAS', 'Master Data');
INSERT INTO public.modules VALUES (56, 'MB', 'Mobile');
INSERT INTO public.modules VALUES (57, 'MIA', 'Material Issue Approval');
INSERT INTO public.modules VALUES (58, 'Milk Run', 'Milk Run');
INSERT INTO public.modules VALUES (59, 'OLS', 'OLS');
INSERT INTO public.modules VALUES (60, 'Oth', 'Other');
INSERT INTO public.modules VALUES (61, 'PAJ', 'Price Adjustment');
INSERT INTO public.modules VALUES (62, 'PJC', 'Projects');
INSERT INTO public.modules VALUES (63, 'PLN', 'Planning');
INSERT INTO public.modules VALUES (64, 'PO', 'Purchase Order');
INSERT INTO public.modules VALUES (65, 'PR', 'Purchase Order Requisitions');
INSERT INTO public.modules VALUES (66, 'PS', 'Production Schedule');
INSERT INTO public.modules VALUES (67, 'QCS', 'Quality Control System');
INSERT INTO public.modules VALUES (68, 'RMA', 'RMA');
INSERT INTO public.modules VALUES (69, 'SA', 'System Administrator');
INSERT INTO public.modules VALUES (70, 'SC', 'Service Contract');
INSERT INTO public.modules VALUES (71, 'SCH', 'Scheduling');
INSERT INTO public.modules VALUES (72, 'SFC', 'Shop Floor Control / Job Order');
INSERT INTO public.modules VALUES (73, 'SH', 'Shipping');
INSERT INTO public.modules VALUES (74, 'Shipment', 'Shipment');
INSERT INTO public.modules VALUES (75, 'SRO', 'Service Orders');
INSERT INTO public.modules VALUES (76, 'System', 'System');
INSERT INTO public.modules VALUES (77, 'Technical', 'Technical');
INSERT INTO public.modules VALUES (78, 'TO', 'Transfer Order');
INSERT INTO public.modules VALUES (79, 'Update UC1', 'Update UC1');
INSERT INTO public.modules VALUES (80, 'VCN', 'Vendor Connect');
INSERT INTO public.modules VALUES (81, 'Vendors', 'Vendors');
INSERT INTO public.modules VALUES (82, 'VMI', 'Vendor Management');


--
-- Data for Name: program_types; Type: TABLE DATA; Schema: public; Owner: tunited
--

INSERT INTO public.program_types VALUES (1, 'Standard');
INSERT INTO public.program_types VALUES (2, 'Customized');


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: tunited
--

INSERT INTO public.roles VALUES (1, 'Customer', 'customer');
INSERT INTO public.roles VALUES (2, 'Agent', 'agent');
INSERT INTO public.roles VALUES (3, 'Admin', 'admin');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: tunited
--

INSERT INTO public.users VALUES (10, 'tee', 'supachai.athan@gmail.com', '$2a$10$Xe6Qgy0Ph3apKbiwzgJplOkFJ37yPr59BrlH4nljA9wL3Xa07/iHe', 'agent', '2026-06-02 13:32:36.225101', true, NULL, NULL, NULL);
INSERT INTO public.users VALUES (1, 'tunited', 'supachai.a@ppcc.co.th', '$2a$10$8TTaP1kOivDx6GiMtmxkv.ez/H2oCQCHZKCBPwE6i3NTc9ygJ5Qr2', 'Admin', '2026-05-26 09:32:28.57279', true, 'CUST001', NULL, NULL);
INSERT INTO public.users VALUES (11, 'somchai', 'supachai.athan@live.com', '$2a$10$VzzqwSpxtjy7eJRKciryOevSJSAG4toOtSf2yYYwo0zdJ9qUO9afS', 'Customer', '2026-06-02 13:32:54.76252', true, 'ADI', '9d69c77414c9895c41282dc848ce5629317f2e4cbc5d4a0fe43f3c9dcacb6868', '2026-06-05 00:40:32.81');


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tunited
--

SELECT pg_catalog.setval('public.customers_id_seq', 70, true);


--
-- Name: issue_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tunited
--

SELECT pg_catalog.setval('public.issue_types_id_seq', 4, true);


--
-- Name: module_program_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tunited
--

SELECT pg_catalog.setval('public.module_program_group_id_seq', 268, true);


--
-- Name: modules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tunited
--

SELECT pg_catalog.setval('public.modules_id_seq', 82, true);


--
-- Name: program_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tunited
--

SELECT pg_catalog.setval('public.program_types_id_seq', 2, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tunited
--

SELECT pg_catalog.setval('public.roles_id_seq', 6, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tunited
--

SELECT pg_catalog.setval('public.users_id_seq', 11, true);


--
-- PostgreSQL database dump complete
--

\unrestrict chSB9DgbdGuZXCZEGq3nhvrgqdGtCTa9WftNVmaykIjuuOzcNxfeBphPSbUHp9C

