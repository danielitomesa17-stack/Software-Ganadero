ALTER TABLE sanidad ADD COLUMN hacienda_id INT NOT NULL AFTER id;
-- Optional: add index for faster lookups
CREATE INDEX idx_sanidad_hacienda_id ON sanidad (hacienda_id);
