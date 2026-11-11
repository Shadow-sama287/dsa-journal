import React, { useState, useEffect, useCallback } from 'react';
import { StorageService, formatDateKey } from './services/storage';
import { ProblemWithStats, Attempt, Difficulty } from './types/journal';
import { AppHeader } from './components/AppHeader';
import { BottomNav, TabId } from './components/BottomNav';
import { HomeTab } from './components/HomeTab';
import { CalendarTab } from './components/CalendarTab';
import { DatabaseTab } from './components/DatabaseTab';
import { SettingsTab } from './components/SettingsTab';
import { AddEntryModal } from './components/AddEntryModal';
import { ProblemDetailModal } from './components/ProblemDetailModal';
import { useTheme } from './hooks/useTheme';

export default function App() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [problemsWithStats, setProblemsWithStats] = useState<ProblemWithStats[]>([]);
  const [allAttempts, setAllAttempts] = useState<Attempt[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalInitialDate, setAddModalInitialDate] = useState<string | undefined>(undefined);
  const [addModalPreselectedId, setAddModalPreselectedId] = useState<string | undefined>(undefined);
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(null);

  // Mobile Frame simulator for desktop browsers
  const [isMobileSimulator, setIsMobileSimulator] = useState(false);

  // Refresh all state from local storage
  const refreshData = useCallback(() => {
    StorageService.initializeDefaults();
    const stats = StorageService.getAllProblemsWithStats();
    const attempts = StorageService.getAttempts();
    const tags = StorageService.getTags();

    setProblemsWithStats(stats);
    setAllAttempts(attempts);
    setAllTags(tags);
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Open Add Modal
  const handleOpenAddModal = (initialDate?: string, problemId?: string) => {
    setAddModalInitialDate(initialDate || formatDateKey());
    setAddModalPreselectedId(problemId);
    setIsAddModalOpen(true);
  };

  // Open Problem Detail
  const handleSelectProblem = (problemId: string) => {
    setSelectedDetailId(problemId);
  };

  // Solve Again shortcut
  const handleSolveAgain = (problemId: string) => {
    refreshData();
    setSelectedDetailId(problemId);
  };

  // Save from AddEntryModal
  const handleSaveEntry = (data: {
    title: string;
    tags: string[];
    date: string;
    difficulty: Difficulty;
    confidence: number;
    notes: string;
    timeTakenMinutes?: number;
    existingProblemId?: string;
    leetcodeUrl?: string;
  }) => {
    let targetProblemId = data.existingProblemId;

    if (!targetProblemId) {
      const p = StorageService.addProblem(data.title, data.tags, data.leetcodeUrl);
      targetProblemId = p.id;
    } else {
      const existing = StorageService.getProblems().find(p => p.id === targetProblemId);
      if (existing) {
        const merged = data.tags.length > 0
          ? Array.from(new Set([...existing.tags, ...data.tags]))
          : existing.tags;
        StorageService.updateProblem(targetProblemId, {
          tags: merged,
          leetcodeUrl: data.leetcodeUrl !== undefined ? data.leetcodeUrl : existing.leetcodeUrl,
        });
      }
    }

    StorageService.addAttempt({
      problemId: targetProblemId,
      date: data.date,
      feltDifficulty: data.difficulty,
      confidence: data.confidence,
      notes: data.notes,
      timeTakenMinutes: data.timeTakenMinutes,
    });

    setIsAddModalOpen(false);
    refreshData();
  };

  // Delete Problem
  const handleDeleteProblem = (problemId: string) => {
    StorageService.deleteProblem(problemId);
    setSelectedDetailId(null);
    refreshData();
  };

  // Delete Attempt
  const handleDeleteAttempt = (attemptId: string) => {
    StorageService.deleteAttempt(attemptId);
    refreshData();
  };

  // Update Problem title / tags / link
  const handleUpdateProblem = (problemId: string, title: string, tags: string[], leetcodeUrl?: string) => {
    StorageService.updateProblem(problemId, { title, tags, leetcodeUrl });
    refreshData();
  };

  const selectedProblemStat = selectedDetailId
    ? problemsWithStats.find(p => p.problem.id === selectedDetailId) || null
    : null;

  return (
    <div
      className={`min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors ${
        isMobileSimulator ? 'p-4 sm:p-8 items-center justify-center bg-zinc-200 dark:bg-zinc-950' : ''
      }`}
    >
      {/* Container - Responsive layout or simulated phone frame with sharp 1px borders */}
      <div
        className={`w-full flex-1 flex flex-col relative transition-all ${
          isMobileSimulator
            ? 'max-w-[420px] max-h-[880px] h-[880px] rounded-none border border-zinc-300 dark:border-zinc-800 shadow-2xl overflow-hidden bg-white dark:bg-zinc-950'
            : 'max-w-2xl mx-auto'
        }`}
      >
        {/* Simulated Android Status Bar */}
        {isMobileSimulator && (
          <div className="h-6 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 flex items-center justify-between text-[10px] text-zinc-500 font-mono select-none shrink-0">
            <span>09:41</span>
            <div className="w-16 h-2 bg-zinc-300 dark:bg-zinc-800 self-center" />
            <div className="flex items-center gap-1.5">
              <span>5G</span>
              <span>100%</span>
            </div>
          </div>
        )}

        {/* Top App Header */}
        <AppHeader
          isMobileSimulator={isMobileSimulator}
          onToggleMobileSimulator={() => setIsMobileSimulator(prev => !prev)}
        />

        {/* Main Content View */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'home' && (
            <HomeTab
              problemsWithStats={problemsWithStats}
              allAttempts={allAttempts}
              onOpenAddModal={() => handleOpenAddModal()}
              onSelectProblem={handleSelectProblem}
              onGoToDatabase={() => setActiveTab('database')}
              onGoToCalendar={() => setActiveTab('calendar')}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarTab
              allAttempts={allAttempts}
              problemsWithStats={problemsWithStats}
              onSelectProblem={handleSelectProblem}
              onOpenAddModalWithDate={dateStr => handleOpenAddModal(dateStr)}
            />
          )}

          {activeTab === 'database' && (
            <DatabaseTab
              problemsWithStats={problemsWithStats}
              allTags={allTags}
              onSelectProblem={handleSelectProblem}
              onOpenAddModal={() => handleOpenAddModal()}
              onSolveAgain={problemId => handleOpenAddModal(undefined, problemId)}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              allTags={allTags}
              totalProblemsCount={problemsWithStats.length}
              totalAttemptsCount={allAttempts.length}
              onRefreshData={refreshData}
              theme={theme}
              onSetTheme={setTheme}
            />
          )}
        </main>

        {/* Bottom Navigation Bar with Sharp 1px Borders */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Simulated Android Navigation gesture bar */}
        {isMobileSimulator && (
          <div className="h-3 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shrink-0">
            <div className="w-24 h-0.5 bg-zinc-400 dark:bg-zinc-600" />
          </div>
        )}

        {/* Add Entry Modal with Sharp Borders & Markdown Editor */}
        <AddEntryModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSaveEntry}
          allTags={allTags}
          existingProblems={problemsWithStats}
          initialDate={addModalInitialDate}
          preselectedProblemId={addModalPreselectedId}
        />

        {/* Problem Detail Modal with Sharp Borders & Markdown Rendering */}
        <ProblemDetailModal
          problemStat={selectedProblemStat}
          isOpen={!!selectedProblemStat}
          onClose={() => setSelectedDetailId(null)}
          onSolveAgain={handleSolveAgain}
          onDeleteProblem={handleDeleteProblem}
          onDeleteAttempt={handleDeleteAttempt}
          onUpdateProblem={handleUpdateProblem}
          allTags={allTags}
        />
      </div>
    </div>
  );
}
