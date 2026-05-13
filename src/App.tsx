import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from '@/components/shared/AppShell';
import CommandCenter from '@/pages/CommandCenter';
import Portfolio from '@/pages/Portfolio';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import Opportunities from '@/pages/Opportunities';
import OpportunityDetail from '@/pages/OpportunityDetail';
import Projects from '@/pages/Projects';
import ProjectDetail from '@/pages/ProjectDetail';
import ResourceCapacity from '@/pages/ResourceCapacity';
import WorkerAssignment from '@/pages/WorkerAssignment';
import LocationWorkload from '@/pages/LocationWorkload';
import Tasks from '@/pages/Tasks';
import Calendar from '@/pages/Calendar';
import Timeline from '@/pages/Timeline';
import Transcripts from '@/pages/Transcripts';
import Risks from '@/pages/Risks';
import Decisions from '@/pages/Decisions';
import DependencyGraph from '@/pages/DependencyGraph';
import Capabilities from '@/pages/Capabilities';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/command-center" replace />} />
        <Route path="command-center" element={<CommandCenter />} />
        <Route path="portfolio" element={<Portfolio />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="opportunities" element={<Opportunities />} />
        <Route path="opportunities/:id" element={<OpportunityDetail />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="resources/capacity" element={<ResourceCapacity />} />
        <Route path="resources/assignment" element={<WorkerAssignment />} />
        <Route path="resources/locations" element={<LocationWorkload />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="timeline" element={<Timeline />} />
        <Route path="intelligence/transcripts" element={<Transcripts />} />
        <Route path="intelligence/risks" element={<Risks />} />
        <Route path="intelligence/decisions" element={<Decisions />} />
        <Route path="intelligence/dependencies" element={<DependencyGraph />} />
        <Route path="library/capabilities" element={<Capabilities />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
