export const evaluateBuildBudget = (entryChunks, config) => {
  const minHeadroomBytes = config.minHeadroomBytes ?? 0;

  if (entryChunks.length === 0) {
    return {
      ok: false,
      reason: "missing-entry-chunk",
      maxEntryChunkBytes: config.maxEntryChunkBytes,
      minHeadroomBytes,
    };
  }

  const entryChunk = [...entryChunks].sort((a, b) => b.size - a.size)[0];

  if (entryChunk.size > config.maxEntryChunkBytes) {
    return {
      ok: false,
      reason: "over-max",
      entryChunk,
      maxEntryChunkBytes: config.maxEntryChunkBytes,
      minHeadroomBytes,
    };
  }

  const headroomBytes = config.maxEntryChunkBytes - entryChunk.size;

  if (headroomBytes < minHeadroomBytes) {
    return {
      ok: false,
      reason: "headroom-too-small",
      entryChunk,
      maxEntryChunkBytes: config.maxEntryChunkBytes,
      minHeadroomBytes,
    };
  }

  return {
    ok: true,
    reason: "ok",
    entryChunk,
    maxEntryChunkBytes: config.maxEntryChunkBytes,
    minHeadroomBytes,
  };
};
