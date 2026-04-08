import { useAuth } from "@/context/AuthContext";
import {
    addLabel,
    getLabelsByIds,
    removeLabel,
    subscribeToLabels,
} from "@/controllers/LabelController";
import { Label } from "@/models/Label";
import { useEffect, useState } from "react";

export function useLabels() {
  const { user } = useAuth();
  const [labels, setLabels] = useState<Label[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    return subscribeToLabels(user.id, setLabels);
  }, [user]);

  const create = async (name: string, color: string): Promise<void> => {
    if (!user) return;
    setIsLoading(true);
    try {
      await addLabel(user.id, name, color);
    } finally {
      setIsLoading(false);
    }
  };

  const remove = async (labelId: string): Promise<void> => {
    if (!user) return;
    await removeLabel(user.id, labelId);
  };

  const getByIds = (labelIds: string[]): Label[] => {
    return getLabelsByIds(labels, labelIds);
  };

  return {
    labels,
    isLoading,
    create,
    remove,
    getByIds,
  };
}
