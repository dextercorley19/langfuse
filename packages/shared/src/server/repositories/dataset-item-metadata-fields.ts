import { prisma } from "../../db";
import { LangfuseNotFoundError } from "../../errors";

export type DatasetItemMetadataFieldInput = {
  id?: string;
  projectId: string;
  datasetItemId: string;
  fieldName: string;
  fieldValue: string;
};

export type DatasetItemMetadataField = {
  id: string;
  projectId: string;
  datasetItemId: string;
  fieldName: string;
  fieldValue: string;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Get all metadata fields for a dataset item
 */
export async function getDatasetItemMetadataFields(params: {
  projectId: string;
  datasetItemId: string;
}): Promise<DatasetItemMetadataField[]> {
  const fields = await prisma.datasetItemMetadataField.findMany({
    where: {
      projectId: params.projectId,
      datasetItemId: params.datasetItemId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return fields;
}

/**
 * Get a single metadata field by ID
 */
export async function getDatasetItemMetadataFieldById(params: {
  projectId: string;
  fieldId: string;
}): Promise<DatasetItemMetadataField> {
  const field = await prisma.datasetItemMetadataField.findFirst({
    where: {
      id: params.fieldId,
      projectId: params.projectId,
    },
  });

  if (!field) {
    throw new LangfuseNotFoundError(
      `Metadata field ${params.fieldId} not found`,
    );
  }

  return field;
}

/**
 * Create a new metadata field for a dataset item
 */
export async function createDatasetItemMetadataField(
  params: DatasetItemMetadataFieldInput,
): Promise<DatasetItemMetadataField> {
  const field = await prisma.datasetItemMetadataField.create({
    data: {
      projectId: params.projectId,
      datasetItemId: params.datasetItemId,
      fieldName: params.fieldName,
      fieldValue: params.fieldValue,
    },
  });

  return field;
}

/**
 * Update an existing metadata field
 */
export async function updateDatasetItemMetadataField(params: {
  projectId: string;
  fieldId: string;
  fieldName?: string;
  fieldValue?: string;
}): Promise<DatasetItemMetadataField> {
  // Verify the field exists and belongs to the project
  await getDatasetItemMetadataFieldById({
    projectId: params.projectId,
    fieldId: params.fieldId,
  });

  const field = await prisma.datasetItemMetadataField.update({
    where: {
      id: params.fieldId,
    },
    data: {
      ...(params.fieldName !== undefined && { fieldName: params.fieldName }),
      ...(params.fieldValue !== undefined && { fieldValue: params.fieldValue }),
      updatedAt: new Date(),
    },
  });

  return field;
}

/**
 * Delete a metadata field
 */
export async function deleteDatasetItemMetadataField(params: {
  projectId: string;
  fieldId: string;
}): Promise<void> {
  // Verify the field exists and belongs to the project
  await getDatasetItemMetadataFieldById({
    projectId: params.projectId,
    fieldId: params.fieldId,
  });

  await prisma.datasetItemMetadataField.delete({
    where: {
      id: params.fieldId,
    },
  });
}

/**
 * Delete all metadata fields for a dataset item
 */
export async function deleteDatasetItemMetadataFieldsByItemId(params: {
  projectId: string;
  datasetItemId: string;
}): Promise<void> {
  await prisma.datasetItemMetadataField.deleteMany({
    where: {
      projectId: params.projectId,
      datasetItemId: params.datasetItemId,
    },
  });
}
