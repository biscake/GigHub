export const timeAgo = (date: Date): string => {
  const offSetMs = new Date().getTimezoneOffset() * 1000 * 60;

  const now = new Date();
  const to = new Date(new Date(date).getTime() + offSetMs);

  const diffMs = now.getTime() - to.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays >= 1) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  } else if (diffHours >= 1) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else {
    return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  }
}