'use strict';

/**
 * Sorts an array of task objects for the Done column:
 * - Tasks with a `completed` date appear first, newest (largest ISO string) first
 * - Tasks without a `completed` date (null/undefined/'') fall to the bottom
 * - Relative order among undated tasks is preserved (stable sort)
 *
 * @param {Array<{completed?: string|null}>} tasks
 * @returns {Array}
 */
function sortDoneColumn(tasks) {
  // Annotate with original index for stable ordering of undated tasks
  return tasks
    .map((task, index) => ({ task, index }))
    .sort((a, b) => {
      const aDate = a.task.completed || '';
      const bDate = b.task.completed || '';

      if (aDate && bDate) {
        // Both dated: descending (newer first)
        if (bDate > aDate) return 1;
        if (bDate < aDate) return -1;
        return a.index - b.index;
      }
      if (aDate && !bDate) return -1; // a before b
      if (!aDate && bDate) return 1;  // b before a
      // Neither dated: preserve original order
      return a.index - b.index;
    })
    .map(({ task }) => task);
}

module.exports = { sortDoneColumn };
