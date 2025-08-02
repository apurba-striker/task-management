// frontend/src/components/TaskDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  User,
  Clock,
  AlertCircle,
  FileText,
  Download,
  Edit,
  Trash2,
  ArrowLeft,
  Tag,
  CheckCircle,
  XCircle,
  Target,
  Users,
  FileIcon,
  Eye,
  Share2,
  MoreVertical,
  Flag,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import useTaskStore from '../store/taskStore';
import useAuthStore from '../store/authStore';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { currentTask, loading, fetchTask, deleteTask } = useTaskStore();
  const { isAuthenticated, token, user } = useAuthStore();

  const [error, setError] = useState(null);

  /* ──────────────────────────────────────────────────────────
     LOAD TASK
  ────────────────────────────────────────────────────────── */
  useEffect(() => {
    const load = async () => {
      if (!isAuthenticated || !token || !user) {
        toast.error('Please log in to view task details');
        return navigate('/login');
      }

      if (!id) {
        setError('Task ID is missing from URL');
        return;
      }

      try {
        await fetchTask(id);
      } catch (err) {
        let msg = err.message || 'Failed to load task details';
        if (/401|token/i.test(msg)) {
          toast.error('Session expired – log in again');
          return navigate('/login');
        }
        if (/403|Access denied/i.test(msg)) msg = 'You do not have permission to view this task.';
        if (/404|not found/i.test(msg)) msg = 'Task not found.';
        toast.error(msg);
        setError(msg);
      }
    };

    load();
  }, [id, isAuthenticated, token, user, fetchTask, navigate]);

  /* ──────────────────────────────────────────────────────────
     PERMISSIONS
  ────────────────────────────────────────────────────────── */
  const canEdit =
    user?.role === 'admin' ||
    currentTask?.createdBy?._id === user?._id ||
    currentTask?.assignedTo?._id === user?._id;

  const canDelete =
    user?.role === 'admin' || currentTask?.createdBy?._id === user?._id;

  /* ──────────────────────────────────────────────────────────
     HELPERS
  ────────────────────────────────────────────────────────── */
  const getStatusInfo = (status) => {
    switch (status) {
      case 'completed':
        return {
          color: 'bg-green-500',
          bgColor: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          textColor: 'text-green-600',
          emoji: '✅'
        };
      case 'in-progress':
        return {
          color: 'bg-blue-500',
          bgColor: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Activity,
          textColor: 'text-blue-600',
          emoji: '🔄'
        };
      case 'cancelled':
        return {
          color: 'bg-red-500',
          bgColor: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          textColor: 'text-red-600',
          emoji: '❌'
        };
      default:
        return {
          color: 'bg-yellow-500',
          bgColor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
          textColor: 'text-yellow-600',
          emoji: '⏳'
        };
    }
  };

  const getPriorityInfo = (priority) => {
    switch (priority) {
      case 'urgent':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          emoji: '🔴',
          bgGradient: 'from-red-50 to-red-100'
        };
      case 'high':
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          emoji: '🟠',
          bgGradient: 'from-orange-50 to-orange-100'
        };
      case 'medium':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          emoji: '🟡',
          bgGradient: 'from-yellow-50 to-yellow-100'
        };
      default:
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          emoji: '🟢',
          bgGradient: 'from-green-50 to-green-100'
        };
    }
  };

  /* ──────────────────────────────────────────────────────────
     DOWNLOAD
  ────────────────────────────────────────────────────────── */
  const downloadAttachment = async (filename, originalName) => {
    try {
      const res = await fetch(`/api/files/download/${id}/${filename}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message || `Download failed (${res.status})`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = originalName || filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
      toast.success('📥 File downloaded successfully');
    } catch (err) {
      toast.error(err.message);
    }
  };

  /* ──────────────────────────────────────────────────────────
     DELETE
  ────────────────────────────────────────────────────────── */
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(id);
      toast.success('🗑️ Task deleted successfully');
      navigate('/tasks');
    } catch (err) {
      toast.error(err.message || 'Failed to delete task');
    }
  };

  const isOverdue = currentTask && currentTask.status !== 'completed' && new Date(currentTask.dueDate) < new Date();
  const statusInfo = currentTask ? getStatusInfo(currentTask.status) : null;
  const priorityInfo = currentTask ? getPriorityInfo(currentTask.priority) : null;

  /* ──────────────────────────────────────────────────────────
     RENDER
  ────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <span className="text-gray-600 font-medium">Loading task details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Task</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/tasks')}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  if (!currentTask) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 lg:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <div className="bg-white shadow-lg rounded-2xl p-6 lg:p-8 border border-gray-100 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 transform translate-x-16 -translate-y-16"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/tasks')}
                className="p-3 hover:bg-gray-100 rounded-xl transition-colors duration-200 group"
                title="Back to Tasks"
              >
                <ArrowLeft className="h-6 w-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Target className="h-8 w-8 mr-3 text-blue-600" />
                  Task Details
                </h1>
                <p className="text-gray-600 mt-1 flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  Viewing task information and attachments
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {canEdit && (
                <Link
                  to={`/tasks/${id}/edit`}
                  className="group inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <Edit className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                  Edit Task
                </Link>
              )}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  className="group inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <Trash2 className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform duration-200" />
                  Delete Task
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden">
          {/* Task Title Header */}
          <div className="px-6 lg:px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 flex items-start">
                  {currentTask.title}
                  {isOverdue && (
                    <span className="ml-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 animate-pulse">
                      ⚠️ Overdue
                    </span>
                  )}
                </h2>
                {currentTask.description && (
                  <p className="text-gray-600 text-sm lg:text-base line-clamp-2">
                    {currentTask.description.substring(0, 120)}
                    {currentTask.description.length > 120 && '...'}
                  </p>
                )}
              </div>
              
              {/* Status Badge */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full ${statusInfo.color} animate-pulse`}></div>
                  {statusInfo.icon && <statusInfo.icon className={`h-5 w-5 ${statusInfo.textColor}`} />}
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${statusInfo.bgColor}`}>
                    <span className="mr-1">{statusInfo.emoji}</span>
                    {currentTask.status?.replace('-', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Task Information Grid */}
          <div className="p-6 lg:p-8 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Priority */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Flag className="h-4 w-4 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Priority</span>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${priorityInfo.color}`}>
                  <span className="mr-1">{priorityInfo.emoji}</span>
                  {currentTask.priority}
                </span>
              </div>

              {/* Due Date */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Due Date</span>
                </div>
                <p className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                  {currentTask.dueDate
                    ? format(new Date(currentTask.dueDate), 'MMM dd, yyyy')
                    : 'No due date'}
                </p>
              </div>

              {/* Assigned To */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Assigned To</span>
                </div>
                <div className="flex items-center space-x-2">
                  {currentTask.assignedTo && (
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      {currentTask.assignedTo.firstName?.[0]}
                    </div>
                  )}
                  <p className="text-sm font-medium text-gray-900">
                    {currentTask.assignedTo
                      ? `${currentTask.assignedTo.firstName} ${currentTask.assignedTo.lastName}`
                      : 'Unassigned'}
                  </p>
                </div>
              </div>

              {/* Created By */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Created By</span>
                </div>
                <div className="flex items-center space-x-2">
                  {currentTask.createdBy && (
                    <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      {currentTask.createdBy.firstName?.[0]}
                    </div>
                  )}
                  <p className="text-sm font-medium text-gray-900">
                    {currentTask.createdBy
                      ? `${currentTask.createdBy.firstName} ${currentTask.createdBy.lastName}`
                      : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Information */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Description */}
                {currentTask.description && (
                  <Section
                    icon={FileText}
                    label="Description"
                    className="bg-blue-50 border-blue-100"
                  >
                    <div className="bg-white rounded-xl p-4 border border-blue-100">
                      <p className="whitespace-pre-wrap text-gray-900 leading-relaxed">
                        {currentTask.description}
                      </p>
                    </div>
                  </Section>
                )}

                {/* Tags */}
                {currentTask.tags?.length > 0 && (
                  <Section
                    icon={Tag}
                    label={`Tags (${currentTask.tags.length})`}
                    className="bg-purple-50 border-purple-100"
                  >
                    <div className="flex flex-wrap gap-2">
                      {currentTask.tags.map((tag, index) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-purple-200 text-sm font-medium text-purple-800 hover:bg-purple-100 transition-colors duration-200"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </Section>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Timeline */}
                <Section
                  icon={Clock}
                  label="Timeline"
                  className="bg-green-50 border-green-100"
                >
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-green-100">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Created</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(currentTask.createdAt), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-green-100">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Last Updated</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(currentTask.updatedAt), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                  </div>
                </Section>

                {/* Attachments */}
                {currentTask.attachments?.length > 0 && (
                  <Section
                    icon={FileIcon}
                    label={`Attachments (${currentTask.attachments.length})`}
                    className="bg-red-50 border-red-100"
                  >
                    <div className="space-y-3">
                      {currentTask.attachments.map((attachment, index) => (
                        <div
                          key={attachment.filename}
                          className="group flex items-center justify-between bg-white p-4 rounded-xl border border-red-100 hover:border-red-200 hover:shadow-md transition-all duration-200"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                              <FileText className="h-5 w-5 text-red-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {attachment.originalName || attachment.filename}
                              </p>
                              <p className="text-xs text-gray-500 flex items-center space-x-2">
                                <span>{(attachment.size / 1024 / 1024).toFixed(2)} MB</span>
                                <span>•</span>
                                <span>{format(new Date(attachment.uploadedAt), 'MMM dd, yyyy')}</span>
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => downloadAttachment(attachment.filename, attachment.originalName)}
                            className="group-hover:opacity-100 opacity-0 transition-opacity duration-200 inline-flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            title="Download file"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            <span className="text-xs font-medium">Download</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center text-sm text-gray-500">
              <Activity className="h-4 w-4 mr-1" />
              Task #{currentTask._id?.slice(-8)} • Last updated {format(new Date(currentTask.updatedAt), 'MMM dd, yyyy')}
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="inline-flex items-center px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                title="Share task link"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </button>
              
              <Link
                to="/tasks"
                className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tasks
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────── */
/* Enhanced Reusable Components                               */
/* ────────────────────────────────────────────────────────── */

const Section = ({ icon: Icon, label, children, className = "bg-gray-50 border-gray-100" }) => (
  <div className={`rounded-xl p-4 border ${className}`}>
    <div className="flex items-center space-x-2 mb-3">
      <div className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center">
        <Icon className="h-4 w-4 text-gray-600" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">{label}</h3>
    </div>
    {children}
  </div>
);

export default TaskDetail;
