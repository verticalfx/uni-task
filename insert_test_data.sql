# Insert data into the tables

USE bettys_books;

INSERT INTO books (name, price)VALUES('Brighton Rock', 20.25),('Brave New World', 25.00), ('Animal Farm', 12.99) ;

INSERT INTO authors (first_name, last_name)
VALUES
    ('Graham', 'Greene'),
    ('Aldous', 'Huxley'),
    ('George', 'Orwell'),
    ('J.K.', 'Rowling'),
    ('J.R.R.', 'Tolkien');

INSERT INTO book_authors (book_id, author_id)
VALUES
    (1, 1),  -- Brighton Rock by Graham Greene
    (2, 2),  -- Brave New World by Aldous Huxley
    (3, 3),  -- Animal Farm by George Orwell
    (4, 5), 
    (5, 4);  

INSERT INTO users (username, first_name, last_name, email_address, password)
VALUES
    ('alice', 'Alice', 'Smith', 'alice@example.com', 'password1'),
    ('bob', 'Bob', 'Jones', 'bob@example.com', 'password2'),
    ('charlie', 'Charlie', 'Brown', 'charlie@example.com', 'password3');

INSERT INTO reviews (book_id, user_id, rating, review_text)
VALUES
    (1, 1, 5, 'A gripping tale of crime.'),
    (2, 2, 4, 'A thought-provoking novel on the future.'),
    (3, 1, 5, 'A timeless political allegory.'),
    (3, 3, 4, 'Engaging and insightful.'),
    (2, 3, 3, 'A bit too dystopian for my taste.');

CALL AddBookAndAuthor(`Harry Potter and the Sorcerer's Stone`, 29.99, `J.K.`, `Rowling`);
CALL AddBookAndAuthor(`The Hobbit`, 12.99, `J.R.R.`, `Tolkien`);