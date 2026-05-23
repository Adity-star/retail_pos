// src/components/billing/QuickActions.tsx

'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, Trash2, Loader2 } from 'lucide-react';

interface QuickActionsProps {
  onSave: () => void;
  onClear: () => void;
  saving: boolean;
  disabled: boolean;
}

export default function QuickActions({
  onSave,
  onClear,
  saving,
  disabled,
}: QuickActionsProps) {
  return (
    <Card className="p-6 space-y-3">
      <Button
        onClick={onSave}
        disabled={disabled || saving}
        className="w-full h-14 text-lg"
        size="lg"
      >
        {saving ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-5 h-5 mr-2" />
            Save Invoice (F4)
          </>
        )}
      </Button>

      <Button
        onClick={onClear}
        disabled={disabled || saving}
        variant="outline"
        className="w-full h-12"
        size="lg"
      >
        <Trash2 className="w-5 h-5 mr-2" />
        Clear Cart (F8)
      </Button>
    </Card>
  );
}