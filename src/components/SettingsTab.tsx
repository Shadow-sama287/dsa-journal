import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  Tag as TagIcon,
  Trash2,
  Edit2,
  Check,
  X,
  Smartphone,
  Sun,
  Moon,
  Monitor,
  Code2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { Theme } from '../hooks/useTheme';
import { getTagClasses } from '../utils/tagColors';

interface SettingsTabProps {
  allTags: string[];
  totalProblemsCount: number;
  totalAttemptsCount: number;
  onRefreshData: () => void;
  theme: Theme;
  onSetTheme: (theme: Theme) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  allTags,
  totalProblemsCount,
  totalAttemptsCount,
  onRefreshData,
  theme,
  onSetTheme,
}) => {
  const [newTagInput, setNewTagInput] = useState('');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editTagName, setEditTagName] = useState('');

  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(
    null
  );

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleExport = () => {
    try {
      StorageService.exportBackup();
      showToast('Offline JSON backup exported!');
    } catch {
      showToast('Export failed. Please try again.', 'error');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await StorageService.importBackup(file, 'merge');
      onRefreshData();
      showToast(`Imported ${result.problemsCount} questions, ${result.attemptsCount} attempts!`);
    } catch (err: any) {
      showToast(err.message || 'Import failed. Invalid file.', 'error');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;
    StorageService.addTag(newTagInput.trim());
    setNewTagInput('');
    onRefreshData();
    showToast(`Tag added: "${newTagInput.trim()}"`);
  };

  const handleSaveRename = (oldTag: string) => {
    if (!editTagName.trim() || editTagName.trim() === oldTag) {
      setEditingTag(null);
      return;
    }
    StorageService.renameTag(oldTag, editTagName.trim());
    setEditingTag(null);
    onRefreshData();
    showToast(`Tag renamed to "${editTagName.trim()}"`);
  };

  const handleDeleteTag = (tag: string) => {
    StorageService.deleteTag(tag);
    onRefreshData();
    showToast(`Tag removed: "${tag}"`);
  };

  const handleRestoreSample = () => {
    StorageService.resetToSampleData();
    setShowRestoreConfirm(false);
    onRefreshData();
    showToast('Loaded sample LeetCode problems!');
  };

  const handleClearAll = () => {
    StorageService.clearAllData();
    setShowClearConfirm(false);
    onRefreshData();
    showToast('All journal data wiped.');
  };

  return (
    <div className="pb-28 pt-4 px-4 max-w-xl mx-auto space-y-3.5 select-none font-sans">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`fixed top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-1.5 rounded-none shadow-md text-xs font-mono backdrop-blur-md transition-all ${
            feedback.type === 'success'
              ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 border border-zinc-700'
              : 'bg-rose-600 text-white'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 text-white" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-500 dark:text-zinc-400">
          Preferences &amp; Data
        </h2>
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
          Theme, direct APK download, offline backup &amp; tags
        </p>
      </div>

      {/* Direct Android APK Download Card */}
      <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-none p-3.5 space-y-2.5">
        <div className="space-y-0.5">
          <h3 className="text-xs font-bold text-zinc-950 dark:text-zinc-100 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Direct Android Application (.apk)</span>
          </h3>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Download the standalone Android package for direct installation on Android 11, 12, 13, 14, and 15 devices.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <a
            href="/dsa-journal.apk"
            download="dsa-journal.apk"
            className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-none border border-emerald-600 dark:border-emerald-500 bg-emerald-600 dark:bg-emerald-500 text-white dark:text-zinc-950 text-xs font-semibold shadow-none transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download dsa-journal.apk</span>
          </a>

          <a
            href="/dsa-journal-android-source.zip"
            download="dsa-journal-android-source.zip"
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-none border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-mono hover:bg-zinc-100 dark:hover:bg-zinc-850 transition"
            title="Download full Android Studio Kotlin/Compose project"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Source .zip</span>
          </a>
        </div>
      </div>

      {/* Theme Switcher Card */}
      <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-none p-3.5 space-y-2">
        <h3 className="text-xs font-bold text-zinc-950 dark:text-zinc-100">
          Color Theme
        </h3>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => onSetTheme('dark')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-none text-xs font-medium border transition ${
              theme === 'dark'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100 font-bold'
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850'
            }`}
          >
            <Moon className="w-3 h-3" />
            <span>Obsidian Dark</span>
          </button>

          <button
            onClick={() => onSetTheme('light')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-none text-xs font-medium border transition ${
              theme === 'light'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100 font-bold'
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850'
            }`}
          >
            <Sun className="w-3 h-3" />
            <span>Clean Light</span>
          </button>

          <button
            onClick={() => onSetTheme('system')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-none text-xs font-medium border transition ${
              theme === 'system'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100 font-bold'
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850'
            }`}
          >
            <Monitor className="w-3 h-3" />
            <span>System</span>
          </button>
        </div>
      </div>

      {/* Offline JSON Backup */}
      <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-none p-3.5 space-y-2">
        <h3 className="text-xs font-bold text-zinc-950 dark:text-zinc-100 flex items-center gap-1.5">
          <Download className="w-3.5 h-3.5 text-zinc-400" />
          <span>Offline Data Backup (JSON)</span>
        </h3>
        <p className="text-[11px] text-zinc-500">
          Export or import your journal data. Safe, private, and 100% on-device.
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-none border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-850 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-none border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-850 transition"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Question Categories & Tags (High Contrast & Sharp Borders) */}
      <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-none p-3.5 space-y-2.5">
        <h3 className="text-xs font-bold text-zinc-950 dark:text-zinc-100 flex items-center gap-1.5">
          <TagIcon className="w-3.5 h-3.5 text-zinc-400" />
          <span>Category Tags Manager</span>
        </h3>

        <form onSubmit={handleAddTag} className="flex gap-2">
          <input
            type="text"
            value={newTagInput}
            onChange={e => setNewTagInput(e.target.value)}
            placeholder="Add new tag..."
            className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-none px-3 py-1 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!newTagInput.trim()}
            className="px-3 py-1 rounded-none border border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-semibold disabled:opacity-40"
          >
            Add
          </button>
        </form>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {allTags.map(tag => {
            const isEditing = editingTag === tag;
            if (isEditing) {
              return (
                <div
                  key={tag}
                  className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-none px-2 py-0.5 border border-zinc-400"
                >
                  <input
                    type="text"
                    value={editTagName}
                    onChange={e => setEditTagName(e.target.value)}
                    className="bg-transparent text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none w-20 font-mono"
                    autoFocus
                  />
                  <button onClick={() => handleSaveRename(tag)} className="text-emerald-500">
                    <Check className="w-3 h-3" />
                  </button>
                  <button onClick={() => setEditingTag(null)} className="text-zinc-400">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            }

            return (
              <div
                key={tag}
                className={`group flex items-center gap-1.5 rounded-none px-2 py-0.5 text-xs font-mono border ${getTagClasses(
                  tag
                )}`}
              >
                <span>{tag}</span>
                <div className="opacity-40 group-hover:opacity-100 flex items-center gap-1 transition">
                  <button
                    onClick={() => {
                      setEditingTag(tag);
                      setEditTagName(tag);
                    }}
                    className="hover:opacity-80"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTag(tag)}
                    className="hover:opacity-80"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reset & Samples */}
      <div className="pt-2 flex gap-2">
        <button
          onClick={() => setShowRestoreConfirm(true)}
          className="flex-1 py-1.5 rounded-none border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850"
        >
          Load Samples
        </button>
        <button
          onClick={() => setShowClearConfirm(true)}
          className="flex-1 py-1.5 rounded-none border border-rose-200 dark:border-rose-950 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
        >
          Clear All Data
        </button>
      </div>

      {/* Confirmation Modals */}
      {showRestoreConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-none p-5 max-w-sm w-full space-y-3">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Load sample LeetCode data?</h4>
            <p className="text-[11px] text-zinc-500">Populates standard problems to test calendar streak.</p>
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setShowRestoreConfirm(false)} className="px-3 py-1 text-xs text-zinc-500">Cancel</button>
              <button onClick={handleRestoreSample} className="px-3 py-1 rounded-none border border-zinc-900 dark:border-zinc-100 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold">Load</button>
            </div>
          </div>
        </div>
      )}

      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-rose-300 dark:border-rose-900 rounded-none p-5 max-w-sm w-full space-y-3">
            <h4 className="text-xs font-bold text-rose-600">Delete all journal entries?</h4>
            <p className="text-[11px] text-zinc-500">Permanently deletes all problems from device storage.</p>
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setShowClearConfirm(false)} className="px-3 py-1 text-xs text-zinc-500">Cancel</button>
              <button onClick={handleClearAll} className="px-3 py-1 rounded-none bg-rose-600 text-white text-xs font-semibold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
