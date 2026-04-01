
-- Update existing book categories to match new system
UPDATE public.books SET category = 'CSE' WHERE category = 'Computer Science' AND department = 'CSE';
UPDATE public.books SET category = 'ECE' WHERE category = 'Engineering' AND department = 'ECE';
UPDATE public.books SET category = 'MECH' WHERE category = 'Engineering' AND department = 'MECH';
UPDATE public.books SET category = 'Science & Humanities' WHERE category IN ('Mathematics', 'Science') AND department IN ('Math', 'Physics');

-- Add ECE books
INSERT INTO public.books (title, author, isbn, category, department, description, publisher, year, edition, pages, total_copies, available_copies) VALUES
('Electronic Devices and Circuit Theory', 'Robert Boylestad', '978-0132622264', 'ECE', 'ECE', 'Comprehensive coverage of electronic devices.', 'Pearson', 2012, '11th', 912, 4, 3),
('Microelectronic Circuits', 'Adel Sedra, Kenneth Smith', '978-0199339136', 'ECE', 'ECE', 'The gold standard in analog and digital circuits.', 'Oxford', 2014, '7th', 1648, 3, 2),
('Communication Systems', 'Simon Haykin', '978-0471697909', 'ECE', 'ECE', 'Introduction to analog and digital communication.', 'Wiley', 2006, '4th', 816, 3, 2),
('Signals and Systems', 'Alan Oppenheim', '978-0138147570', 'ECE', 'ECE', 'Classic textbook on signals and systems analysis.', 'Pearson', 1996, '2nd', 957, 4, 3);

-- Add EEE books
INSERT INTO public.books (title, author, isbn, category, department, description, publisher, year, edition, pages, total_copies, available_copies) VALUES
('Power System Engineering', 'D.P. Kothari', '978-0070647916', 'EEE', 'EEE', 'Comprehensive power systems textbook.', 'McGraw-Hill', 2008, '2nd', 756, 4, 3),
('Electrical Machines', 'I.J. Nagrath', '978-0070699670', 'EEE', 'EEE', 'Theory and practice of electrical machines.', 'McGraw-Hill', 2010, '4th', 688, 3, 2),
('Control Systems Engineering', 'Norman Nise', '978-1118170519', 'EEE', 'EEE', 'Modern approach to control systems.', 'Wiley', 2015, '7th', 944, 4, 3),
('Principles of Electric Circuits', 'Thomas Floyd', '978-0134879482', 'EEE', 'EEE', 'Conventional current version of circuit analysis.', 'Pearson', 2017, '10th', 1008, 3, 2);

-- Add MECH books
INSERT INTO public.books (title, author, isbn, category, department, description, publisher, year, edition, pages, total_copies, available_copies) VALUES
('Strength of Materials', 'R.K. Rajput', '978-8121935340', 'MECH', 'MECH', 'Mechanics of solids for engineering students.', 'S. Chand', 2015, '6th', 892, 4, 3),
('Theory of Machines', 'S.S. Rattan', '978-9352533558', 'MECH', 'MECH', 'Kinematics and dynamics of machinery.', 'McGraw-Hill', 2014, '5th', 708, 3, 2),
('Fluid Mechanics', 'R.K. Bansal', '978-8131808153', 'MECH', 'MECH', 'Hydraulics and fluid mechanics.', 'Laxmi Publications', 2017, '9th', 1100, 4, 3),
('Manufacturing Technology', 'P.N. Rao', '978-0070087699', 'MECH', 'MECH', 'Foundry, forming and welding.', 'McGraw-Hill', 2013, '3rd', 464, 3, 2);

-- Add CIVIL books
INSERT INTO public.books (title, author, isbn, category, department, description, publisher, year, edition, pages, total_copies, available_copies) VALUES
('Surveying Vol. 1', 'B.C. Punmia', '978-8131806296', 'CIVIL', 'CIVIL', 'Fundamental surveying for civil engineers.', 'Laxmi Publications', 2015, '16th', 768, 4, 3),
('Structural Analysis', 'Aslam Kassimali', '978-1305142893', 'CIVIL', 'CIVIL', 'Theory and applications of structural analysis.', 'Cengage', 2014, '5th', 912, 3, 2),
('Soil Mechanics', 'B.M. Das', '978-0190209667', 'CIVIL', 'CIVIL', 'Principles of geotechnical engineering.', 'Oxford', 2016, '8th', 740, 4, 3),
('Reinforced Concrete Design', 'S. Unnikrishna Pillai', '978-0070141100', 'CIVIL', 'CIVIL', 'Design of reinforced concrete structures.', 'McGraw-Hill', 2013, '3rd', 544, 3, 2);

-- Add Science & Humanities books
INSERT INTO public.books (title, author, isbn, category, department, description, publisher, year, edition, pages, total_copies, available_copies) VALUES
('Engineering Chemistry', 'Jain & Jain', '978-8177585168', 'Science & Humanities', NULL, 'Chemistry for engineering students.', 'Dhanpat Rai', 2018, '16th', 628, 5, 4),
('Technical English', 'M. Ashraf Rizvi', '978-0070599642', 'Science & Humanities', NULL, 'Effective communication skills.', 'McGraw-Hill', 2005, '1st', 432, 4, 3);

-- Add SSC Book Bank books
INSERT INTO public.books (title, author, isbn, category, department, description, publisher, year, edition, pages, total_copies, available_copies) VALUES
('Quantitative Aptitude', 'R.S. Aggarwal', '978-9352534029', 'SSC Book Bank', NULL, 'For competitive examinations.', 'S. Chand', 2017, '7th', 920, 6, 5),
('General Knowledge 2024', 'Manohar Pandey', '978-9311126067', 'SSC Book Bank', NULL, 'Comprehensive GK for all exams.', 'Arihant', 2024, '1st', 560, 5, 4),
('Reasoning Ability', 'M.K. Pandey', '978-9350127833', 'SSC Book Bank', NULL, 'Analytical and logical reasoning.', 'BSC Publishing', 2018, '2nd', 648, 4, 3);

-- Add Stories books
INSERT INTO public.books (title, author, isbn, category, department, description, publisher, year, edition, pages, total_copies, available_copies) VALUES
('The Alchemist', 'Paulo Coelho', '978-0062315007', 'Stories', NULL, 'A fable about following your dream.', 'HarperOne', 1988, '25th Anniversary', 197, 5, 4),
('Wings of Fire', 'A.P.J. Abdul Kalam', '978-8173711466', 'Stories', NULL, 'Autobiography of APJ Abdul Kalam.', 'Universities Press', 1999, '1st', 180, 4, 3),
('The White Tiger', 'Aravind Adiga', '978-1416562603', 'Stories', NULL, 'A darkly humorous novel set in India.', 'Free Press', 2008, '1st', 321, 3, 2),
('Train to Pakistan', 'Khushwant Singh', '978-0143065883', 'Stories', NULL, 'A novel about the partition of India.', 'Penguin', 1956, 'Reprint', 181, 3, 2);
