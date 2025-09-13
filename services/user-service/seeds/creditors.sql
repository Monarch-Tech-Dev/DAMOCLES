-- Seed data for Norwegian creditors
INSERT INTO creditors (id, name, organization_number, type, privacy_email, violation_score, total_violations, average_settlement_rate, is_active, created_at, updated_at) VALUES
-- Major debt collection agencies
('cred_001', 'Lindorff AS', '982463718', 'inkasso', 'personvern@lindorff.no', 2.5, 15, 0.65, true, NOW(), NOW()),
('cred_002', 'Lowell Norge AS', '994736587', 'inkasso', 'privacy@lowellnorge.no', 3.2, 28, 0.58, true, NOW(), NOW()),
('cred_003', 'Aktiv Kapital AS', '985736294', 'inkasso', 'gdpr@aktivkapital.no', 1.8, 8, 0.72, true, NOW(), NOW()),
('cred_004', 'B2 Impact AS', '924736582', 'inkasso', 'personvern@b2impact.no', 4.1, 42, 0.45, true, NOW(), NOW()),

-- Banks
('cred_005', 'DNB Bank ASA', '984851006', 'bank', 'personvern@dnb.no', 1.2, 3, 0.80, true, NOW(), NOW()),
('cred_006', 'Nordea Bank Norge ASA', '920058817', 'bank', 'personvern.norge@nordea.com', 0.8, 2, 0.85, true, NOW(), NOW()),
('cred_007', 'Sparebank 1 SR-Bank ASA', '937895321', 'bank', 'personvern@sr-bank.no', 0.5, 1, 0.90, true, NOW(), NOW()),

-- BNPL/Fintech
('cred_008', 'Klarna Bank AB', '556737649', 'bnpl', 'privacy-no@klarna.com', 2.8, 22, 0.62, true, NOW(), NOW()),
('cred_009', 'Vipps AS', '918713867', 'bnpl', 'personvern@vipps.no', 1.1, 5, 0.78, true, NOW(), NOW()),
('cred_010', 'Santander Consumer Bank AS', '977155436', 'consumer_finance', 'personvern@santanderconsumer.no', 2.1, 12, 0.68, true, NOW(), NOW()),

-- Telecom
('cred_011', 'Telenor Norge AS', '960782687', 'telecom', 'personvern@telenor.no', 1.5, 7, 0.75, true, NOW(), NOW()),
('cred_012', 'Telia Norge AS', '951895498', 'telecom', 'personvern@telia.no', 1.3, 6, 0.77, true, NOW(), NOW()),

-- Utilities
('cred_013', 'Hafslund Strøm AS', '980489698', 'utility', 'personvern@hafslundstrom.no', 1.0, 4, 0.82, true, NOW(), NOW()),
('cred_014', 'Fjordkraft AS', '918458018', 'utility', 'personvern@fjordkraft.no', 0.9, 3, 0.84, true, NOW(), NOW()),

-- Smaller agencies
('cred_015', 'Kredinor AS', '950539795', 'inkasso', 'privacy@kredinor.no', 3.5, 31, 0.52, true, NOW(), NOW()),
('cred_016', 'Intrum Norge AS', '976067630', 'inkasso', 'personvern@intrum.no', 2.9, 25, 0.61, true, NOW(), NOW()),
('cred_017', 'Collector Bank AS', '556560017', 'inkasso', 'personvernombud@collector.no', 3.8, 38, 0.48, true, NOW(), NOW()),
('cred_018', 'Axactor Norge AS', '979251735', 'inkasso', 'personvern@axactor.no', 4.2, 45, 0.42, true, NOW(), NOW()),

-- Subscription services
('cred_019', 'Netflix Norge', '994106005', 'subscription', 'privacy@netflix.com', 0.3, 1, 0.95, true, NOW(), NOW()),
('cred_020', 'Spotify Norge AS', '994568107', 'subscription', 'privacy@spotify.no', 0.2, 0, 0.98, true, NOW(), NOW());