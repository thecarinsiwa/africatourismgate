'use client';

import {
  AlertDialog,
  Button,
  Card,
  DataTable,
  DataTableActionButton,
  DataTableActions,
  DataTablePagination,
  Input,
  Select,
  useToast,
  type ColumnDef,
} from '@africatourismgate/ui';
import type { Destination, Property } from '@africatourismgate/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getApiClient } from '../../lib/auth/api';
import { getHebergementsErrorMessage } from '../../lib/hebergements-errors';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

const propertyTypeLabels: Record<Property['propertyType'], string> = {
  hotel: 'Hôtel',
  resort: 'Resort',
  apartment: 'Appartement',
  villa: 'Villa',
  hostel: 'Auberge',
  other: 'Autre',
};

export function PropertiesList() {
  const { toast } = useToast();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('');
  const [page, setPage] = useState(1);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | {
        status: 'ready';
        properties: Property[];
        total: number;
        totalPages: number;
      }
  >({ status: 'loading' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Property | null>(null);

  useEffect(() => {
    void getApiClient()
      .listDestinations({ page: 1, limit: 100 })
      .then((r) => setDestinations(r.data))
      .catch(() => setDestinations([]));
  }, []);

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const result = await getApiClient().listProperties({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        destinationId: destinationFilter || undefined,
      });
      setState({
        status: 'ready',
        properties: result.data,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      setState({ status: 'error', message: getHebergementsErrorMessage(error) });
    }
  }, [page, search, destinationFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const query = searchInput.trim();
    const timer = window.setTimeout(() => {
      setSearch((prev) => {
        if (prev !== query) setPage(1);
        return query;
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const destinationNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const d of destinations) {
      map.set(d.id, d.name);
    }
    return map;
  }, [destinations]);

  const destinationOptions = useMemo(
    () => [
      { value: '', label: 'Toutes' },
      ...destinations.map((d) => ({ value: d.id, label: d.name })),
    ],
    [destinations],
  );

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return;
    const property = pendingDelete;
    setDeletingId(property.id);
    try {
      await getApiClient().deleteProperty(property.id);
      setPendingDelete(null);
      await load();
      toast({
        variant: 'success',
        message: `L'hébergement « ${property.name} » a été supprimé.`,
      });
    } catch (error) {
      toast({
        variant: 'error',
        message: getHebergementsErrorMessage(error),
      });
    } finally {
      setDeletingId(null);
    }
  }, [pendingDelete, load, toast]);

  const columns = useMemo<ColumnDef<Property, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Hébergement',
        cell: ({ row }) => (
          <span className="font-medium text-atg-fg">{row.original.name}</span>
        ),
      },
      {
        accessorKey: 'slug',
        header: 'Slug',
        cell: ({ row }) => (
          <code className="rounded-md bg-atg-surface px-2 py-0.5 font-mono text-xs text-atg-muted">
            {row.original.slug}
          </code>
        ),
      },
      {
        id: 'destination',
        header: 'Destination',
        cell: ({ row }) => (
          <span className="text-sm text-atg-muted">
            {destinationNameById.get(row.original.destinationId) ?? row.original.destinationId}
          </span>
        ),
      },
      {
        accessorKey: 'propertyType',
        header: 'Type',
        meta: { align: 'center' },
        cell: ({ row }) => (
          <span className="text-sm text-atg-muted">
            {propertyTypeLabels[row.original.propertyType]}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        meta: { align: 'right' },
        cell: ({ row }) => {
          const property = row.original;
          return (
            <DataTableActions>
              <DataTableActionButton action="edit" href={`/hebergements/${property.id}`} />
              <DataTableActionButton
                action="delete"
                onClick={() => setPendingDelete(property)}
                disabled={deletingId === property.id}
                loading={deletingId === property.id}
              />
            </DataTableActions>
          );
        },
      },
    ],
    [deletingId, destinationNameById],
  );

  const properties = state.status === 'ready' ? state.properties : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 sm:max-w-md">
            <Input
              type="search"
              placeholder="Rechercher par nom ou slug…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Rechercher un hébergement"
            />
          </div>
          <div className="sm:w-56">
            <Select
              label="Destination"
              value={destinationFilter}
              options={destinationOptions}
              onChange={(e) => {
                setDestinationFilter(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button href="/hebergements/equipements" variant="outline">
            Équipements
          </Button>
          <Button href="/hebergements/nouveau">Nouvel hébergement</Button>
        </div>
      </div>

      {state.status === 'error' ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      ) : (
        <>
          <Card variant="dashboard" padding="none" className="overflow-hidden">
            <DataTable
              columns={columns}
              data={properties}
              isLoading={state.status === 'loading'}
              emptyMessage="Aucun hébergement pour le moment."
              getRowId={(row) => row.id}
              aria-label="Liste des hébergements"
            />
          </Card>
          {state.status === 'ready' ? (
            <DataTablePagination
              page={page}
              pageSize={PAGE_SIZE}
              totalPages={state.totalPages}
              totalItems={state.total}
              itemLabel="hébergement"
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deletingId) setPendingDelete(null);
        }}
        title="Supprimer l'hébergement"
        description={
          pendingDelete
            ? `Supprimer l'hébergement « ${pendingDelete.name} » ? Cette action est irréversible.`
            : undefined
        }
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        loading={deletingId !== null}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
