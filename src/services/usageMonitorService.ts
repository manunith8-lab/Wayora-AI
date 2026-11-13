// Internal Usage, Token & Performance Monitoring Service
// Tracks resource consumption, zero AI token guarantee, API requests, and cache efficiency.

export interface UsageMetrics {
  aiCallsCount: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  apiRequestsCount: {
    nominatim: number;
    overpass: number;
    wikipedia: number;
    wikidata: number;
    wikivoyage: number;
    total: number;
  };
  cacheHits: number;
  cacheMisses: number;
  totalQueriesProcessed: number;
  averageResponseTimeMs: number;
  errorsCount: number;
  recentLogs: {
    timestamp: string;
    source: string;
    operation: string;
    status: 'success' | 'cache_hit' | 'error';
    durationMs: number;
  }[];
}

export interface ConfigurableLimits {
  maxAiCallsPerConversation: number;
  maxTokensPerRequest: number;
  cacheTtlHours: number;
  requestThrottleMs: number;
  overpassTimeoutSeconds: number;
  wikipediaTimeoutMs: number;
}

const DEFAULT_CONFIG: ConfigurableLimits = {
  maxAiCallsPerConversation: 0, // Zero paid AI calls by default
  maxTokensPerRequest: 0,
  cacheTtlHours: 168, // 7 days
  requestThrottleMs: 1000,
  overpassTimeoutSeconds: 15,
  wikipediaTimeoutMs: 3000,
};

class UsageMonitorService {
  private metrics: UsageMetrics = {
    aiCallsCount: 0,
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    apiRequestsCount: {
      nominatim: 0,
      overpass: 0,
      wikipedia: 0,
      wikidata: 0,
      wikivoyage: 0,
      total: 0,
    },
    cacheHits: 0,
    cacheMisses: 0,
    totalQueriesProcessed: 0,
    averageResponseTimeMs: 0,
    errorsCount: 0,
    recentLogs: [],
  };

  private config: ConfigurableLimits = { ...DEFAULT_CONFIG };
  private totalLatencyAccumulator = 0;

  constructor() {
    this.loadPersistedMetrics();
  }

  private loadPersistedMetrics() {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('wayora_usage_metrics');
        if (stored) {
          const parsed = JSON.parse(stored);
          this.metrics = { ...this.metrics, ...parsed };
        }
      }
    } catch {}
  }

  private persist() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('wayora_usage_metrics', JSON.stringify(this.metrics));
      }
    } catch {}
  }

  /**
   * Records an API call or cache hit with execution timing
   */
  recordApiCall(
    service: 'nominatim' | 'overpass' | 'wikipedia' | 'wikidata' | 'wikivoyage',
    operation: string,
    durationMs: number,
    isCacheHit: boolean = false
  ) {
    if (isCacheHit) {
      this.metrics.cacheHits++;
      this.addLog(service, operation, 'cache_hit', durationMs);
    } else {
      this.metrics.cacheMisses++;
      this.metrics.apiRequestsCount[service]++;
      this.metrics.apiRequestsCount.total++;
      this.addLog(service, operation, 'success', durationMs);
    }

    this.metrics.totalQueriesProcessed++;
    this.totalLatencyAccumulator += durationMs;
    this.metrics.averageResponseTimeMs = Math.round(
      this.totalLatencyAccumulator / this.metrics.totalQueriesProcessed
    );

    this.persist();
  }

  /**
   * Records an operational failure
   */
  recordError(service: string, operation: string, durationMs: number = 0) {
    this.metrics.errorsCount++;
    this.addLog(service, operation, 'error', durationMs);
    this.persist();
  }

  /**
   * Tracks AI token usage (remains 0 in rule-based mode)
   */
  recordAiUsage(inputTokens: number = 0, outputTokens: number = 0) {
    this.metrics.aiCallsCount++;
    this.metrics.inputTokens += inputTokens;
    this.metrics.outputTokens += outputTokens;
    this.metrics.totalTokens += inputTokens + outputTokens;
    this.persist();
  }

  private addLog(
    source: string,
    operation: string,
    status: 'success' | 'cache_hit' | 'error',
    durationMs: number
  ) {
    this.metrics.recentLogs.unshift({
      timestamp: new Date().toLocaleTimeString(),
      source,
      operation,
      status,
      durationMs,
    });
    if (this.metrics.recentLogs.length > 25) {
      this.metrics.recentLogs.pop();
    }
  }

  /**
   * Get current telemetry snapshot
   */
  getMetrics(): UsageMetrics {
    return { ...this.metrics };
  }

  /**
   * Get configurable limits
   */
  getConfig(): ConfigurableLimits {
    return { ...this.config };
  }

  /**
   * Update limits dynamically
   */
  updateConfig(updates: Partial<ConfigurableLimits>) {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Reset telemetry counters
   */
  resetMetrics() {
    this.metrics = {
      aiCallsCount: 0,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      apiRequestsCount: {
        nominatim: 0,
        overpass: 0,
        wikipedia: 0,
        wikidata: 0,
        wikivoyage: 0,
        total: 0,
      },
      cacheHits: 0,
      cacheMisses: 0,
      totalQueriesProcessed: 0,
      averageResponseTimeMs: 0,
      errorsCount: 0,
      recentLogs: [],
    };
    this.totalLatencyAccumulator = 0;
    this.persist();
  }
}

export const usageMonitorService = new UsageMonitorService();
