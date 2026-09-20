import { FileQuestion } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button, EmptyState } from '@/components/ui';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <EmptyState
        icon={FileQuestion}
        title="Page introuvable"
        description="Cette adresse ne correspond à aucun écran. Elle a peut-être été déplacée."
        action={
          // Navigation par le routeur et non `<a href>` : une ancre recharge
          // l'application entière et perd tout l'état en mémoire.
          <Button onClick={() => navigate('/')}>Retour au tableau de bord</Button>
        }
      />
    </div>
  );
}
