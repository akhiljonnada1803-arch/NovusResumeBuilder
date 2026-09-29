import { SyncQueueItem, SyncDirection, SyncProfilePayload } from "@/types/sync";

export class SyncQueueManager {
  private queue: SyncQueueItem[] = [];
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  private isProcessing = false;
  private listeners: ((queue: SyncQueueItem[]) => void)[] = [];

  constructor() {}

  /**
   * Subscribe to queue state updates.
   */
  public subscribe(listener: (queue: SyncQueueItem[]) => void): () => void {
    this.listeners.push(listener);
    listener([...this.queue]);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    const snapshot = [...this.queue];
    this.listeners.forEach((l) => l(snapshot));
  }

  /**
   * Enqueues a sync job with automatic debouncing to prevent excessive sync calls during rapid typing.
   */
  public enqueue(
    job: {
      sourceId: string;
      targetId: string;
      sourceName: string;
      targetName: string;
      direction: SyncDirection;
      payload: SyncProfilePayload;
    },
    debounceMs = 1200,
    onExecute?: (item: SyncQueueItem) => Promise<boolean>
  ): SyncQueueItem {
    const queueKey = `${job.sourceId}-${job.targetId}-${job.direction}`;

    // Clear any existing pending debounce timer for this source-target pair
    if (this.debounceTimers.has(queueKey)) {
      clearTimeout(this.debounceTimers.get(queueKey)!);
      this.debounceTimers.delete(queueKey);
    }

    const queueItem: SyncQueueItem = {
      id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sourceId: job.sourceId,
      targetId: job.targetId,
      sourceName: job.sourceName,
      targetName: job.targetName,
      direction: job.direction,
      payload: job.payload,
      status: "pending",
      retryCount: 0,
      enqueuedAt: new Date().toISOString(),
    };

    // Remove older pending duplicates for the same pair
    this.queue = this.queue.filter(
      (item) => !(item.sourceId === job.sourceId && item.targetId === job.targetId && item.status === "pending")
    );
    this.queue.unshift(queueItem);
    this.notify();

    if (debounceMs <= 0) {
      this.processItem(queueItem, onExecute);
    } else {
      const timer = setTimeout(() => {
        this.debounceTimers.delete(queueKey);
        this.processItem(queueItem, onExecute);
      }, debounceMs);
      this.debounceTimers.set(queueKey, timer);
    }

    return queueItem;
  }

  /**
   * Processes a single queue item.
   */
  private async processItem(
    item: SyncQueueItem,
    onExecute?: (item: SyncQueueItem) => Promise<boolean>
  ): Promise<void> {
    const target = this.queue.find((q) => q.id === item.id);
    if (!target) return;

    target.status = "processing";
    this.notify();

    try {
      if (onExecute) {
        const success = await onExecute(target);
        if (success) {
          target.status = "completed";
          target.processedAt = new Date().toISOString();
        } else {
          target.status = "failed";
          target.error = "Sync execution cancelled or unresolved conflicts.";
        }
      } else {
        target.status = "completed";
        target.processedAt = new Date().toISOString();
      }
    } catch (err: any) {
      target.retryCount++;
      if (target.retryCount < 3) {
        target.status = "pending";
        setTimeout(() => this.processItem(target, onExecute), 2000 * target.retryCount);
      } else {
        target.status = "failed";
        target.error = err.message || "Failed after 3 retries.";
      }
    } finally {
      this.notify();
    }
  }

  /**
   * Retries a failed queue job.
   */
  public retryJob(jobId: string, onExecute?: (item: SyncQueueItem) => Promise<boolean>): void {
    const item = this.queue.find((q) => q.id === jobId);
    if (item && item.status === "failed") {
      item.status = "pending";
      item.retryCount = 0;
      item.error = undefined;
      this.notify();
      this.processItem(item, onExecute);
    }
  }

  /**
   * Clears completed and failed jobs from queue.
   */
  public clearCompleted(): void {
    this.queue = this.queue.filter((q) => q.status === "pending" || q.status === "processing");
    this.notify();
  }

  public getQueue(): SyncQueueItem[] {
    return [...this.queue];
  }
}

// Global Singleton Instance
export const globalSyncQueue = new SyncQueueManager();
