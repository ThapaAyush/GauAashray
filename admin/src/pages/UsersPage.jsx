import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Search,
  Filter,
  Edit2,
  Trash2,
  KeyRound,
  CheckCircle,
  XCircle,
  Shield,
  Loader2,
  X,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'PUBLIC_USER',
    status: 'ACTIVE',
    newPassword: ''
  });
  const [saving, setSaving] = useState(false);

  // Delete modal state
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (roleFilter !== 'ALL') params.role = roleFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await api.get('/admin/users', { params });
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching users from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setEditForm({
      name: u.name || '',
      phone: u.phone || '',
      email: u.email || '',
      role: u.role || 'PUBLIC_USER',
      status: u.status || 'ACTIVE',
      newPassword: ''
    });
    setEditModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: editForm.name,
        phone: editForm.phone,
        email: editForm.email,
        role: editForm.role,
        status: editForm.status
      };
      if (editForm.newPassword) {
        payload.newPassword = editForm.newPassword;
      }

      const res = await api.put(`/admin/users/${editingUser._id}`, payload);
      if (res.data.success) {
        setSuccessMsg(`User ${editForm.name} updated successfully.`);
        setEditModalOpen(false);
        fetchUsers();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving user changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/admin/users/${deleteConfirmUser._id}`);
      if (res.data.success) {
        setSuccessMsg('User removed successfully.');
        setDeleteConfirmUser(null);
        fetchUsers();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting user.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E8E1D5] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#593713]">Users Management</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FAF6ED] text-[#80501D] border border-[#D9CEBF]">
              {users.length} Total
            </span>
          </div>
          <p className="text-sm text-[#7D6B58] mt-1">
            Live database records from MongoDB Atlas for all Citizens, Gaushala Owners, and Admins.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#FAF6ED] text-[#80501D] border border-[#D9CEBF] hover:bg-[#F3ECE0] transition-colors disabled:opacity-60 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E1D5] shadow-sm flex flex-col md:flex-row gap-4">
        {/* Search Box */}
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8F7E6F]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone or email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D9CEBF] text-sm focus:border-[#80501D] focus:ring-1 focus:ring-[#80501D] outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-[#80501D] text-white text-xs font-bold hover:bg-[#684117] transition-colors"
          >
            Search
          </button>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#7D6B58]" />
            <span className="text-xs font-bold text-[#7D6B58] uppercase">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#D9CEBF] text-xs font-semibold text-[#372A1C] bg-white focus:border-[#80501D] outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="PUBLIC_USER">Citizen / Public User</option>
              <option value="GAUSHALA_OWNER">Gaushala Owner</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#7D6B58] uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#D9CEBF] text-xs font-semibold text-[#372A1C] bg-white focus:border-[#80501D] outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-[#E8E1D5] shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-[#7D6B58]">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#80501D] mb-3" />
            <p className="text-sm font-semibold">Loading users from MongoDB Atlas...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-[#7D6B58]">
            <Users className="w-10 h-10 mx-auto text-[#D9CEBF] mb-2" />
            <p className="text-base font-bold text-[#372A1C]">No users found</p>
            <p className="text-xs mt-1">Try adjusting your search criteria or role filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E8E1D5] text-[11px] uppercase tracking-wider text-[#7D6B58] font-bold">
                  <th className="py-3.5 px-5">User</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Gaushala Org</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE8DD] text-sm">
                {users.map((u) => {
                  const isSelf = currentUser?._id === u._id;
                  return (
                    <tr key={u._id} className="hover:bg-[#FAF6ED]/50 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#FAF3E7] text-[#80501D] font-bold border border-[#E0D3C1] flex items-center justify-center text-xs shrink-0">
                            {u.name ? u.name.slice(0, 2).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-[#372A1C] flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isSelf && (
                                <span className="text-[10px] bg-[#E8F4E6] text-[#35632A] px-1.5 py-0.2 rounded font-bold">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-[#8F7E6F] font-mono">ID: {u._id.slice(-6)}</div>
                          </div>
                        </div>
                      </td>

                      {/* Phone & Email */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs text-[#372A1C]">{u.phone}</div>
                        <div className="text-xs text-[#7D6B58]">{u.email || '—'}</div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        {u.role === 'SUPER_ADMIN' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-[#F5EEFB] text-[#7E3AF2] border border-[#E4D4F7]">
                            <Shield className="w-3 h-3" />
                            Super Admin
                          </span>
                        ) : u.role === 'GAUSHALA_OWNER' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FAF3E7] text-[#80501D] border border-[#E5D7C3]">
                            Gaushala Owner
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#E8F4E6] text-[#35632A] border border-[#CDE5C9]">
                            Public User
                          </span>
                        )}
                      </td>

                      {/* Gaushala association */}
                      <td className="py-3.5 px-4 text-xs">
                        {u.gaushala ? (
                          <div>
                            <span className="font-bold text-[#372A1C]">{u.gaushala.name}</span>
                            <div className="text-[11px] text-[#7D6B58]">
                              {u.gaushala.city}, {u.gaushala.state}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[#AD9F8F]">None</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {u.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#35632A]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#419634]"></span>
                            Active
                          </span>
                        ) : u.status === 'SUSPENDED' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-xs text-[#7D6B58]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-1.5 rounded-lg text-[#80501D] hover:bg-[#FAF3E7] transition-colors"
                            title="Edit User Details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {!isSelf && (
                            <button
                              onClick={() => setDeleteConfirmUser(u)}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E8E1D5] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#EFE8DD] mb-5">
              <div>
                <h3 className="text-lg font-bold text-[#372A1C]">Edit User Details</h3>
                <p className="text-xs text-[#7D6B58]">Update user information saved in MongoDB.</p>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1.5 rounded-lg text-[#7D6B58] hover:bg-[#FAF6ED]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-[#593713] uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CEBF] text-sm focus:border-[#80501D] outline-none"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-[#593713] uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CEBF] text-sm focus:border-[#80501D] outline-none font-mono"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-[#593713] uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CEBF] text-sm focus:border-[#80501D] outline-none"
                  placeholder="e.g. name@example.com"
                />
              </div>

              {/* Role */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#593713] uppercase mb-1">Role</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CEBF] text-sm focus:border-[#80501D] outline-none bg-white"
                  >
                    <option value="PUBLIC_USER">Public User</option>
                    <option value="GAUSHALA_OWNER">Gaushala Owner</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-[#593713] uppercase mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CEBF] text-sm focus:border-[#80501D] outline-none bg-white"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              </div>

              {/* Reset Password */}
              <div className="pt-2 border-t border-[#EFE8DD]">
                <label className="block text-xs font-bold text-[#593713] uppercase mb-1">
                  Reset Password (Leave blank to keep unchanged)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={editForm.newPassword}
                    onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                    placeholder="Enter new password (min 6 characters)"
                    className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-[#D9CEBF] text-sm focus:border-[#80501D] outline-none font-mono"
                  />
                  <KeyRound className="w-4 h-4 text-[#8F7E6F] absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EFE8DD]">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#7D6B58] hover:bg-[#FAF6ED]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-[#80501D] text-white text-xs font-bold hover:bg-[#684117] disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-red-200">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-[#372A1C]">Confirm Delete User</h3>
            </div>
            <p className="text-sm text-[#7D6B58] mb-4">
              Are you sure you want to permanently delete{' '}
              <strong className="text-[#372A1C]">{deleteConfirmUser.name}</strong> ({deleteConfirmUser.phone}) from
              MongoDB Atlas? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#7D6B58] hover:bg-[#FAF6ED]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-50 flex items-center gap-1.5"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;

