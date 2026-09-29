import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  SyncSettings,
  SyncHistoryEntry,
  FieldConflict,
  SyncDirection,
  SelectiveSyncConfig,
  SyncLogEntry,
  SyncQueueItem,
} from "@/types/sync";
import { DEFAULT_SELECTIVE_SYNC_CONFIG } from "@/lib/sync/sync-service";

interface SyncStoreState {
  syncSettings: SyncSettings;
  syncHistory: SyncHistoryEntry[];
  syncLogs: SyncLogEntry[];
  syncQueue: SyncQueueItem[];
  activeConflicts: FieldConflict[];
  isConflictModalOpen: boolean;
  isSyncDashboardOpen: boolean;
  isHistoryDrawerOpen: boolean;
  onConflictsResolvedCallback: ((resolutions: Record<string, "current" | "incoming">) => void) | null;
  sourceContext: { sourceName: string; targetName: string; direction: SyncDirection } | null;

  // Actions
  updateSyncSettings: (settings: Partial<SyncSettings>) => void;
  updateSelectiveSync: (selective: Partial<SelectiveSyncConfig>) => void;
  addHistoryEntry: (entry: Omit<SyncHistoryEntry, "id" | "timestamp">) => void;
  addLogEntry: (event: string, level?: "info" | "warn" | "error" | "success", details?: Record<string, any>) => void;
  clearHistory: () => void;
  clearLogs: () => void;
  setSyncQueue: (queue: SyncQueueItem[]) => void;
  setSyncDashboardOpen: (open: boolean) => void;
  setHistoryDrawerOpen: (open: boolean) => void;
  openConflictModal: (
    conflicts: FieldConflict[],
    sourceContext: { sourceName: string; targetName: string; direction: SyncDirection },
    onResolve: (resolutions: Record<string, "current" | "incoming">) => void
  ) => void;
  closeConflictModal: () => void;
}

const DEFAULT_SETTINGS: SyncSettings = {
  autoSyncEnabled: true,
  autoSyncDebounceMs: 1200,
  defaultDirection: "bidirectional",
  selectiveSync: DEFAULT_SELECTIVE_SYNC_CONFIG,
  promptOnConflicts: true,
  lastSyncedAt: undefined,
};

export const useSyncStore = create<SyncStoreState>()(
  persist(
    (set, get) => ({
      syncSettings: DEFAULT_SETTINGS,
      syncHistory: [],
      syncLogs: [],
      syncQueue: [],
      activeConflicts: [],
      isConflictModalOpen: false,
      isSyncDashboardOpen: false,
      isHistoryDrawerOpen: false,
      onConflictsResolvedCallback: null,
      sourceContext: null,

      updateSyncSettings: (newSettings) =>
        set((state) => ({
          syncSettings: { ...state.syncSettings, ...newSettings },
        })),

      updateSelectiveSync: (patch) =>
        set((state) => ({
          syncSettings: {
            ...state.syncSettings,
            selectiveSync: { ...state.syncSettings.selectiveSync, ...patch },
          },
        })),

      addHistoryEntry: (entry) =>
        set((state) => {
          const newEntry: SyncHistoryEntry = {
            ...entry,
            id: `sync_hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            timestamp: new Date().toISOString(),
          };
          return {
            syncHistory: [newEntry, ...state.syncHistory].slice(0, 60),
            syncSettings: { ...state.syncSettings, lastSyncedAt: newEntry.timestamp },
          };
        }),

      addLogEntry: (event, level = "info", details) =>
        set((state) => {
          const newLog: SyncLogEntry = {
            id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
            timestamp: new Date().toISOString(),
            level,
            event,
            details,
          };
          return {
            syncLogs: [newLog, ...state.syncLogs].slice(0, 100),
          };
        }),

      clearHistory: () => set({ syncHistory: [] }),

      clearLogs: () => set({ syncLogs: [] }),

      setSyncQueue: (queue) => set({ syncQueue: queue }),

      setSyncDashboardOpen: (open) => set({ isSyncDashboardOpen: open }),

      openConflictModal: (conflicts, sourceContext, onResolve) =>
        set({
          activeConflicts: conflicts,
          sourceContext,
          isConflictModalOpen: true,
          onConflictsResolvedCallback: onResolve,
        }),

      closeConflictModal: () =>
        set({
          isConflictModalOpen: false,
          activeConflicts: [],
          onConflictsResolvedCallback: null,
          sourceContext: null,
        }),

      setHistoryDrawerOpen: (open) => set({ isHistoryDrawerOpen: open }),
    }),
    {
      name: "novus-sync-engine-v2",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        syncSettings: state.syncSettings,
        syncHistory: state.syncHistory,
        syncLogs: state.syncLogs,
      }),
    }
  )
);
