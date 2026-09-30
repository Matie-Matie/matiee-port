/** Approximate size of the vault in browser storage (characters ≈ bytes). */
export const STORAGE_BUDGET = 5 * 1024 * 1024;

export function vaultUsage(): number {
  try {
    return (localStorage.getItem('matieeport-storage') ?? '').length;
  } catch {
    return 0;
  }
}
