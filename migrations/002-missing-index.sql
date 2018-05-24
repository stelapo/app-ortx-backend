-- Up 
CREATE INDEX Post_ix_categoryId ON Post (categoryId);
 
-- Down 
DROP INDEX Post_ix_categoryId;