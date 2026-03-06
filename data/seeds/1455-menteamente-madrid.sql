-- Task 1455: Add menteAmente Psychiatry - Mental Health - Madrid
-- Data entry by subagent
-- Private psychiatrist and psychotherapist in Madrid with English-speaking team

INSERT INTO directory_entries (name, category, description, address, city, province, phone, email, website, speaks_english, is_featured, is_verified, is_claimed, created_at, updated_at) VALUES

('menteAmente Psychiatry', 'Mental Health', 'Private psychiatrist and psychotherapist practice in Madrid led by Dr. David López. English-speaking team includes child and adolescent psychiatrists, clinical psychologists, and neuropsychologists. Provides comprehensive mental health services including psychiatric evaluation, psychotherapy, cognitive-behavioral therapy (CBT), family therapy, and neuropsychological assessment. Specializes in treating anxiety, depression, ADHD, autism spectrum disorders, eating disorders, and other mental health conditions. The multidisciplinary team offers personalized treatment plans for children, adolescents, and adults. Located in the Retiro district in central Madrid.', 'Retiro, Madrid', 'Madrid', 'Madrid', '+34 918 266 366', 'info@menteamente.com', 'https://www.menteamente.com', true, false, true, false, NOW(), NOW());
