import { DirectoryTree, DirectoryObjectType } from '@/types/sidebar-types';

export type SidebarOperation = 
  | { type: 'create'; name: string; isDirectory: boolean }
  | { type: 'delete'; name: string }
  | { type: 'rename'; oldName: string; newName: string };

export interface OperationSummary {
  operations: SidebarOperation[];
  hasConflicts: boolean;
  conflictMessages: string[];
}

/**
 * Parse buffer content into a list of entry names
 * Format: "file1.txt\nfolder/\nfile2.txt"
 */
export const parseBufferToEntries = (bufferContent: string): string[] => {
  return bufferContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
};

/**
 * Convert DirectoryTree into a flat list of entry names
 */
export const parseTreeToEntries = (tree: DirectoryTree): string[] => {
  return Object.keys(tree).map(key => {
    const entry = tree[key];
    return entry.type === DirectoryObjectType.DIRECTORY ? `${key}/` : key;
  });
};

/**
 * Detect what operations need to be performed
 * Compares original entries with edited entries
 */
export const detectOperations = (
  originalEntries: string[],
  editedEntries: string[]
): OperationSummary => {
  const operations: SidebarOperation[] = [];
  const conflictMessages: string[] = [];
  let hasConflicts = false;

  // Create sets for easier lookup
  const originalSet = new Set(originalEntries);
  const editedSet = new Set(editedEntries);

  // Track which original entries we've processed
  const processedOriginal = new Set<string>();

  // First pass: find renames and deletes in original entries
  for (const original of originalEntries) {
    // If entry still exists in edited, might be a rename or no-op
    if (editedSet.has(original)) {
      processedOriginal.add(original);
      continue;
    }

    // Entry is gone from edited. Check if it might be a rename
    // (same base name but different extension/suffix, or different case)
    const baseOriginal = getEntryBase(original);
    let foundRename = false;

    for (const edited of editedEntries) {
      if (processedOriginal.has(edited)) continue;

      const baseEdited = getEntryBase(edited);
      const originalIsDir = isDirectory(original);
      const editedIsDir = isDirectory(edited);

      // Rename: same type, different name
      if (baseOriginal === baseEdited && originalIsDir === editedIsDir) {
        // This is likely a rename
        operations.push({ type: 'rename', oldName: original, newName: edited });
        processedOriginal.add(original);
        processedOriginal.add(edited);
        foundRename = true;
        break;
      }
    }

    // No rename found, it's a delete
    if (!foundRename) {
      operations.push({ type: 'delete', name: original });
      processedOriginal.add(original);
    }
  }

  // Second pass: find creates (entries in edited that aren't in original)
  for (const edited of editedEntries) {
    if (!originalSet.has(edited) && !processedOriginal.has(edited)) {
      const isDir = isDirectory(edited);
      operations.push({ type: 'create', name: edited, isDirectory: isDir });
    }
  }

  // Validate operations for conflicts
  const validationResult = validateOperations(operations, originalEntries, editedEntries);
  hasConflicts = validationResult.hasConflicts;
  conflictMessages.push(...validationResult.messages);

  return {
    operations,
    hasConflicts,
    conflictMessages,
  };
};

/**
 * Get the base name of an entry (without directory suffix)
 */
export const getEntryBase = (entry: string): string => {
  return entry.endsWith('/') ? entry.slice(0, -1) : entry;
};

/**
 * Check if an entry is a directory (ends with /)
 */
export const isDirectory = (entry: string): boolean => {
  return entry.endsWith('/');
};

/**
 * Validate operations for logical conflicts
 */
export const validateOperations = (
  operations: SidebarOperation[],
  originalEntries: string[],
  editedEntries: string[]
): { hasConflicts: boolean; messages: string[] } => {
  const messages: string[] = [];
  const editedSet = new Set(editedEntries);
  const renamedFrom = new Map<string, string>();

  // Build a map of renames
  for (const op of operations) {
    if (op.type === 'rename') {
      renamedFrom.set(op.oldName, op.newName);
    }
  }

  // Check for duplicates in final state
  const finalNames = new Set<string>();
  for (const op of operations) {
    let name: string;

    if (op.type === 'create') {
      name = op.name;
    } else if (op.type === 'delete') {
      continue; // Deleted items don't appear in final state
    } else {
      // rename
      name = op.newName;
    }

    if (finalNames.has(name)) {
      messages.push(`Duplicate entry: "${name}" appears multiple times`);
    }
    finalNames.add(name);
  }

  // Check for rename to existing entry
  for (const op of operations) {
    if (op.type === 'rename') {
      const targetExists = originalEntries.some(
        entry => entry !== op.oldName && entry === op.newName
      );
      if (targetExists) {
        messages.push(`Cannot rename "${op.oldName}" to "${op.newName}" - target already exists`);
      }
    }
  }

  // Check for deleting then recreating (likely a rename)
  const deletes = operations.filter(op => op.type === 'delete').map(op => op.name);
  const creates = operations.filter(op => op.type === 'create').map(op => op.name);
  for (const del of deletes) {
    const created = creates.find(c => getEntryBase(c) === getEntryBase(del));
    if (created && isDirectory(del) === isDirectory(created)) {
      messages.push(
        `Note: Deleting "${del}" and creating "${created}" looks like a rename operation`
      );
    }
  }

  return {
    hasConflicts: messages.length > 0,
    messages,
  };
};

/**
 * Apply operations to a DirectoryTree
 * Returns the updated tree
 */
export const applyOperationsToTree = (
  tree: DirectoryTree,
  operations: SidebarOperation[]
): DirectoryTree => {
  let updatedTree = { ...tree };

  // Apply deletes first
  for (const op of operations) {
    if (op.type === 'delete') {
      const { [op.name]: _, ...rest } = updatedTree;
      updatedTree = rest;
    }
  }

  // Apply renames
  for (const op of operations) {
    if (op.type === 'rename') {
      const entry = updatedTree[op.oldName];
      if (entry) {
        updatedTree = {
          ...updatedTree,
          [op.newName]: entry,
        };
        const { [op.oldName]: _, ...rest } = updatedTree;
        updatedTree = rest;
      }
    }
  }

  // Apply creates
  for (const op of operations) {
    if (op.type === 'create') {
      const isDir = op.isDirectory;
      updatedTree[op.name] = {
        type: isDir ? DirectoryObjectType.DIRECTORY : DirectoryObjectType.FILE,
        children: isDir ? {} : {},
      };
    }
  }

  return updatedTree;
};

/**
 * Format operations for display to user
 */
export const formatOperationsForDisplay = (operations: SidebarOperation[]): string => {
  const lines: string[] = [];

  const creates = operations.filter(op => op.type === 'create');
  const renames = operations.filter(op => op.type === 'rename');
  const deletes = operations.filter(op => op.type === 'delete');

  if (creates.length > 0) {
    lines.push('CREATE:');
    creates.forEach(op => {
      if (op.type === 'create') {
        lines.push(`  + ${op.name}${op.isDirectory ? '/' : ''}`);
      }
    });
  }

  if (renames.length > 0) {
    lines.push('RENAME:');
    renames.forEach(op => {
      if (op.type === 'rename') {
        lines.push(`  ${op.oldName} → ${op.newName}`);
      }
    });
  }

  if (deletes.length > 0) {
    lines.push('DELETE:');
    deletes.forEach(op => {
      lines.push(`  - ${op.name}`);
    });
  }

  return lines.join('\n');
};
