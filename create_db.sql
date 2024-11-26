-- Drop existing tables to prevent duplication errors
DROP TABLE IF EXISTS book_authors;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS authors;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS books;

-- Drop the database if it exists
DROP DATABASE IF EXISTS bettys_books;

-- Create the database
CREATE DATABASE bettys_books;
USE bettys_books;

-- Create the tables
CREATE TABLE books (
    id INT AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    price DECIMAL(5, 2) NOT NULL CHECK (price >= 0),
    PRIMARY KEY(id),
    UNIQUE (name)
);

CREATE TABLE users (
    id INT AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email_address VARCHAR(50),
    password VARCHAR(255),
    PRIMARY KEY(id),
    UNIQUE (username)
);

CREATE TABLE authors (
    id INT AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    PRIMARY KEY(id),
    UNIQUE (first_name, last_name)
);

CREATE TABLE book_authors (
    book_id INT,
    author_id INT,
    PRIMARY KEY(book_id, author_id),
    FOREIGN KEY(book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY(author_id) REFERENCES authors(id) ON DELETE CASCADE
);

CREATE TABLE reviews (
    id INT AUTO_INCREMENT,
    book_id INT NOT NULL,
    user_id INT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    PRIMARY KEY(id),
    FOREIGN KEY(book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(book_id, user_id)
);

-- Insert initial data into the tables
INSERT INTO books (name, price) VALUES
    ('To Kill a Mockingbird', 12.99),
    ('The Catcher in the Rye', 9.99),
    ('Pride and Prejudice', 14.49),
    ('Moby Dick', 18.50),
    ('War and Peace', 25.99),
    ('Hamlet', 7.50);

    INSERT INTO authors (first_name, last_name) VALUES
    ('Harper', 'Lee'),
    ('J.D.', 'Salinger'),
    ('Jane', 'Austen'),
    ('Herman', 'Melville'),
    ('Leo', 'Tolstoy'),
    ('William', 'Shakespeare');

INSERT INTO book_authors (book_id, author_id) VALUES
    (1, 1), -- 'To Kill a Mockingbird' by Harper Lee
    (2, 2), -- 'The Catcher in the Rye' by J.D. Salinger
    (3, 3), -- 'Pride and Prejudice' by Jane Austen
    (4, 4), -- 'Moby Dick' by Herman Melville
    (5, 5), -- 'War and Peace' by Leo Tolstoy
    (6, 6); -- 'Hamlet' by William Shakespeare

INSERT INTO users (username, first_name, last_name, email_address, password) VALUES
    ('reader1', 'Alice', 'Wonderland', 'alice@example.com', 'password4'),
    ('reader2', 'Bob', 'Builder', 'bob@example.com', 'password5'),
    ('reader3', 'Charlie', 'Brown', 'charlie@example.com', 'password6'),
    ('reader4', 'Diana', 'Prince', 'diana@example.com', 'password7'),
    ('reader5', 'Eve', 'Adams', 'eve@example.com', 'password8');

INSERT INTO reviews (book_id, user_id, rating, review_text) VALUES
    (1, 1, 5, 'A beautifully written classic.'),              -- 'To Kill a Mockingbird' by reader1
    (2, 2, 4, 'A poignant story of teenage angst.'),          -- 'The Catcher in the Rye' by reader2
    (3, 3, 5, 'Timeless romance and social critique.'),       -- 'Pride and Prejudice' by reader3
    (4, 4, 3, 'A challenging read but rewarding.'),           -- 'Moby Dick' by reader4
    (5, 5, 5, 'A masterpiece of epic proportions.'),          -- 'War and Peace' by reader5
    (6, 1, 4, 'A classic play with timeless themes.'),        -- 'Hamlet' by reader1
    (3, 2, 4, 'An engaging and insightful critique.'),        -- 'Pride and Prejudice' by reader2
    (5, 3, 5, 'An unforgettable epic about love and war.'),   -- 'War and Peace' by reader3
    (6, 4, 5, 'Shakespeare at his finest.'),                  -- 'Hamlet' by reader4
    (4, 5, 4, 'A complex and rewarding tale of the sea.');    -- 'Moby Dick' by reader5


-- Create the stored procedures
DELIMITER //

CREATE PROCEDURE AddBookAndAuthor(
    IN bookName VARCHAR(50), 
    IN bookPrice DECIMAL(5, 2), 
    IN authorFirstName VARCHAR(50),
    IN authorLastName VARCHAR(50)
)
BEGIN
    DECLARE authorID INT;
    DECLARE bookID INT;

    SELECT id INTO authorID FROM authors
    WHERE first_name = authorFirstName AND last_name = authorLastName
    LIMIT 1;

    IF authorID IS NULL THEN
        INSERT INTO authors (first_name, last_name)
        VALUES (authorFirstName, authorLastName);
        SET authorID = LAST_INSERT_ID();
    END IF;

    INSERT INTO books (name, price)
    VALUES (bookName, bookPrice);
    SET bookID = LAST_INSERT_ID();

    INSERT INTO book_authors (book_id, author_id)
    VALUES (bookID, authorID);
END
//

CREATE PROCEDURE AddAnonymousReview(
    IN in_bookName VARCHAR(50),
    IN in_username VARCHAR(50),
    IN in_userRating TINYINT
)
BEGIN
    DECLARE userID INT;
    DECLARE bookID INT;
    DECLARE reviewExists INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Transaction failed and was rolled back.';
    END;

    START TRANSACTION;

    IF in_userRating < 1 OR in_userRating > 5 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Rating must be between 1 and 5.';
    END IF;

    SELECT id INTO userID FROM users WHERE username = in_username LIMIT 1;

    IF userID IS NULL THEN
        INSERT INTO users (username, first_name, last_name, email_address, password)
        VALUES (in_username, 'Anonymous', '', '', '');
        SET userID = LAST_INSERT_ID();
    END IF;

    -- Check if the book exists
    SELECT id INTO bookID FROM books WHERE name = in_bookName LIMIT 1;

    IF bookID IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Book not found.';
    END IF;

    SELECT COUNT(*) INTO reviewExists FROM reviews WHERE book_id = bookID AND user_id = userID;

    IF reviewExists > 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User has already reviewed this book.';
    END IF;

    INSERT INTO reviews (book_id, user_id, rating, review_text)
    VALUES (bookID, userID, in_userRating, '');

    COMMIT;
END;
//

DELIMITER ;

CREATE VIEW vw_books_and_authors AS
SELECT 
    b.name AS book_name, 
    CONCAT(a.first_name, ' ', a.last_name) AS author_name, 
    b.price AS book_price
FROM 
    books b
JOIN 
    book_authors ba ON b.id = ba.book_id
JOIN 
    authors a ON ba.author_id = a.id;

CREATE VIEW vw_books_and_reviews AS
SELECT 
    u.username, 
    b.name AS book_name, 
    r.rating AS review_rating
FROM 
    reviews r
JOIN 
    books b ON r.book_id = b.id
JOIN 
    users u ON r.user_id = u.id;


-- Create the app user and grant privileges
CREATE USER IF NOT EXISTS 'bettys_books_app'@'localhost' IDENTIFIED BY 'qwertyuiop';
GRANT ALL PRIVILEGES ON bettys_books.* TO 'bettys_books_app'@'localhost';
