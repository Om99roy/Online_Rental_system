import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Users,
  UserCheck,
  UserX,
  ShieldAlert,
  Trash2,
  ShieldCheck,
  Shield,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Ban,
  Play,
} from "lucide-react";
import StatCard from "../components/Statcard";

// Add these to your lib/api.ts ADMIN namespace once it exists —
// hardcoded here for now so this page is drop-in runnable.
const ADMIN_API = {
  DASHBOARD: "/api/admin/dashboard",
  USERS: "/api/admin/users",
  USER: (id: string) => `/api/admin/users/${id}`,
  USER_STATUS: (id: string) => `/api/admin/users/${id}/status`,
  USER_ROLE: (id: string) => `/api/admin/users/${id}/role`,
};

const REFRESH_INTERVAL_MS = 8000;
const PAGE_LIMIT = 10;

type Role = "CUSTOMER" | "ADMIN";
type AccountStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "DELETED";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  deletedUsers: number;
  adminUsers: number;
  regularUsers: number;
}

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: Role;
  status: AccountStatus;
  emailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

const statusStyles: Record<AccountStatus, string> = {
  ACTIVE: "bg-green-500/10 text-green-400 border-green-500/20",
  INACTIVE: "bg-surface-2 text-text-muted border-border",
  SUSPENDED: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  DELETED: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "">("");
  const [statusFilter, setStatusFilter] = useState<AccountStatus | "">("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await axios.get(ADMIN_API.DASHBOARD, { withCredentials: true });
      setStats(res.data.data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchUsers = useCallback(
    async (page = pagination.page) => {
      try {
        const res = await axios.get(ADMIN_API.USERS, {
          withCredentials: true,
          params: {
            page,
            limit: PAGE_LIMIT,
            search: search || undefined,
            role: roleFilter || undefined,
            status: statusFilter || undefined,
          },
        });
        setUsers(res.data.data.users);
        setPagination({
          page: res.data.data.pagination.page,
          totalPages: res.data.data.pagination.totalPages,
          total: res.data.data.pagination.total,
        });
      } catch (e) {
        console.error(e);
        toast.error("Failed to load users");
      }
    },
    [pagination.page, search, roleFilter, statusFilter]
  );

  const loadAll = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) setLoading(true);
      else setRefreshing(true);
      await Promise.all([fetchDashboard(), fetchUsers(1)]);
      if (!opts?.silent) setLoading(false);
      else setRefreshing(false);
    },
    [fetchDashboard, fetchUsers]
  );

  // Initial load
  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch users when filters/search/page change
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, roleFilter, statusFilter, pagination.page]);

  // Real-time polling
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboard();
      fetchUsers();
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchDashboard, fetchUsers]);

  const handleRoleToggle = async (user: AdminUser) => {
    const nextRole: Role = user.role === "ADMIN" ? "CUSTOMER" : "ADMIN";
    setPendingActionId(user.id);
    try {
      await axios.patch(ADMIN_API.USER_ROLE(user.id), { role: nextRole }, { withCredentials: true });
      toast.success(`${user.username} is now ${nextRole === "ADMIN" ? "an Admin" : "a Customer"}`);
      await Promise.all([fetchDashboard(), fetchUsers()]);
    } catch (e) {
      console.error(e);
      toast.error("Couldn't update role");
    } finally {
      setPendingActionId(null);
    }
  };

  const handleStatusToggle = async (user: AdminUser) => {
    const nextStatus: AccountStatus = user.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    setPendingActionId(user.id);
    try {
      await axios.patch(ADMIN_API.USER_STATUS(user.id), { status: nextStatus }, { withCredentials: true });
      toast.success(`${user.username} ${nextStatus === "SUSPENDED" ? "suspended" : "reactivated"}`);
      await Promise.all([fetchDashboard(), fetchUsers()]);
    } catch (e) {
      console.error(e);
      toast.error("Couldn't update status");
    } finally {
      setPendingActionId(null);
    }
  };

  const handleDelete = async (user: AdminUser) => {
    setPendingActionId(user.id);
    try {
      await axios.delete(ADMIN_API.USER(user.id), { withCredentials: true });
      toast.success(`${user.username} deleted`);
      setConfirmDeleteId(null);
      await Promise.all([fetchDashboard(), fetchUsers()]);
    } catch (e) {
      console.error(e);
      toast.error("Couldn't delete user");
    } finally {
      setPendingActionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold purple-fade-text">Admin Dashboard</h1>
            <p className="text-text-muted text-sm mt-1">Live user metrics — refreshes every 8s</p>
          </div>
          <button
            onClick={() => loadAll({ silent: true })}
            disabled={refreshing}
            className="bg-primary hover:bg-secondary transition-colors text-white font-medium text-sm rounded-lg px-4 py-2 flex items-center gap-2 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        {loading || !stats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-[68px] bg-surface border border-border rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Total Users" value={stats.totalUsers} icon={Users} accent="primary" />
            <StatCard label="Active" value={stats.activeUsers} icon={UserCheck} accent="green" />
            <StatCard label="Inactive" value={stats.inactiveUsers} icon={UserX} accent="muted" />
            <StatCard label="Suspended" value={stats.suspendedUsers} icon={ShieldAlert} accent="amber" />
            <StatCard label="Deleted" value={stats.deletedUsers} icon={Trash2} accent="red" />
            <StatCard label="Admins" value={stats.adminUsers} icon={ShieldCheck} accent="primary" />
            <StatCard label="Customers" value={stats.regularUsers} icon={Shield} accent="muted" />
          </div>
        )}

        {/* Filters */}
        <div className="bg-surface border border-border rounded-xl p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              placeholder="Search username or email..."
              className="w-full bg-surface-2 border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-text placeholder:text-text-subtle outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as Role | "");
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-primary"
          >
            <option value="">All roles</option>
            <option value="ADMIN">Admin</option>
            <option value="CUSTOMER">Customer</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as AccountStatus | "");
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text outline-none focus:border-primary"
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="DELETED">Deleted</option>
          </select>
        </div>

        {/* User table */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-text-muted">
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Verified</th>
                  <th className="px-4 py-3 font-medium">Last login</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-text-muted">
                      <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" />
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-text-muted">
                      No users match these filters.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const isBusy = pendingActionId === user.id;
                    return (
                      <tr key={user.id} className="border-b border-border last:border-0 hover:bg-surface-2/50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-text">{user.username}</div>
                          <div className="text-text-muted text-xs">{user.email}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${user.role === "ADMIN"
                              ? "bg-primary/10 text-primary border-primary/20"
                              : "bg-surface-2 text-text-muted border-border"
                              }`}
                          >
                            {user.role === "ADMIN" && <ShieldCheck className="w-3 h-3" />}
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${statusStyles[user.status]}`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-text-muted">{user.emailVerified ? "Yes" : "No"}</td>
                        <td className="px-4 py-3 text-text-muted">
                          {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleRoleToggle(user)}
                              disabled={isBusy}
                              title={user.role === "ADMIN" ? "Demote to Customer" : "Promote to Admin"}
                              className="bg-primary hover:bg-secondary transition-colors text-white text-xs font-medium rounded-md px-2.5 py-1.5 flex items-center gap-1 disabled:opacity-50"
                            >
                              {isBusy ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : user.role === "ADMIN" ? (
                                <Shield className="w-3.5 h-3.5" />
                              ) : (
                                <ShieldCheck className="w-3.5 h-3.5" />
                              )}
                              {user.role === "ADMIN" ? "Demote" : "Promote"}
                            </button>

                            <button
                              onClick={() => handleStatusToggle(user)}
                              disabled={isBusy || user.status === "DELETED"}
                              title={user.status === "SUSPENDED" ? "Reactivate" : "Suspend"}
                              className="bg-surface-2 hover:bg-border transition-colors text-text text-xs font-medium rounded-md px-2.5 py-1.5 flex items-center gap-1 disabled:opacity-50 border border-border"
                            >
                              {user.status === "SUSPENDED" ? (
                                <Play className="w-3.5 h-3.5" />
                              ) : (
                                <Ban className="w-3.5 h-3.5" />
                              )}
                              {user.status === "SUSPENDED" ? "Activate" : "Suspend"}
                            </button>

                            {confirmDeleteId === user.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDelete(user)}
                                  disabled={isBusy}
                                  className="bg-red-600 hover:bg-red-700 transition-colors text-white text-xs font-medium rounded-md px-2.5 py-1.5 disabled:opacity-50"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="text-text-muted text-xs px-2 py-1.5 hover:text-text"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteId(user.id)}
                                disabled={isBusy || user.status === "DELETED"}
                                title="Delete user"
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors rounded-md p-1.5 disabled:opacity-40"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm text-text-muted">
            <span>
              Page {pagination.page} of {pagination.totalPages || 1} · {pagination.total} users
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
                disabled={pagination.page <= 1}
                className="bg-primary hover:bg-secondary transition-colors text-white rounded-md p-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPagination((p) => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
                disabled={pagination.page >= pagination.totalPages}
                className="bg-primary hover:bg-secondary transition-colors text-white rounded-md p-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}