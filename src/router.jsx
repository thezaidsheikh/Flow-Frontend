import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import WorkflowBuilder from './pages/WorkflowBuilder';
import Credentials from './pages/Credentials';
import RunDetail from './pages/RunDetail';
import WorkflowList from './pages/WorkflowList';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/workflows" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="workflows" element={<WorkflowList />} />
        <Route path="workflow/:id" element={<WorkflowBuilder />} />
        <Route path="runs/:runId" element={<RunDetail />} />
        <Route path="credentials" element={<Credentials />} />
      </Route>

      <Route path="*" element={<Navigate to="/workflows" replace />} />
    </Routes>
  );
};

export default AppRouter;
