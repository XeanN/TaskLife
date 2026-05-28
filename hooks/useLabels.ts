import { useAuth } from "@/context/AuthContext";
import { obtenerEtiquetas } from "@/services/labelService";
import { useEffect, useMemo, useState } from "react";

export function useLabels(userId?: string) {
  const auth = useAuth();
  const finalUserId = userId || auth?.user?.id;
  
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLabels = async () => {
    if (!finalUserId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await obtenerEtiquetas(finalUserId);
      setLabels(data || []);
      setError(null);
    } catch (err) {
      setError(err.message || "Error al cargar etiquetas");
      setLabels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabels();
  }, [finalUserId]);

  const getByIds = useMemo(() => {
    return (labelIds: string[] | undefined) => {
      if (!labelIds || !Array.isArray(labelIds)) {
        return [];
      }
      return labelIds
        .map((id) => labels.find((l) => l.id === id))
        .filter((l) => l !== undefined) as Array<{
        id: string;
        name: string;
        color: string;
      }>;
    };
  }, [labels]);

  return { labels, loading, error, getByIds };
}
