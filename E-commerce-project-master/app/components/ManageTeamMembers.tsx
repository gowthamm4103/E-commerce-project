'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  X, 
  Check, 
  AlertCircle, 
  CheckCircle,
  Users,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { businessAPI } from '../lib/api';
import type { UserData } from '../types';

interface ManageTeamMembersProps {
  user: UserData;
  onBack: () => void;
}

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: 'standard_member' | 'premium_member';
  isActive: boolean;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

type ViewMode = 'list' | 'add' | 'edit';

export default function ManageTeamMembers({ user, onBack }: ManageTeamMembersProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>('list');
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'standard_member' as 'standard_member' | 'premium_member'
  });

  useEffect(() => {
    loadTeamMembers();
  }, []);

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveActionMenu(null);
    if (activeActionMenu) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeActionMenu]);

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      const res = await businessAPI.getTeamMembers() as { success: boolean; members: TeamMember[] };
      if (res.success) {
        setMembers(res.members || []);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to load team members.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', role: 'standard_member' });
    setEditingMember(null);
    setView('list');
  };

  const handleAddMember = async () => {
    if (!formData.name || !formData.email || !formData.role) {
      setErrorMessage('Name, email, and role are required.');
      return;
    }

    try {
      const res = await businessAPI.createTeamMember(formData);
      if (res.success) {
        setSuccessMessage('Team member added successfully!');
        resetForm();
        loadTeamMembers();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to add team member.');
    }
  };

  const handleUpdateMember = async () => {
    if (!formData.name || !formData.email || !formData.role) {
      setErrorMessage('Name, email, and role are required.');
      return;
    }

    if (!editingMember) return;

    try {
      const res = await businessAPI.updateTeamMember(editingMember._id, formData);
      if (res.success) {
        setSuccessMessage('Team member updated successfully!');
        resetForm();
        loadTeamMembers();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update team member.');
    }
  };

  const handleEditClick = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      role: member.role
    });
    setView('edit');
    setActiveActionMenu(null);
  };

  const handleToggleStatus = async (member: TeamMember) => {
    try {
      const res = await businessAPI.updateTeamMember(member._id, { 
        isActive: !member.isActive 
      });
      if (res.success) {
        setSuccessMessage(`Team member ${member.isActive ? 'deactivated' : 'activated'} successfully!`);
        loadTeamMembers();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update team member status.');
    }
    setActiveActionMenu(null);
  };

  const handleDeleteClick = (memberId: string) => {
    setShowDeleteConfirm(memberId);
    setActiveActionMenu(null);
  };

  const handleConfirmDelete = async () => {
    if (!showDeleteConfirm) return;

    try {
      const res = await businessAPI.deleteTeamMember(showDeleteConfirm);
      if (res.success) {
        setSuccessMessage('Team member removed successfully!');
        setShowDeleteConfirm(null);
        loadTeamMembers();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to remove team member.');
    }
  };

  const handleActionClick = (e: React.MouseEvent, memberId: string) => {
    e.stopPropagation();
    setActiveActionMenu(activeActionMenu === memberId ? null : memberId);
  };

  const getRoleBadge = (role: string) => {
    const isPremium = role === 'premium_member';
    return (
      <span
        className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
          isPremium
            ? 'bg-purple-100 text-purple-800'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        {isPremium ? 'Premium Member' : 'Standard Member'}
      </span>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span
        className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
          isActive
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}
      >
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  // Render Add/Edit Form
  if (view === 'add' || view === 'edit') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={resetForm}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <h2 className="text-xl font-bold text-gray-900">
                  {view === 'add' ? 'Add New Team Member' : 'Edit Team Member'}
                </h2>
              </div>
            </div>

            {/* Messages */}
            {successMessage && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <CheckCircle size={18} className="text-green-600" />
                <span className="text-green-800 text-sm">{successMessage}</span>
              </div>
            )}
            {errorMessage && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle size={18} className="text-red-600" />
                <span className="text-red-800 text-sm">{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Member Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter team member name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Member Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter team member email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Member Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    role: e.target.value as 'standard_member' | 'premium_member' 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="standard_member">Standard Member</option>
                  <option value="premium_member">Premium Member</option>
                </select>
                <p className="mt-2 text-sm text-gray-500">
                  <strong>Standard Member:</strong> Can add products and edit only their own products.<br/>
                  <strong>Premium Member:</strong> Can add products and edit any product of the brand.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={view === 'add' ? handleAddMember : handleUpdateMember}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {view === 'add' ? 'Add Member' : 'Update Member'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render List View
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Manage Team Members</h2>
                <p className="text-sm text-gray-500">Add and manage your team members who can help with product management</p>
              </div>
            </div>
            <button
              onClick={() => setView('add')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={16} />
              Add Team Member
            </button>
          </div>

          {/* Messages */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-green-600" />
                <span className="text-green-800 text-sm">{successMessage}</span>
              </div>
              <button onClick={() => setSuccessMessage(null)} className="text-green-600 hover:text-green-800">
                <X size={16} />
              </button>
            </div>
          )}
          {errorMessage && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle size={18} className="text-red-600" />
                <span className="text-red-800 text-sm">{errorMessage}</span>
              </div>
              <button onClick={() => setErrorMessage(null)} className="text-red-600 hover:text-red-800">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Info Banner */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Team Member Access:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Team members can only access the <strong>Product Management</strong> page.</li>
                <li><strong>Standard Members</strong> can add products and edit only their own products.</li>
                <li><strong>Premium Members</strong> can add products and edit any product of the brand.</li>
                <li>Team members login using their email address (no password required).</li>
              </ul>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="animate-spin mx-auto h-8 w-8 text-blue-600 mb-3" />
              <p className="text-gray-500">Loading team members...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Team Members Yet</h3>
              <p className="text-gray-500 mb-4">Add your first team member to get started.</p>
              <button
                onClick={() => setView('add')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
              >
                <Plus size={16} />
                Add First Team Member
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {members.map((member) => (
                    <tr key={member._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {member.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {member.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(member.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(member.isActive)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={(e) => handleActionClick(e, member._id)}
                            className="p-1 rounded-full hover:bg-gray-100"
                          >
                            <MoreVertical size={18} className="text-gray-500" />
                          </button>
                          
                          {activeActionMenu === member._id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                              <div className="py-1">
                                <button
                                  onClick={() => handleEditClick(member)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Edit size={16} className="mr-2" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleToggleStatus(member)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  {member.isActive ? (
                                    <>
                                      <X size={16} className="mr-2" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <Check size={16} className="mr-2" />
                                      Activate
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(member._id)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 size={16} className="mr-2" />
                                  Remove
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowDeleteConfirm(null)}></div>
          <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-red-600" size={24} />
              <h3 className="text-lg font-bold text-gray-900">Confirm Removal</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove this team member? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}