export const fullName = (u: { firstName: string; lastName: string }) => `${u.firstName} ${u.lastName}`;

export const initials = (u: { firstName: string; lastName: string }) =>
  `${u.firstName.charAt(0)}${u.lastName.charAt(0)}`.toUpperCase();

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

/** "SETTINGS_UPDATED" -> "Settings updated" */
export const humanizeAction = (action: string) => {
  const s = action.toLowerCase().replace(/_/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
};
