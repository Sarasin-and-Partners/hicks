'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FileType, Users, Workflow, Settings } from 'lucide-react';

export default function AdminPage() {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  if (user?.role !== 'admin') {
    return null;
  }

  const adminSections = [
    {
      title: 'Incident Types',
      description: 'Manage incident type categories that users can select when reporting',
      icon: <FileType className="h-6 w-6" />,
      href: '/admin/incident-types',
    },
    {
      title: 'Teams',
      description: 'View and manage teams within departments',
      icon: <Users className="h-6 w-6" />,
      href: '/admin/teams',
    },
    {
      title: 'Processes',
      description: 'Manage business processes that can be associated with incidents',
      icon: <Workflow className="h-6 w-6" />,
      href: '/admin/processes',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Administration</h1>
        <p className="text-muted-foreground">
          Manage system configuration and reference data
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {adminSections.map((section) => (
          <Card key={section.href} className="transition-colors hover:bg-accent/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  {section.icon}
                </div>
                <div>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                {section.description}
              </CardDescription>
              <Button asChild variant="outline" className="w-full">
                <Link href={section.href}>
                  <Settings className="mr-2 h-4 w-4" />
                  Manage
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
