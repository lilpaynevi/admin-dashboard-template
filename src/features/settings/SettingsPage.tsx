import { Monitor, Moon, Sun } from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '@/components/layout/PageHeader';
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
  Switch,
  TabPanel,
  Tabs,
  Textarea,
  type TabItem,
} from '@/components/ui';
import { cn } from '@/lib/cn';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme, type ThemePreference } from '@/providers/ThemeProvider';
import { useToast } from '@/providers/ToastProvider';

type SettingsTab = 'profile' | 'appearance' | 'notifications';

const TABS: TabItem<SettingsTab>[] = [
  { id: 'profile', label: 'Profil' },
  { id: 'appearance', label: 'Apparence' },
  { id: 'notifications', label: 'Notifications' },
];

const THEME_OPTIONS: Array<{ value: ThemePreference; label: string; icon: typeof Sun }> = [
  { value: 'light', label: 'Clair', icon: Sun },
  { value: 'dark', label: 'Sombre', icon: Moon },
  { value: 'system', label: 'Système', icon: Monitor },
];

export function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const toast = useToast();
  const [tab, setTab] = useState<SettingsTab>('profile');

  const [notifications, setNotifications] = useState({
    weeklyReport: true,
    newUser: true,
    security: true,
    marketing: false,
  });

  return (
    <>
      <PageHeader title="Paramètres" description="Votre compte et vos préférences." />

      <Tabs tabs={TABS} value={tab} onChange={setTab} className="mb-5" />

      {tab === 'profile' && (
        <TabPanel id="profile" className="max-w-2xl">
          <Card>
            <CardHeader
              title="Informations personnelles"
              description="Visibles par les autres membres de l'équipe."
            />
            <CardBody className="space-y-5">
              <div className="flex items-center gap-4">
                <Avatar name={user?.name ?? '?'} src={user?.avatarUrl} size="lg" />
                <div>
                  <Button variant="outline" size="sm">
                    Changer la photo
                  </Button>
                  <p className="mt-1.5 text-xs text-muted">JPG ou PNG, 2 Mo maximum.</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Nom complet" defaultValue={user?.name} autoComplete="name" />
                <Input
                  label="Adresse e-mail"
                  type="email"
                  defaultValue={user?.email}
                  autoComplete="email"
                />
              </div>

              <Textarea
                label="Biographie"
                placeholder="Quelques lignes sur votre rôle…"
                hint="Affichée sur votre fiche d'équipe."
              />
            </CardBody>
            <CardFooter>
              <Button onClick={() => toast.success('Profil enregistré.')}>Enregistrer</Button>
            </CardFooter>
          </Card>
        </TabPanel>
      )}

      {tab === 'appearance' && (
        <TabPanel id="appearance" className="max-w-2xl">
          <Card>
            <CardHeader
              title="Thème"
              description="« Système » suit le réglage de votre appareil."
            />
            <CardBody>
              <div
                role="radiogroup"
                aria-label="Thème de l'interface"
                className="grid gap-3 sm:grid-cols-3"
              >
                {THEME_OPTIONS.map((option) => {
                  const isSelected = theme === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setTheme(option.value)}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-card border p-4 transition-colors',
                        isSelected
                          ? 'border-primary bg-primary-soft text-primary'
                          : 'border-border text-muted hover:border-subtle hover:text-foreground',
                      )}
                    >
                      <option.icon className="size-5" aria-hidden="true" />
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </TabPanel>
      )}

      {tab === 'notifications' && (
        <TabPanel id="notifications" className="max-w-2xl">
          <Card>
            <CardHeader
              title="E-mails"
              description="Les changements sont enregistrés immédiatement."
            />
            <CardBody className="space-y-5">
              <Switch
                checked={notifications.weeklyReport}
                onCheckedChange={(checked) =>
                  setNotifications((current) => ({ ...current, weeklyReport: checked }))
                }
                label="Rapport hebdomadaire"
                description="Un résumé de l'activité chaque lundi matin."
              />
              <Switch
                checked={notifications.newUser}
                onCheckedChange={(checked) =>
                  setNotifications((current) => ({ ...current, newUser: checked }))
                }
                label="Nouvel utilisateur"
                description="À chaque création de compte."
              />
              <Switch
                checked={notifications.security}
                onCheckedChange={(checked) =>
                  setNotifications((current) => ({ ...current, security: checked }))
                }
                label="Alertes de sécurité"
                description="Connexion depuis un appareil inconnu, changement de mot de passe."
              />
              <Switch
                checked={notifications.marketing}
                onCheckedChange={(checked) =>
                  setNotifications((current) => ({ ...current, marketing: checked }))
                }
                label="Nouveautés produit"
                description="Au maximum une fois par mois."
              />
            </CardBody>
          </Card>
        </TabPanel>
      )}
    </>
  );
}
