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
  Tag
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
  const getStatusIcon = (s) => {
    const cls =
      s === 'completed'
        ? 'bg-green-500'
        : s === 'in-progress'
        ? 'bg-blue-500'
        : s === 'cancelled'
        ? 'bg-red-500'
        : 'bg-yellow-500';
    return <div className={`h-3 w-3 rounded-full ${cls}`} />;
  };

  const getPriorityColor = (p) =>
    ({
      urgent: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }[p] || 'bg-green-100 text-green-800 border-green-200');

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
      toast.success('File downloaded');
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
      toast.success('Task deleted');
      navigate('/tasks');
    } catch (err) {
      toast.error(err.message || 'Failed to delete task');
    }
  };

  /* ──────────────────────────────────────────────────────────
     RENDER
  ────────────────────────────────────────────────────────── */
  if (loading)
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full" />
        <span className="ml-2 text-gray-600">Loading task…</span>
      </div>
    );

  if (error)
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => navigate('/tasks')}
          className="mt-4 px-4 py-2 bg-gray-300 rounded-lg"
        >
          Back to tasks
        </button>
      </div>
    );

  if (!currentTask) return null; // safety

  return (
    <div className="max-w-4xl mx-auto">
      {/* header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/tasks')}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="ml-4 text-2xl font-bold">Task Details</h1>
        </div>

        <div className="flex gap-2">
          {canEdit && (
            <Link
              to={`/tasks/${id}/edit`}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Link>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* card */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* header row */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">{currentTask.title}</h2>
          <div className="flex items-center gap-2 capitalize">
            {getStatusIcon(currentTask.status)}
            <span>{currentTask.status?.replace('-', ' ')}</span>
          </div>
        </div>

        {/* body */}
        <div className="p-6 space-y-8">
          {/* grid info */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* priority */}
            <Info label="Priority">
              <span
                className={`px-3 py-1 rounded-full border text-sm font-semibold capitalize ${getPriorityColor(
                  currentTask.priority
                )}`}
              >
                {currentTask.priority}
              </span>
            </Info>

            <Info label="Due Date">
              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
              {currentTask.dueDate
                ? format(new Date(currentTask.dueDate), 'MMMM dd, yyyy')
                : '—'}
            </Info>

            <Info label="Assigned To">
              <User className="h-4 w-4 mr-2 text-gray-400" />
              {currentTask.assignedTo
                ? `${currentTask.assignedTo.firstName} ${currentTask.assignedTo.lastName}`
                : 'Unassigned'}
            </Info>

            <Info label="Created By">
              <User className="h-4 w-4 mr-2 text-gray-400" />
              {currentTask.createdBy
                ? `${currentTask.createdBy.firstName} ${currentTask.createdBy.lastName}`
                : '—'}
            </Info>

            <Info label="Created">
              <Clock className="h-4 w-4 mr-2 text-gray-400" />
              {format(new Date(currentTask.createdAt), 'MMM dd, yyyy HH:mm')}
            </Info>

            <Info label="Updated">
              <Clock className="h-4 w-4 mr-2 text-gray-400" />
              {format(new Date(currentTask.updatedAt), 'MMM dd, yyyy HH:mm')}
            </Info>
          </div>

          {/* description */}
          {currentTask.description && (
            <Section label="Description">
              <p className="whitespace-pre-wrap text-gray-900">
                {currentTask.description}
              </p>
            </Section>
          )}

          {/* tags */}
          {!!currentTask.tags?.length && (
            <Section label="Tags">
              <div className="flex flex-wrap gap-2">
                {currentTask.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-xs"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {t}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* attachments */}
          {!!currentTask.attachments?.length && (
            <Section label={`Attachments (${currentTask.attachments.length})`}>
              <div className="space-y-2">
                {currentTask.attachments.map((att) => (
                  <div
                    key={att.filename}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                  >
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-red-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium">
                          {att.originalName || att.filename}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(att.size / 1024 / 1024).toFixed(2)} MB •{' '}
                          {format(new Date(att.uploadedAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        downloadAttachment(att.filename, att.originalName)
                      }
                      className="flex items-center px-3 py-1 bg-blue-100 text-xs text-blue-600 rounded-full hover:bg-blue-200"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────── */
/* Reusable helpers                                           */
/* ────────────────────────────────────────────────────────── */

const Info = ({ label, children }) => (
  <div>
    <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
    <div className="flex items-center text-sm text-gray-900">{children}</div>
  </div>
);

const Section = ({ label, children }) => (
  <div>
    <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
    {children}
  </div>
);

export default TaskDetail;
