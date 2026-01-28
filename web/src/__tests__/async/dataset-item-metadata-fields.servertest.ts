/** @jest-environment node */

import { prisma } from "@langfuse/shared/src/db";
import {
  createOrgProjectAndApiKey,
  createDatasetItem,
  createDatasetItemMetadataField,
  getDatasetItemMetadataFields,
  updateDatasetItemMetadataField,
  deleteDatasetItemMetadataField,
} from "@langfuse/shared/src/server";

describe("Dataset Item Metadata Fields", () => {
  let projectId: string;
  let datasetId: string;
  let datasetItemId: string;

  beforeEach(async () => {
    const { projectId: newProjectId } = await createOrgProjectAndApiKey();
    projectId = newProjectId;

    // Create a dataset
    const dataset = await prisma.dataset.create({
      data: {
        name: "test-dataset",
        projectId,
      },
    });
    datasetId = dataset.id;

    // Create a dataset item
    const itemResult = await createDatasetItem({
      projectId,
      datasetId,
      input: { question: "What is 2+2?" },
      expectedOutput: { answer: "4" },
    });

    if (!itemResult.success) {
      throw new Error("Failed to create dataset item");
    }

    datasetItemId = itemResult.datasetItem.id;
  });

  it("should create a metadata field for a dataset item", async () => {
    const field = await createDatasetItemMetadataField({
      projectId,
      datasetItemId,
      fieldName: "test-field",
      fieldValue: "test-value",
    });

    expect(field.id).toBeDefined();
    expect(field.fieldName).toBe("test-field");
    expect(field.fieldValue).toBe("test-value");
    expect(field.datasetItemId).toBe(datasetItemId);
    expect(field.projectId).toBe(projectId);
  });

  it("should get all metadata fields for a dataset item", async () => {
    await createDatasetItemMetadataField({
      projectId,
      datasetItemId,
      fieldName: "field1",
      fieldValue: "value1",
    });

    await createDatasetItemMetadataField({
      projectId,
      datasetItemId,
      fieldName: "field2",
      fieldValue: "value2",
    });

    const fields = await getDatasetItemMetadataFields({
      projectId,
      datasetItemId,
    });

    expect(fields).toHaveLength(2);
    expect(fields[0]?.fieldName).toBe("field1");
    expect(fields[1]?.fieldName).toBe("field2");
  });

  it("should update a metadata field", async () => {
    const field = await createDatasetItemMetadataField({
      projectId,
      datasetItemId,
      fieldName: "original-name",
      fieldValue: "original-value",
    });

    const updated = await updateDatasetItemMetadataField({
      projectId,
      fieldId: field.id,
      fieldName: "updated-name",
      fieldValue: "updated-value",
    });

    expect(updated.fieldName).toBe("updated-name");
    expect(updated.fieldValue).toBe("updated-value");
  });

  it("should delete a metadata field", async () => {
    const field = await createDatasetItemMetadataField({
      projectId,
      datasetItemId,
      fieldName: "to-delete",
      fieldValue: "value",
    });

    await deleteDatasetItemMetadataField({
      projectId,
      fieldId: field.id,
    });

    const fields = await getDatasetItemMetadataFields({
      projectId,
      datasetItemId,
    });

    expect(fields).toHaveLength(0);
  });

  it("should handle multiple fields with the same name", async () => {
    await createDatasetItemMetadataField({
      projectId,
      datasetItemId,
      fieldName: "duplicate",
      fieldValue: "value1",
    });

    await createDatasetItemMetadataField({
      projectId,
      datasetItemId,
      fieldName: "duplicate",
      fieldValue: "value2",
    });

    const fields = await getDatasetItemMetadataFields({
      projectId,
      datasetItemId,
    });

    expect(fields).toHaveLength(2);
    expect(fields.filter((f) => f.fieldName === "duplicate")).toHaveLength(2);
  });

  it("should return empty array when no metadata fields exist", async () => {
    const fields = await getDatasetItemMetadataFields({
      projectId,
      datasetItemId,
    });

    expect(fields).toHaveLength(0);
  });
});
