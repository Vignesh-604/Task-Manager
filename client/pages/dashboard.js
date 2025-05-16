import { useState, useEffect } from "react";
import axios from "../utils/axios";
import { CheckCircle, Clock, AlertCircle, Search, User, List, BarChart2, Bell } from "lucide-react";
import { useUserStore } from "@/utils/store";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCreated: 0,
    totalAssigned: 0,
    statusCount: {
      pending: 0,
      inProgress: 0,
      completed: 0,
    },
    overdueCount: 0
  });

  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("assigned");
  const [loading, setLoading] = useState(true);

  const user = useUserStore(state => state.user);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch stats data
      const statsResponse = await axios.get("/tasks/stats");
      setStats(statsResponse.data.data);

      // Fetch tasks created by user
      const tasksResponse = await axios.get(`/tasks/user/${user?._id}?type=${activeTab}`);
      setTasks(tasksResponse.data.data);
      setFilteredTasks(tasksResponse.data.data);

      setIsLoading(false);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setIsLoading(false);
      setLoading(false);
    }
  };

  // Apply filters and search
  useEffect(() => {
    let result = [...tasks];

    // Filter by active tab
    if (activeTab === "assigned") {
      result = result.filter(task => task.assignedTo?._id === user?._id);
    } else if (activeTab === "created") {
      result = result.filter(task => task.createdBy?._id === user?._id);
    } else if (activeTab === "overdue") {
      result = result.filter(task =>
        new Date(task.dueDate) < new Date() && task.status !== "completed"
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      result = result.filter(task => task.status === filterStatus);
    }

    // Apply priority filter
    if (filterPriority !== "all") {
      result = result.filter(task => task.priority === filterPriority);
    }

    // Apply search
    if (search.trim() !== "") {
      const searchLower = search.toLowerCase();
      result = result.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower)
      );
    }

    setFilteredTasks(result);
  }, [tasks, search, filterStatus, filterPriority, activeTab, user?._id]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="text-green-500" size={16} />;
      case "in-progress":
        return <Clock className="text-blue-500" size={16} />;
      case "pending":
        return <AlertCircle className="text-yellow-500" size={16} />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (dateString) => {
    return new Date(dateString) < new Date() && status !== "completed";
  };

  if (loading) return <div>Loading</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Task Management Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Bell className="text-gray-500" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {stats.overdueCount}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                {user?.name.charAt(0)}
              </div>
              <span className="font-medium text-gray-700">{user?.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Tasks Assigned to You</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalAssigned}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <List className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Tasks Created by You</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalCreated}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                  <BarChart2 className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Task Completion Rate</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {Math.round((stats.statusCount.completed / (stats.totalAssigned || 1)) * 100)}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Overdue Tasks</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.overdueCount}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Task Status Breakdown */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Task Status Breakdown</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700">Pending</p>
                  <p className="text-2xl font-bold text-yellow-800">{stats.statusCount.pending}</p>
                </div>
                <AlertCircle className="text-yellow-500 h-8 w-8" />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700">In Progress</p>
                  <p className="text-2xl font-bold text-blue-800">{stats.statusCount.inProgress}</p>
                </div>
                <Clock className="text-blue-500 h-8 w-8" />
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700">Completed</p>
                  <p className="text-2xl font-bold text-green-800">{stats.statusCount.completed}</p>
                </div>
                <CheckCircle className="text-green-500 h-8 w-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Task List Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* Tabs */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setActiveTab("assigned")}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${activeTab === "assigned"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  Assigned to Me
                </button>
                <button
                  onClick={() => setActiveTab("created")}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${activeTab === "created"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  Created by Me
                </button>
                <button
                  onClick={() => setActiveTab("overdue")}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${activeTab === "overdue"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  Overdue
                </button>
              </div>

              {/* Search & Filters */}
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search tasks..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <select
                  className="block pl-3 pr-10 py-2 text-base border text-gray-900 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>

                <select
                  className="block pl-3 pr-10 py-2 text-base border border-gray-300 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                >
                  <option value="all">All Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Task List */}
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <div className="loader"></div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-500">No tasks found matching your criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTasks.map(task => (
                    <tr key={task?._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">{task.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{task.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${new Date(task.dueDate) < new Date() && task.status !== "completed"
                          ? "text-red-600 font-medium"
                          : "text-gray-900"
                          }`}>
                          {formatDate(task.dueDate)}
                          {new Date(task.dueDate) < new Date() && task.status !== "completed" && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              Overdue
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          {getStatusIcon(task.status)}
                          <span className="ml-1.5 capitalize">
                            {task.status.replace("-", " ")}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {task.assignedTo.name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}