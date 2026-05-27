import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { AIAssistant } from './AIAssistant';

export default function AppShell() {
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <div className="h-screen w-screen flex bg-paper text-ink overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onOpenAssistant={() => setAiOpen(true)} />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <Outlet />
        </main>
      </div>
      <AIAssistant open={aiOpen} onOpenChange={setAiOpen} />
    </div>
  );
}
