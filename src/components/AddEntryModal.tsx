import React, { useState, useEffect } from 'react';
import {
  X,
  Link2,
  ExternalLink,
} from 'lucide-react';
import { Difficulty, ProblemWithStats } from '../types/journal';
import { formatDateKey, StorageService } from '../services/storage';
import { MarkdownEditor } from '../utils/markdown';
import { getTagClasses } from '../utils/tagColors';

interface AddEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    tags: string[];
    date: string;
    difficulty: Difficulty;
    confidence: number;
    notes: string;
    timeTakenMinutes?: number;
    existingProblemId?: string;
    leetcodeUrl?: string;
  }) => void;
  allTags: string[];
  existingProblems: ProblemWithStats[];
  initialDate?: string;
  preselectedProblemId?: string;
}

export const AddEntryModal: React.FC<AddEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  allTags,
  existingProblems,
  initialDate,
  preselectedProblemId,
}) => {
  const [title, setTitle] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [leetcodeUrl, setLeetcodeUrl] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [showAddTagInput, setShowAddTagInput] = useState(false);
  const [date, setDate] = useState(initialDate || formatDateKey());
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [confidence, setConfidence] = useState<number>(3);
  const [notes, setNotes] = useState('');
  const [timeTaken, setTimeTaken] = useState<string>('');
  const [selectedExistingId, setSelectedExistingId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (preselectedProblemId) {
      const match = existingProblems.find(p => p.problem.id === preselectedProblemId);
      if (match) {
        setTitle(match.problem.title);
        setSelectedTags(match.problem.tags);
        setSelectedExistingId(match.problem.id);
        setLeetcodeUrl(match.problem.leetcodeUrl || '');
      }
    } else {
      setTitle('');
      setSelectedTags([]);
      setSelectedExistingId(null);
      setLeetcodeUrl('');
    }
    setDate(initialDate || formatDateKey());
    setDifficulty('Medium');
    setConfidence(3);
    setNotes('');
    setTimeTaken('');
    setShowAddTagInput(false);
  }, [preselectedProblemId, initialDate, isOpen, existingProblems]);

  if (!isOpen) return null;

  const getFormattedUrl = (url?: string) => {
    if (!url) return '';
    const trimmed = url.trim();
    if (!trimmed) return '';
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  };

  const suggestions = title.trim()
    ? existingProblems
        .filter(p => p.problem.title.toLowerCase().includes(title.toLowerCase().trim()))
        .slice(0, 4)
    : [];

  const handleSelectSuggestion = (problem: ProblemWithStats) => {
    setTitle(problem.problem.title);
    setSelectedTags(problem.problem.tags);
    setSelectedExistingId(problem.problem.id);
    setLeetcodeUrl(problem.problem.leetcodeUrl || '');
    setShowSuggestions(false);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleCreateNewTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = newTagInput.trim();
    if (!clean) return;
    StorageService.addTag(clean);
    if (!selectedTags.includes(clean)) {
      setSelectedTags(prev => [...prev, clean]);
    }
    setNewTagInput('');
    setShowAddTagInput(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(15);
      } catch {
        // ignore
      }
    }

    onSave({
      title: title.trim(),
      tags: selectedTags,
      date,
      difficulty,
      confidence,
      notes: notes.trim(),
      timeTakenMinutes: timeTaken ? parseInt(timeTaken, 10) : undefined,
      existingProblemId: selectedExistingId || undefined,
      leetcodeUrl: leetcodeUrl.trim() || undefined,
    });
  };

  const setDateOffset = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    setDate(formatDateKey(d));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-none max-w-xl md:max-w-2xl w-full max-h-[94vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-2 duration-100 font-sans">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div>
            <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>{selectedExistingId ? 'Log Problem Revision' : 'Log DSA Problem'}</span>
              {selectedExistingId && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  (+1 repetition)
                </span>
              )}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 space-y-3.5">
          {/* Question Title & Autocomplete */}
          <div className="space-y-1 relative">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
              <span>Question Title *</span>
              {selectedExistingId && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedExistingId(null);
                    setTitle('');
                    setSelectedTags([]);
                  }}
                  className="text-[10px] font-mono text-zinc-500 hover:underline"
                >
                  Create as new instead
                </button>
              )}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => {
                setTitle(e.target.value);
                setShowSuggestions(true);
                const exactMatch = existingProblems.find(
                  p => p.problem.title.toLowerCase() === e.target.value.toLowerCase().trim()
                );
                setSelectedExistingId(exactMatch ? exactMatch.problem.id : null);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="e.g. Trapping Rain Water, Two Sum..."
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-none px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500 dark:focus:border-zinc-500 font-mono"
            />

            {/* Suggestions */}
            {showSuggestions && suggestions.length > 0 && !selectedExistingId && (
              <div className="absolute left-0 right-0 top-full mt-0.5 z-30 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-none shadow-xl overflow-hidden py-1">
                <div className="px-3 py-1 text-[9px] font-mono uppercase text-zinc-400">
                  Select existing problem to increment solve repetition:
                </div>
                {suggestions.map(s => (
                  <button
                    key={s.problem.id}
                    type="button"
                    onClick={() => handleSelectSuggestion(s)}
                    className="w-full text-left px-3.5 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{s.problem.title}</span>
                    <span className="text-[10px] font-mono text-zinc-400">{s.repetitionCount}x solved</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Problem Direct Link (LeetCode, Video, etc.) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-zinc-400" />
                <span>Problem Link (LeetCode, Solution, Video)</span>
              </label>
              {leetcodeUrl.trim() && (
                <a
                  href={getFormattedUrl(leetcodeUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-mono text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white flex items-center gap-1 underline underline-offset-2"
                >
                  <span>Visit Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="url"
                value={leetcodeUrl}
                onChange={e => setLeetcodeUrl(e.target.value)}
                placeholder="https://leetcode.com/problems/... (or YouTube / docs)"
                className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-none px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 font-mono"
              />
              {leetcodeUrl.trim() && (
                <a
                  href={getFormattedUrl(leetcodeUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-none border border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-mono font-semibold flex items-center gap-1 transition shrink-0 cursor-pointer"
                  title="Open Problem Link"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Category Tags (optional)
              </label>
              {!showAddTagInput && (
                <button
                  type="button"
                  onClick={() => setShowAddTagInput(true)}
                  className="text-[10px] font-mono text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                >
                  + Add Tag
                </button>
              )}
            </div>

            {showAddTagInput && (
              <div className="flex gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-none">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={e => setNewTagInput(e.target.value)}
                  placeholder="New tag..."
                  className="flex-1 bg-transparent text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none px-1 font-mono"
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateNewTag();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleCreateNewTag()}
                  className="px-2 py-0.5 rounded-none bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-medium font-mono"
                >
                  Save
                </button>
              </div>
            )}

            {/* Muted Accent Tag Selectors with High-Contrast Text */}
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 bg-zinc-50 dark:bg-zinc-950/60 rounded-none border border-zinc-200 dark:border-zinc-800">
              {allTags.map(tag => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-2 py-0.5 rounded-none text-xs font-mono transition border ${
                      isSelected
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100 font-bold'
                        : `${getTagClasses(tag)} hover:opacity-80`
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Picker */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Solve Date
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setDateOffset(0)}
                  className={`text-[10px] px-2 py-0.5 rounded-none border font-mono ${
                    date === formatDateKey()
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100 font-bold'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setDateOffset(1)}
                  className="text-[10px] px-2 py-0.5 rounded-none border border-zinc-200 dark:border-zinc-800 font-mono text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                >
                  Yesterday
                </button>
              </div>
            </div>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-none px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none font-mono"
            />
          </div>

          {/* Difficulty */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Difficulty Experienced
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map(diff => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficulty(diff)}
                  className={`py-1 rounded-none text-xs font-mono font-semibold border transition ${
                    difficulty === diff
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100 font-bold'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Confidence Score */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Confidence</label>
              <span className="text-[10px] font-mono text-zinc-500">{confidence} / 5</span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {[1, 2, 3, 4, 5].map(score => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setConfidence(score)}
                  className={`py-1 rounded-none text-xs font-mono font-bold border transition ${
                    confidence === score
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-850'
                  }`}
                >
                  {score}★
                </button>
              ))}
            </div>
          </div>

          {/* Markdown Editor for Notes and Insights */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Notes &amp; Insights (Markdown Supported)
            </label>
            <MarkdownEditor
              value={notes}
              onChange={setNotes}
              placeholder="What was the key intuition? Time O(N) and Space O(1)? Edge cases..."
              minLines={4}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-2.5 rounded-none border border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-mono font-bold text-xs shadow-none transition active:scale-98"
          >
            {selectedExistingId ? 'Record Revision (+1 Solve)' : 'Save Problem & Solve'}
          </button>
        </form>
      </div>
    </div>
  );
};
