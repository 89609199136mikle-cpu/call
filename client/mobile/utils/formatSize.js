/**
 * CraneApp File Size Formatting
 * Human readable bytes (1.2 MB, 45.3 GB)
 */

export const formatSize = {
  // Format bytes to human readable
  bytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  },

  // Storage usage percentage
  usage(used, total) {
    const percent = (used / total) * 100;
    return `${formatSize.bytes(used)} of ${formatSize.bytes(total)} (${percent.toFixed(1)}%)`;
  }
};

window.formatSize = formatSize;
