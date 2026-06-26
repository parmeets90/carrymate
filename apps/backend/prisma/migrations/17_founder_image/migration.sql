-- Add an optional photo URL to founders (falls back to initials avatar when empty).
ALTER TABLE "founders" ADD COLUMN "image_url" VARCHAR(400) NOT NULL DEFAULT '';
