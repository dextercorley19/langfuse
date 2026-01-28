-- CreateTable
CREATE TABLE "dataset_item_metadata_fields" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "dataset_item_id" TEXT NOT NULL,
    "field_name" TEXT NOT NULL,
    "field_value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dataset_item_metadata_fields_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dataset_item_metadata_fields_dataset_item_id_project_id_idx" ON "dataset_item_metadata_fields"("dataset_item_id", "project_id");

-- CreateIndex
CREATE INDEX "dataset_item_metadata_fields_project_id_idx" ON "dataset_item_metadata_fields"("project_id");
