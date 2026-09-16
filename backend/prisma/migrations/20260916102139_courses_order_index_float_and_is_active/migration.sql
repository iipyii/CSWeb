-- Allow non-integer order_index values (e.g. 6.5) so a section can be sorted
-- between two existing whole-number positions without reusing an integer that
-- CourseDetail.jsx's sectionTitles map already keys off for a different,
-- single-topic section in another program/year.
ALTER TABLE "courses" ALTER COLUMN "order_index" TYPE DOUBLE PRECISION;

-- Lets a course section be hidden from the public curriculum detail page
-- without deleting its row (mirrors the existing banners.is_active pattern).
ALTER TABLE "courses" ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;
