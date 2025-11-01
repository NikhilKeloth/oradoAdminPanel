import AdminAgentDashboardLayout from "@/layouts/AdminAgentDashboardLayout";

const AgentAdminDashboard = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Live Dispatch Map</h1>
      <p>This is your dashboard content area — map view, task list etc.</p>
    </div>
  );
};

// Apply your custom layout using getLayout
AgentAdminDashboard.getLayout = (page) => (
  <AdminAgentDashboardLayout>{page}</AdminAgentDashboardLayout>
);

export default AgentAdminDashboard;
