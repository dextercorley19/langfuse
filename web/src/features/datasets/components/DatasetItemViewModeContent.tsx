import type { DatasetItemDomain } from "@langfuse/shared";
import {
  stringifyDatasetItemData,
  type DatasetSchema,
} from "../utils/datasetItemUtils";
import { DatasetItemFields } from "@/src/features/datasets/components/DatasetItemFields";
import { DatasetItemMetadataFields } from "@/src/features/datasets/components/DatasetItemMetadataFields";
import { useRouter } from "next/router";
import { useHasProjectAccess } from "@/src/features/rbac/utils/checkProjectAccess";

type DatasetItemViewModeContentProps = {
  item: DatasetItemDomain | null;
  isLoading: boolean;
  dataset: DatasetSchema | null;
};

/**
 * Renders the latest version of a dataset item in view mode.
 * Handles loading and not-found states.
 */
export const DatasetItemViewModeContent = ({
  item,
  isLoading,
  dataset,
}: DatasetItemViewModeContentProps) => {
  const router = useRouter();
  const projectId = router.query.projectId as string;
  const hasEditAccess = useHasProjectAccess({
    projectId,
    scope: "datasets:CUD",
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  if (item === null) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="text-muted-foreground">
          <p className="text-lg font-medium">Dataset item not found</p>
          <p className="mt-2 text-sm">
            This dataset item does not exist or has been deleted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <DatasetItemFields
        inputValue={stringifyDatasetItemData(item.input)}
        expectedOutputValue={stringifyDatasetItemData(item.expectedOutput)}
        metadataValue={stringifyDatasetItemData(item.metadata)}
        dataset={dataset}
        editable={false}
      />
      <DatasetItemMetadataFields
        projectId={projectId}
        datasetItemId={item.id}
        hasEditAccess={hasEditAccess}
      />
    </div>
  );
};
