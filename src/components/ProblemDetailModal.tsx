import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  Clock,
  FileText,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import { Difficulty, ProblemWithStats } from '../types/journal';
import { formatDateKey, StorageService } from '../services/storage';
import { MarkdownEditor, renderMarkdown } from '../utils/markdown';
import { getTagClasses } from '../utils/tagColors';

interface ProblemDetailModalProps {
  problemStat: ProblemWithStats | null;
  isOpen: boolean;
  onClose: () => void;
  onSolveAgain: (problemId: string) => void;
  onDeleteProblem: (problemId: string) => void;
  onDeleteAttempt: (attemptId: string) => void;
  onUpdateProblem: (problemId: string, title: string, tags: string[], leetcodeUrl?: string) => void;
  allTags: string[];
}

export const ProblemDetailModal: React.FC<ProblemDetailModalProps> = ({
  problemStat,
  isOpen,
  onClose,
  onSolveAgain,
  onDeleteProblem,
  onDeleteAttempt,
  onUpdateProblem,
  allTags,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editUrl, setEditUrl] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [isLoggingAttempt, setIsLoggingAttempt] = useState(false);
  const [attemptDate, setAttemptDate] = useState(formatDateKey());
  const [attemptDifficulty, setAttemptDifficulty] = useState<Difficulty>('Medium');
  const [attemptConfidence, setAttemptConfidence] = useState<number>(4);
  const [attemptNotes, setAttemptNotes] = useState('');

  // Track collapsed/expanded state of attempt notes in revision history
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  const toggleNotes = (attemptId: string) => {
    setExpandedNotes(prev => ({
      ...prev,
      [attemptId]: !prev[attemptId],
    }));
  };

  if (!isOpen || !problemStat) return null;

  const { problem, attempts, repetitionCount, lastSolvedDate, firstSolvedDate } = problemStat;

  const getFormattedUrl = (url?: string) => {
    if (!url) return '';
    const trimmed = url.trim();
    if (!trimmed) return '';
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  };

  const handleStartEdit = () => {
    setEditTitle(problem.title);
    setEditTags([...problem.tags]);
    setEditUrl(problem.leetcodeUrl || '');
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim()) return;
    onUpdateProblem(problem.id, editTitle.trim(), editTags, editUrl.trim() || undefined);
    setIsEditing(false);
  };

  const toggleEditTag = (tag: string) => {
    setEditTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSaveQuickAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemStat) return;

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch {
        // ignore
      }
    }

    StorageService.addAttempt({
      problemId: problem.id,
      date: attemptDate,
      feltDifficulty: attemptDifficulty,
      confidence: attemptConfidence,
      notes: attemptNotes.trim(),
    });

    setIsLoggingAttempt(false);
    setAttemptNotes('');
    onSolveAgain(problem.id);
  };

  const getDifficultyColor = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-emerald-600 dark:text-emerald-400 font-semibold';
      case 'Medium':
        return 'text-amber-600 dark:text-amber-400 font-semibold';
      case 'Hard':
        return 'text-rose-600 dark:text-rose-400 font-semibold';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-none max-w-xl md:max-w-2xl w-full max-h-[94vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-2 duration-100 font-sans">
        {/* Header */}
        <div className="flex items-start justify-between px-4 py-3.5 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="space-y-1.5 flex-1 pr-3">
            {!isEditing ? (
              <>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {problem.title}
                  </h3>
                  <span className="font-mono text-xs text-zinc-500">
                    {repetitionCount}x solved
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {problem.tags.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      {problem.tags.map(tag => (
                        <span
                          key={tag}
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded-none border ${getTagClasses(
                            tag
                          )}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {problem.leetcodeUrl && (
                    <a
                      href={getFormattedUrl(problem.leetcodeUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none border border-zinc-250 dark:border-zinc-750 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 text-xs font-mono font-medium hover:border-zinc-900 dark:hover:border-zinc-100 hover:text-zinc-950 dark:hover:text-white transition"
                      title="Open problem page in new tab"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Open Link</span>
                    </a>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  placeholder="Problem Title"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-none px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100 font-mono"
                />

                {/* Problem Link Input during edit */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                    <span>Problem Link:</span>
                    {editUrl.trim() && (
                      <a
                        href={getFormattedUrl(editUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-zinc-600 dark:text-zinc-300 hover:underline flex items-center gap-0.5"
                      >
                        <span>Visit</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                  <input
                    type="url"
                    value={editUrl}
                    onChange={e => setEditUrl(e.target.value)}
                    placeholder="https://leetcode.com/problems/... (or any URL)"
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-none px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>

                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-1 bg-zinc-50 dark:bg-zinc-950 rounded-none">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleEditTag(tag)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-none border ${
                        editTags.includes(tag)
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100 font-semibold'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {!isEditing ? (
              <button
                onClick={handleStartEdit}
                className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                title="Edit Title & Tags"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleSaveEdit}
                className="p-1 text-emerald-500"
                title="Save Changes"
              >
                <Check className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-4 space-y-3.5">
          {/* Metadata Row */}
          <div className="flex items-center justify-between text-xs text-zinc-500 border-b border-zinc-100 dark:border-zinc-800 pb-2.5 font-mono text-[11px]">
            <div>
              <span>First: </span>
              <span className="text-zinc-700 dark:text-zinc-300">{firstSolvedDate || 'N/A'}</span>
            </div>
            <div>
              <span>Last: </span>
              <span className="text-zinc-700 dark:text-zinc-300">{lastSolvedDate || 'N/A'}</span>
            </div>
          </div>

          {/* Action: Solve Again */}
          {!isLoggingAttempt ? (
            <button
              onClick={() => setIsLoggingAttempt(true)}
              className="w-full py-2 rounded-none border border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-mono font-bold text-xs shadow-none flex items-center justify-center gap-1.5 transition active:scale-98"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Solve Again / Log Revision Session</span>
            </button>
          ) : (
            /* Quick Form with Markdown Editor */
            <form
              onSubmit={handleSaveQuickAttempt}
              className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-none space-y-2.5"
            >
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
                <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  New Revision Attempt ({repetitionCount + 1}x)
                </span>
                <button
                  type="button"
                  onClick={() => setIsLoggingAttempt(false)}
                  className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Date</label>
                <input
                  type="date"
                  required
                  value={attemptDate}
                  onChange={e => setAttemptDate(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-none px-2.5 py-1 text-xs text-zinc-900 dark:text-zinc-100 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Difficulty</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map(diff => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setAttemptDifficulty(diff)}
                      className={`py-1 rounded-none text-xs font-mono font-semibold border ${
                        attemptDifficulty === diff
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Confidence</label>
                <div className="grid grid-cols-5 gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setAttemptConfidence(star)}
                      className={`py-1 rounded-none text-xs font-mono font-bold border ${
                        attemptConfidence === star
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                      }`}
                    >
                      {star}★
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                  Notes &amp; Insights (Markdown)
                </label>
                <MarkdownEditor
                  value={attemptNotes}
                  onChange={setAttemptNotes}
                  placeholder="Notes from this solve session..."
                  minLines={3}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-none border border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-mono font-bold text-xs"
              >
                Save Solve (+1 Repetition)
              </button>
            </form>
          )}

          {/* Chronological History with Markdown Notes */}
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Revision History ({attempts.length})
            </h4>

            <div className="space-y-2">
              {attempts.map(att => (
                <div
                  key={att.id}
                  className="group bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-850 rounded-none p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{att.date}</span>
                      <span aria-hidden="true" className="text-zinc-300 dark:text-zinc-700">·</span>
                      <span className={getDifficultyColor(att.feltDifficulty)}>
                        {att.feltDifficulty}
                      </span>
                      <span aria-hidden="true" className="text-zinc-300 dark:text-zinc-700">·</span>
                      <span className="text-zinc-500 font-mono">{att.confidence}★</span>
                    </div>

                    <button
                      onClick={() => onDeleteAttempt(att.id)}
                      className="text-zinc-400 hover:text-rose-500 p-0.5 opacity-0 group-hover:opacity-100 transition"
                      title="Delete attempt"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {att.notes && (
                    <div className="space-y-1.5 pt-0.5">
                      <button
                        type="button"
                        onClick={() => toggleNotes(att.id)}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-mono rounded-none border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-850 transition cursor-pointer"
                      >
                        <FileText className="w-3 h-3 text-zinc-400" />
                        <span>{expandedNotes[att.id] ? 'Hide Notes' : 'Open Notes'}</span>
                        {expandedNotes[att.id] ? (
                          <ChevronUp className="w-3 h-3 text-zinc-400" />
                        ) : (
                          <ChevronDown className="w-3 h-3 text-zinc-400" />
                        )}
                      </button>

                      {expandedNotes[att.id] && (
                        <div className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed bg-white dark:bg-zinc-900 p-2.5 border border-zinc-200 dark:border-zinc-800 border-l-2 border-l-zinc-700 dark:border-l-zinc-300 rounded-none shadow-none">
                          {renderMarkdown(att.notes)}
                        </div>
                      )}
                    </div>
                  )}

                  {att.timeTakenMinutes && (
                    <div className="text-[10px] text-zinc-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{att.timeTakenMinutes} mins</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Delete Problem Option */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs text-rose-500 hover:underline flex items-center gap-1 font-mono"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete Problem</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-500">Confirm deletion?</span>
                <button
                  onClick={() => onDeleteProblem(problem.id)}
                  className="px-2 py-0.5 rounded-none bg-rose-600 text-white text-xs font-semibold"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-xs text-zinc-500"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
