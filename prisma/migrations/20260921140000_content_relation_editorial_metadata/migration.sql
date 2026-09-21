-- Make generic content relationships usable as an editorial, ordered graph.
ALTER TABLE "content_relations"
ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "note" TEXT;

CREATE INDEX "content_relations_sourceType_sourceId_sortOrder_idx"
ON "content_relations"("sourceType", "sourceId", "sortOrder");

CREATE INDEX "content_relations_targetType_targetId_sortOrder_idx"
ON "content_relations"("targetType", "targetId", "sortOrder");
