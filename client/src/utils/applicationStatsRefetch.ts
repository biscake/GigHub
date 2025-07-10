let refetch: null | (() => void) = null;

export const setApplicationStatsRefetch = (fn: () => void) => {
  refetch = fn;
}

export const clearApplicationStatsRefetch = () => {
  refetch = null;
}

export const callApplicationStatsRefetch = () => {
  if (refetch) {
    refetch();
  }

  throw new Error("ApplicationStats refetch is null");
}