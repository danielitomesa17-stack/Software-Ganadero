ALTER TABLE animales ADD COLUMN hacienda_id INT NOT NULL;
CREATE INDEX idx_animales_hacienda_id ON animales (hacienda_id);
