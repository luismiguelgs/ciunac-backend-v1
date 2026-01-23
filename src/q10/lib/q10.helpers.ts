/**
 * Returns the current date in the format YYYY-MM-DD.
 * @returns {string} The current date in the format YYYY-MM-DD.
 */
export function getCurretDate_YYYYMMDD():string {
    const today = new Date();
    return today.toISOString().split('T')[0];
}
