import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AppLayout } from '@/components/templates/AppLayout';
import { TasksPage } from '@/pages/TasksPage';
import { WeekPage } from '@/pages/WeekPage';
import { RutinaPage } from '@/pages/RutinaPage';
import { NotasPage } from '@/pages/NotasPage';
import { EstudioPage } from '@/pages/EstudioPage';

export function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<TasksPage />} />
          <Route path="/semana" element={<WeekPage />} />
          <Route path="/rutina" element={<RutinaPage />} />
          <Route path="/notas" element={<NotasPage />} />
          <Route path="/estudio" element={<EstudioPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
