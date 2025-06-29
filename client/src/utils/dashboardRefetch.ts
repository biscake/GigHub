let refetch: null | (() => void) = null;

export const setDashboardRefetch = (fn: () => void) => {
  refetch = fn;
}

export const clearDashboardRefetch = () => {
  refetch = null;
}

export const callDashboardRefetch = () => {
  if (refetch) {
    refetch();
  }

  throw new Error("Dashboard refetch is null");
}