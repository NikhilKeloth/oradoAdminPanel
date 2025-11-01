const TaskCard = ({ task }) => {
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white hover:shadow-md transition">
      <div className="flex justify-between mb-2">
        <h3 className="font-semibold text-lg text-gray-800">{task.title}</h3>
        <span
          className={`text-xs font-medium px-2 py-1 rounded ${
            task.status === "Assigned"
              ? "bg-green-100 text-green-800"
              : task.status === "Unassigned"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {task.status}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-2">Order ID: {task.orderId}</p>
      <p className="text-sm text-gray-600">Assigned To: {task.assignedAgent || "Not Assigned"}</p>
    </div>
  );
};

export default TaskCard;
