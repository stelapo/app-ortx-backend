-- Up 
CREATE TABLE Category (id INTEGER PRIMARY KEY, name TEXT);
CREATE TABLE Post (id INTEGER PRIMARY KEY, categoryId INTEGER, title TEXT,
  CONSTRAINT Post_fk_categoryId FOREIGN KEY (categoryId)
    REFERENCES Category (id) ON UPDATE CASCADE ON DELETE CASCADE);

CREATE TABLE Chiavi (tipo TEXT, anno INTEGER, num INTEGER,
  CONSTRAINT Chiavi_pk PRIMARY KEY (tipo, anno));

INSERT INTO Category (id, name) VALUES (1, 'Business');
INSERT INTO Category (id, name) VALUES (2, 'Technology');
INSERT INTO Post (id, categoryId, title) VALUES (1, 2, 'My post on Technology');

--INSERT INTO Chiavi(tipo, anno, num) VALUES ('offers', strftime('%Y','now'), 0);
 
-- Down 
DROP TABLE Category
DROP TABLE Post;