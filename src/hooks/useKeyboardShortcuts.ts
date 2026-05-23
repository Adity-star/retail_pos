// src/hooks/useKeyboardShortcuts.ts

import { useEffect } from 'react';

interface KeyboardShortcuts {
  onSearch?: () => void;
  onSave?: () => void;
  onClear?: () => void;
  onCustomer?: () => void;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcuts) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // F2 - Search
      if (e.key === 'F2') {
        e.preventDefault();
        shortcuts.onSearch?.();
      }

      // F4 - Save
      if (e.key === 'F4') {
        e.preventDefault();
        shortcuts.onSave?.();
      }

      // F8 - Clear
      if (e.key === 'F8') {
        e.preventDefault();
        shortcuts.onClear?.();
      }

      // F9 - Customer
      if (e.key === 'F9') {
        e.preventDefault();
        shortcuts.onCustomer?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}