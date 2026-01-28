import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { api } from "@/src/utils/api";
import { Pencil, Plus, Trash2, X, Check } from "lucide-react";
import { useState } from "react";
import { usePostHogClientCapture } from "@/src/features/posthog-analytics/usePostHogClientCapture";

type MetadataField = {
  id: string;
  fieldName: string;
  fieldValue: string;
  createdAt: Date;
  updatedAt: Date;
};

export function DatasetItemMetadataFields({
  projectId,
  datasetItemId,
  hasEditAccess,
}: {
  projectId: string;
  datasetItemId: string;
  hasEditAccess: boolean;
}) {
  const capture = usePostHogClientCapture();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newField, setNewField] = useState({ name: "", value: "" });
  const [editField, setEditField] = useState({ name: "", value: "" });

  const utils = api.useUtils();

  const { data: fields, isLoading } =
    api.datasets.getDatasetItemMetadataFields.useQuery({
      projectId,
      datasetItemId,
    });

  const createMutation =
    api.datasets.createDatasetItemMetadataField.useMutation({
      onSuccess: () => {
        utils.datasets.getDatasetItemMetadataFields.invalidate();
        setNewField({ name: "", value: "" });
        setIsAdding(false);
        capture("dataset_item_metadata_field:create");
      },
    });

  const updateMutation =
    api.datasets.updateDatasetItemMetadataField.useMutation({
      onSuccess: () => {
        utils.datasets.getDatasetItemMetadataFields.invalidate();
        setEditingId(null);
        capture("dataset_item_metadata_field:update");
      },
    });

  const deleteMutation =
    api.datasets.deleteDatasetItemMetadataField.useMutation({
      onSuccess: () => {
        utils.datasets.getDatasetItemMetadataFields.invalidate();
        capture("dataset_item_metadata_field:delete");
      },
    });

  const handleCreate = () => {
    if (!newField.name.trim()) return;
    createMutation.mutate({
      projectId,
      datasetItemId,
      fieldName: newField.name.trim(),
      fieldValue: newField.value,
    });
  };

  const handleUpdate = (fieldId: string) => {
    if (!editField.name.trim()) return;
    updateMutation.mutate({
      projectId,
      fieldId,
      fieldName: editField.name.trim(),
      fieldValue: editField.value,
    });
  };

  const handleDelete = (fieldId: string) => {
    if (window.confirm("Are you sure you want to delete this field?")) {
      deleteMutation.mutate({ projectId, fieldId });
    }
  };

  const startEdit = (field: MetadataField) => {
    setEditingId(field.id);
    setEditField({ name: field.fieldName, value: field.fieldValue });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditField({ name: "", value: "" });
  };

  if (isLoading) {
    return <div>Loading metadata fields...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Metadata Fields</h3>
        {hasEditAccess && !isAdding && (
          <Button variant="outline" size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Field
          </Button>
        )}
      </div>

      {fields && fields.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Field Name</TableHead>
              <TableHead>Field Value</TableHead>
              {hasEditAccess && <TableHead className="w-24">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field) => (
              <TableRow key={field.id}>
                {editingId === field.id ? (
                  <>
                    <TableCell>
                      <Input
                        value={editField.name}
                        onChange={(e) =>
                          setEditField({ ...editField, name: e.target.value })
                        }
                        placeholder="Field name"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editField.value}
                        onChange={(e) =>
                          setEditField({ ...editField, value: e.target.value })
                        }
                        placeholder="Field value"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleUpdate(field.id)}
                          disabled={updateMutation.isPending}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={cancelEdit}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className="font-medium">
                      {field.fieldName}
                    </TableCell>
                    <TableCell>{field.fieldValue}</TableCell>
                    {hasEditAccess && (
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => startEdit(field)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleDelete(field.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-sm text-muted-foreground">
          No metadata fields defined.
        </p>
      )}

      {isAdding && (
        <div className="space-y-2 rounded-lg border p-4">
          <h4 className="text-sm font-medium">Add New Field</h4>
          <div className="grid grid-cols-2 gap-2">
            <Input
              value={newField.name}
              onChange={(e) =>
                setNewField({ ...newField, name: e.target.value })
              }
              placeholder="Field name"
            />
            <Input
              value={newField.value}
              onChange={(e) =>
                setNewField({ ...newField, value: e.target.value })
              }
              placeholder="Field value"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleCreate}
              disabled={!newField.name.trim() || createMutation.isPending}
              size="sm"
            >
              Add
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsAdding(false);
                setNewField({ name: "", value: "" });
              }}
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
