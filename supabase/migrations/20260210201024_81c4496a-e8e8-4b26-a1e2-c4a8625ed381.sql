-- Reassign s.ghayoumi to Wendelstein-DEMO
UPDATE user_profiles SET organization_id = '7ee02750-22a3-4145-a027-85f2ce3c8b49' WHERE id = '19036f2a-8a21-44df-a40a-bd57e153132c';

-- Insert 5 demo employees for Wendelstein-DEMO
INSERT INTO employees (full_name, organization_id, team_role, overall_score, is_active) VALUES
('Laura Weber', '7ee02750-22a3-4145-a027-85f2ce3c8b49', 'Senior Associate', 72, true),
('Maximilian Richter', '7ee02750-22a3-4145-a027-85f2ce3c8b49', 'Associate', 58, true),
('Sophie Braun', '7ee02750-22a3-4145-a027-85f2ce3c8b49', 'Junior Associate', 45, true),
('Tobias Fischer', '7ee02750-22a3-4145-a027-85f2ce3c8b49', 'Partner', 85, true),
('Elena Hoffmann', '7ee02750-22a3-4145-a027-85f2ce3c8b49', 'Senior Associate', 68, true);