import { cookies } from 'next/headers';
import { auth } from '../(auth)/auth.handler';
import { SidebarInset, SidebarProvider } from '@/components/sidebar/sidebar';
import { AppSidebar } from '@/components/sidebar/app.sidebar';
import Footer from '@/components/footer';

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const isCollasped = cookieStore.get('sidebar:collapsed')?.value === 'true';

  return (
    <SidebarProvider defaultOpen={!isCollasped}>
      <AppSidebar user={session?.user} />
      <div className="md:flex md:flex-col md:flex-1 max-w-full overflow-x-hidden">
        <SidebarInset>{children}</SidebarInset>
        <Footer />
      </div>
    </SidebarProvider>
  );
}
