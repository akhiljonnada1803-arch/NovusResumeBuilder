"use client";

import React, { useState, useMemo } from "react";
import { Resume } from "@/types/resume";
import { InterviewQuestion, InterviewCategory } from "@/modules/interview";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  BookOpen,
  Search,
  Sliders,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCw,
  Plus,
  Flame,
  Zap,
  Code2,
  Building2,
  Layers,
  MessageSquare,
  ShieldAlert,
  Lightbulb,
  CheckCircle2,
  Share2,
  ArrowRight,
  ArrowLeft,
  Eye,
  RefreshCw,
  FileText,
  Clock,
  Briefcase,
} from "lucide-react";

interface QuestionBankStudioProps {
  resume: Resume | null;
  targetRole: string;
  questions: InterviewQuestion[];
  isLoading: boolean;
  onRegenerate: () => void;
  onSelectForPractice?: (question: InterviewQuestion) => void;
}

type ViewMode = "grid" | "flashcard" | "practice";

export function QuestionBankStudio({
  resume,
  targetRole,
  questions,
  isLoading,
  onRegenerate,
  onSelectForPractice,
}: QuestionBankStudioProps) {
  const { success, error: showErrorToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<InterviewCategory | "all">("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Expanded sections on cards: questionId -> "points" | "pitfalls" | "model" | null
  const [expandedTabs, setExpandedTabs] = useState<Record<string, "points" | "pitfalls" | "model" | null>>({});

  // Flashcard mode state
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Custom question dialog
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customQuestionText, setCustomQuestionText] = useState("");
  const [customCategory, setCustomCategory] = useState<InterviewCategory>("technical");
  const [customIntent, setCustomIntent] = useState("");
  const [customQuestions, setCustomQuestions] = useState<InterviewQuestion[]>([]);

  // Self practice state
  const [practiceQuestion, setPracticeQuestion] = useState<InterviewQuestion | null>(null);
  const [practiceAnswer, setPracticeAnswer] = useState("");
  const [isEvaluatingPractice, setIsEvaluatingPractice] = useState(false);
  const [practiceFeedback, setPracticeFeedback] = useState<{ score: number; feedback: string } | null>(null);

  // Merge server questions + user custom questions
  const allQuestions = useMemo(() => {
    return [...customQuestions, ...questions];
  }, [customQuestions, questions]);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesQuestion = q.question.toLowerCase().includes(query);
        const matchesIntent = q.intent?.toLowerCase().includes(query);
        const matchesPoints = q.suggestedPoints?.some((p) => p.toLowerCase().includes(query));
        const matchesTags = q.companyTags?.some((t) => t.toLowerCase().includes(query));
        if (!matchesQuestion && !matchesIntent && !matchesPoints && !matchesTags) {
          return false;
        }
      }

      // Category
      if (selectedCategory !== "all" && q.category !== selectedCategory) {
        return false;
      }

      // Difficulty
      if (selectedDifficulty !== "all" && q.difficulty?.toLowerCase() !== selectedDifficulty.toLowerCase()) {
        return false;
      }

      // Company
      if (selectedCompany !== "all") {
        const tags = q.companyTags || [];
        if (!tags.some((t) => t.toLowerCase().includes(selectedCompany.toLowerCase()))) {
          return false;
        }
      }

      // Bookmarked
      if (onlyBookmarked && !bookmarkedIds.has(q.id)) {
        return false;
      }

      return true;
    });
  }, [allQuestions, searchQuery, selectedCategory, selectedDifficulty, selectedCompany, onlyBookmarked, bookmarkedIds]);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const copyToClipboard = (id: string, text: string, label: string = "Question") => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportAllAsMarkdown = () => {
    if (filteredQuestions.length === 0) return;
    const content = filteredQuestions
      .map(
        (q, idx) => `### ${idx + 1}. [${q.category.toUpperCase()} | ${q.difficulty}] ${q.question}
**Interviewer Intent:** ${q.intent}

**Key Talking Points:**
${q.suggestedPoints.map((p) => `- ${p}`).join("\n")}

${q.commonPitfalls && q.commonPitfalls.length > 0 ? `**Common Pitfalls:**\n${q.commonPitfalls.map((p) => `- ${p}`).join("\n")}\n` : ""}
${q.modelAnswer ? `**Exemplar Model Answer:**\n${q.modelAnswer}\n` : ""}
---`
      )
      .join("\n\n");

    const header = `# Interview Question Bank Cheat Sheet — ${targetRole}\nGenerated by Novus AI for ${resume?.personalInfo?.fullName || "Candidate"}\n\n`;
    navigator.clipboard.writeText(header + content);
    success("Complete Question Bank exported as Markdown to your clipboard!");
  };

  const handleAddCustomQuestion = () => {
    if (!customQuestionText.trim()) return;

    const newQ: InterviewQuestion = {
      id: `custom-${Date.now()}`,
      category: customCategory,
      question: customQuestionText.trim(),
      intent: customIntent.trim() || "Candidate-authored custom interview practice question.",
      suggestedPoints: ["Frame response with specific technical metrics", "Explain architectural trade-offs"],
      difficulty: "Senior",
      companyTags: ["Custom Practice"],
      commonPitfalls: ["Vague generalizations without concrete examples."],
      modelAnswer: "Structure with Situation, Task, Action, and Quantifiable Results.",
      estimatedTime: "3-5 mins",
    };

    setCustomQuestions((prev) => [newQ, ...prev]);
    setCustomQuestionText("");
    setCustomIntent("");
    setIsAddModalOpen(false);
    success("Custom question added to your Question Bank!");
  };

  // Evaluate self-practice response
  const handleEvaluatePractice = async () => {
    if (!practiceAnswer.trim() || !practiceQuestion || isEvaluatingPractice) return;
    setIsEvaluatingPractice(true);

    try {
      const res = await fetch("/api/interview/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: practiceQuestion,
          answer: practiceAnswer.trim(),
          resume,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to evaluate answer.");

      setPracticeFeedback({
        score: data.evaluation?.overallScore || 85,
        feedback: data.evaluation?.feedback || "Solid technical response with clear reasoning.",
      });
      success("Evaluation complete!");
    } catch (err: any) {
      showErrorToast(err.message || "Could not complete evaluation.");
    } finally {
      setIsEvaluatingPractice(false);
    }
  };

  // Category Icon & Badge helpers
  const getCategoryTheme = (cat: InterviewCategory) => {
    switch (cat) {
      case "technical":
        return {
          label: "Technical",
          icon: Code2,
          badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
          border: "hover:border-blue-500/40",
        };
      case "system-design":
        return {
          label: "System Design",
          icon: Layers,
          badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
          border: "hover:border-purple-500/40",
        };
      case "project":
        return {
          label: "Project Deep Dive",
          icon: Briefcase,
          badge: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
          border: "hover:border-indigo-500/40",
        };
      case "behavioral":
        return {
          label: "Behavioral & STAR",
          icon: MessageSquare,
          badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          border: "hover:border-amber-500/40",
        };
      case "leadership":
        return {
          label: "Leadership & Impact",
          icon: Flame,
          badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
          border: "hover:border-rose-500/40",
        };
      case "hr":
      default:
        return {
          label: "HR & Culture",
          icon: Building2,
          badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
          border: "hover:border-emerald-500/40",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar & Statistics Card */}
      <div className="p-5 sm:p-6 rounded-3xl border border-border/80 bg-card shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <BookOpen className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-black text-foreground">
                Tailored Interview Question Repository
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              {allQuestions.length} grounded interview questions tailored for <span className="font-semibold text-foreground">{targetRole}</span> with interviewer intents, pitfalls, and model answers.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportAllAsMarkdown}
              className="h-9 text-xs font-semibold gap-1.5 rounded-xl border-border bg-secondary/30 hover:bg-secondary cursor-pointer shadow-xs"
              title="Copy entire question bank as a Markdown cheat sheet"
            >
              <FileText className="w-3.5 h-3.5 text-primary" />
              <span>Export Cheat Sheet</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              className="h-9 text-xs font-semibold gap-1.5 rounded-xl border-border bg-secondary/30 hover:bg-secondary cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-500" />
              <span>Add Custom Q</span>
            </Button>

            <Button
              variant="radiant"
              size="sm"
              onClick={onRegenerate}
              disabled={isLoading}
              className="h-9 px-4 text-xs font-bold gap-1.5 rounded-xl shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>{isLoading ? "Generating..." : "Regenerate Qs"}</span>
            </Button>
          </div>
        </div>

        {/* View Mode Switcher Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/60">
          <div className="flex items-center gap-1.5 bg-secondary/50 p-1 rounded-xl border border-border/60 text-xs">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === "grid"
                  ? "bg-card text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              <span>Explorer Grid ({filteredQuestions.length})</span>
            </button>

            <button
              onClick={() => {
                setViewMode("flashcard");
                setFlashcardIndex(0);
                setIsFlipped(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === "flashcard"
                  ? "bg-card text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <RotateCw className="w-3.5 h-3.5 text-amber-500" />
              <span>Interactive Flashcards</span>
            </button>

            <button
              onClick={() => {
                setViewMode("practice");
                if (!practiceQuestion && filteredQuestions.length > 0) {
                  setPracticeQuestion(filteredQuestions[0]);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                viewMode === "practice"
                  ? "bg-card text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>Self-Practice Studio</span>
            </button>
          </div>

          {/* Bookmarks Toggle */}
          <button
            onClick={() => setOnlyBookmarked((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              onlyBookmarked
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                : "bg-secondary/30 text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${onlyBookmarked ? "fill-amber-500 text-amber-500" : ""}`} />
            <span>Bookmarked ({bookmarkedIds.size})</span>
          </button>
        </div>
      </div>

      {/* 2. Multi-Dimensional Search & Filters */}
      <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword, technology (e.g. Kafka, Redis), intent, or question..."
              className="h-10 pl-9 text-xs bg-secondary/30 rounded-xl"
            />
          </div>

          {/* Difficulty Dropdown */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="h-10 px-3 rounded-xl border border-border bg-secondary/30 text-xs font-medium text-foreground w-full sm:w-40 focus:outline-hidden"
          >
            <option value="all">All Difficulties</option>
            <option value="junior">Junior</option>
            <option value="mid">Mid-Level</option>
            <option value="senior">Senior</option>
            <option value="lead">Lead / Staff</option>
          </select>

          {/* Company Filter Dropdown */}
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="h-10 px-3 rounded-xl border border-border bg-secondary/30 text-xs font-medium text-foreground w-full sm:w-40 focus:outline-hidden"
          >
            <option value="all">All Companies</option>
            <option value="google">Google</option>
            <option value="meta">Meta</option>
            <option value="amazon">Amazon</option>
            <option value="netflix">Netflix</option>
            <option value="stripe">Stripe</option>
            <option value="uber">Uber</option>
            <option value="startup">Startups</option>
          </select>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {(
            [
              { id: "all", label: "All Categories" },
              { id: "technical", label: "Technical & Systems" },
              { id: "system-design", label: "System Design" },
              { id: "project", label: "Project Deep Dive" },
              { id: "behavioral", label: "Behavioral (STAR)" },
              { id: "leadership", label: "Leadership & Impact" },
              { id: "hr", label: "HR & Culture" },
            ] as const
          ).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-xs scale-[1.02]"
                  : "bg-secondary/40 text-muted-foreground hover:text-foreground border border-border/60 hover:bg-secondary"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. View Renderings */}

      {/* VIEW 1: EXPLORER GRID */}
      {viewMode === "grid" && (
        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-border bg-card/50 space-y-3">
              <BookOpen className="w-8 h-8 text-muted-foreground mx-auto" />
              <h3 className="font-bold text-sm text-foreground">No questions match your filter criteria</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Try clearing your search term, changing categories, or clicking &ldquo;Regenerate Qs&rdquo; to create fresh interview questions.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setSelectedDifficulty("all");
                  setSelectedCompany("all");
                  setOnlyBookmarked(false);
                }}
                className="text-xs rounded-xl"
              >
                Reset All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredQuestions.map((q, idx) => {
                const theme = getCategoryTheme(q.category);
                const isBookmarked = bookmarkedIds.has(q.id);
                const activeTab = expandedTabs[q.id];

                return (
                  <div
                    key={q.id}
                    className={`group p-5 sm:p-6 rounded-3xl border border-border/80 bg-card shadow-xs hover:shadow-md transition-all duration-300 ${theme.border} space-y-4`}
                  >
                    {/* Top Meta Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${theme.badge} flex items-center gap-1`}>
                          <theme.icon className="w-3 h-3" />
                          <span>{theme.label}</span>
                        </span>

                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-secondary text-foreground border border-border">
                          {q.difficulty || "Senior"}
                        </span>

                        {q.estimatedTime && (
                          <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1 bg-secondary/30 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span>{q.estimatedTime}</span>
                          </span>
                        )}

                        {/* Company tags */}
                        {q.companyTags &&
                          q.companyTags.map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/5 text-primary border border-primary/15"
                            >
                              {tag}
                            </span>
                          ))}
                      </div>

                      {/* Top Action Icons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleBookmark(q.id)}
                          className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                            isBookmarked
                              ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary"
                          }`}
                          title={isBookmarked ? "Remove Bookmark" : "Bookmark Question"}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-amber-500" : ""}`} />
                        </button>

                        <button
                          onClick={() => copyToClipboard(q.id, q.question, "Question")}
                          className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent transition-all cursor-pointer"
                          title="Copy Question Text"
                        >
                          {copiedId === q.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Question Title */}
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                        {q.question}
                      </h3>
                    </div>

                    {/* Interviewer Intent Box */}
                    <div className="p-3.5 rounded-2xl bg-secondary/30 border border-border/60 space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-foreground">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                        <span>Interviewer Intent & Evaluation Focus:</span>
                      </div>
                      <p className="text-muted-foreground text-xs leading-relaxed">
                        {q.intent}
                      </p>
                    </div>

                    {/* Interactive Detail Tabs Pill-bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedTabs((prev) => ({
                              ...prev,
                              [q.id]: prev[q.id] === "points" ? null : "points",
                            }))
                          }
                          className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                            activeTab === "points"
                              ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                              : "bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary"
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3 text-blue-500" />
                          <span>Talking Points ({q.suggestedPoints?.length || 0})</span>
                          {activeTab === "points" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedTabs((prev) => ({
                              ...prev,
                              [q.id]: prev[q.id] === "pitfalls" ? null : "pitfalls",
                            }))
                          }
                          className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                            activeTab === "pitfalls"
                              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                              : "bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary"
                          }`}
                        >
                          <ShieldAlert className="w-3 h-3 text-rose-500" />
                          <span>Pitfalls to Avoid</span>
                          {activeTab === "pitfalls" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedTabs((prev) => ({
                              ...prev,
                              [q.id]: prev[q.id] === "model" ? null : "model",
                            }))
                          }
                          className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                            activeTab === "model"
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                              : "bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary"
                          }`}
                        >
                          <Sparkles className="w-3 h-3 text-emerald-500" />
                          <span>STAR Model Answer</span>
                          {activeTab === "model" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>

                      {/* Practice this specific question button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPracticeQuestion(q);
                          setPracticeAnswer("");
                          setPracticeFeedback(null);
                          setViewMode("practice");
                        }}
                        className="h-8 text-xs font-bold gap-1.5 rounded-xl border-border hover:border-primary/40 cursor-pointer"
                      >
                        <span>Practice This Q</span>
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Expandable Content Area */}
                    {activeTab === "points" && (
                      <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 space-y-2 animate-in fade-in duration-200 text-xs">
                        <span className="font-bold text-blue-600 dark:text-blue-400 block">
                          Essential Architectural & Storytelling Talking Points:
                        </span>
                        <ul className="space-y-1 text-muted-foreground list-disc pl-4">
                          {q.suggestedPoints.map((pt, pIdx) => (
                            <li key={pIdx} className="leading-relaxed">
                              {pt}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {activeTab === "pitfalls" && (
                      <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2 animate-in fade-in duration-200 text-xs">
                        <span className="font-bold text-rose-600 dark:text-rose-400 block">
                          Critical Pitfalls to Avoid in Live Interviews:
                        </span>
                        <ul className="space-y-1 text-muted-foreground list-disc pl-4">
                          {(q.commonPitfalls && q.commonPitfalls.length > 0
                            ? q.commonPitfalls
                            : ["Giving a superficial answer without addressing performance constraints or alternative trade-offs."]
                          ).map((pf, pfIdx) => (
                            <li key={pfIdx} className="leading-relaxed">
                              {pf}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {activeTab === "model" && (
                      <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2 animate-in fade-in duration-200 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                            Exemplar STAR / Architectural Model Answer:
                          </span>
                          <button
                            onClick={() => copyToClipboard(`model-${q.id}`, q.modelAnswer || "", "Model Answer")}
                            className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy Answer</span>
                          </button>
                        </div>
                        <p className="text-foreground/90 leading-relaxed font-sans whitespace-pre-line">
                          {q.modelAnswer ||
                            "Structure response with: Situation (production problem), Task (engineering goal), Action (concrete architecture trade-offs and code choices), and Result (quantified latency/cost impact)."}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: INTERACTIVE FLASHCARDS */}
      {viewMode === "flashcard" && (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
          {filteredQuestions.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-border text-muted-foreground text-xs">
              No questions found for flashcards with the selected filters.
            </div>
          ) : (
            (() => {
              const currentCard = filteredQuestions[flashcardIndex] || filteredQuestions[0];
              const theme = getCategoryTheme(currentCard.category);

              return (
                <div className="space-y-4">
                  {/* Progress Header */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-mono font-bold text-foreground">
                      Card {flashcardIndex + 1} of {filteredQuestions.length}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${theme.badge}`}>
                      {theme.label}
                    </span>
                  </div>

                  {/* The Flashcard */}
                  <div
                    onClick={() => setIsFlipped((prev) => !prev)}
                    className="group min-h-[320px] p-6 sm:p-8 rounded-3xl border border-border/80 bg-gradient-to-br from-card to-secondary/20 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  >
                    {!isFlipped ? (
                      /* Front of card */
                      <div className="space-y-6 my-auto text-center">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                          Question Prompt (Click anywhere to reveal answer guide)
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black text-foreground leading-snug">
                          {currentCard.question}
                        </h2>
                        <div className="flex justify-center gap-2">
                          <span className="text-xs px-3 py-1 rounded-full bg-secondary text-foreground font-medium">
                            {currentCard.difficulty}
                          </span>
                          {currentCard.companyTags?.[0] && (
                            <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                              {currentCard.companyTags[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Back of card */
                      <div className="space-y-4 text-xs animate-in fade-in duration-200 text-left">
                        <div className="flex items-center justify-between border-b border-border/60 pb-2">
                          <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                            <Lightbulb className="w-4 h-4" />
                            Interviewer Intent:
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">Click card to flip back</span>
                        </div>
                        <p className="text-muted-foreground">{currentCard.intent}</p>

                        <div className="space-y-1.5 pt-1">
                          <span className="font-bold text-blue-600 dark:text-blue-400 block">
                            Key Talking Points:
                          </span>
                          <ul className="space-y-1 text-muted-foreground list-disc pl-4">
                            {currentCard.suggestedPoints.map((pt, i) => (
                              <li key={i}>{pt}</li>
                            ))}
                          </ul>
                        </div>

                        {currentCard.modelAnswer && (
                          <div className="p-3 rounded-xl bg-secondary/50 border border-border/60 space-y-1">
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 block text-[11px]">
                              Exemplar Answer Outline:
                            </span>
                            <p className="text-foreground/90 italic leading-relaxed text-[11px]">
                              {currentCard.modelAnswer}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{isFlipped ? "Answer revealed" : "Click card to flip"}</span>
                      <span className="font-bold text-primary flex items-center gap-1">
                        <RotateCw className="w-3.5 h-3.5" />
                        Flip Card
                      </span>
                    </div>
                  </div>

                  {/* Flashcard Navigation Controls */}
                  <div className="flex items-center justify-between gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsFlipped(false);
                        setFlashcardIndex((prev) => Math.max(0, prev - 1));
                      }}
                      disabled={flashcardIndex === 0}
                      className="rounded-xl gap-1 text-xs"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsFlipped((prev) => !prev)}
                      className="rounded-xl text-xs font-bold"
                    >
                      {isFlipped ? "Show Question" : "Reveal Answer"}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsFlipped(false);
                        setFlashcardIndex((prev) => Math.min(filteredQuestions.length - 1, prev + 1));
                      }}
                      disabled={flashcardIndex >= filteredQuestions.length - 1}
                      className="rounded-xl gap-1 text-xs"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* VIEW 3: SELF PRACTICE STUDIO */}
      {viewMode === "practice" && practiceQuestion && (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
          <div className="p-6 rounded-3xl border border-border/80 bg-card shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                Targeted Practice Mode
              </span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-secondary text-foreground">
                {practiceQuestion.category.toUpperCase()}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-foreground">
              {practiceQuestion.question}
            </h2>

            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-bold text-foreground">Interviewer Intent: </span>
              {practiceQuestion.intent}
            </p>

            {/* Answer Box */}
            <div className="space-y-2 pt-2">
              <Label className="text-xs font-semibold text-foreground/80">Your Response (Type STAR format):</Label>
              <textarea
                rows={6}
                value={practiceAnswer}
                onChange={(e) => setPracticeAnswer(e.target.value)}
                placeholder="Structure your answer with Situation, Task, Action, and Result with quantifiable trade-offs..."
                className="w-full p-3.5 rounded-2xl border border-border bg-secondary/30 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary transition-all font-sans leading-relaxed"
                disabled={isEvaluatingPractice}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-muted-foreground">
                Word Count: {practiceAnswer.trim().split(/\s+/).filter(Boolean).length} words
              </span>

              <Button
                variant="radiant"
                size="sm"
                onClick={handleEvaluatePractice}
                disabled={!practiceAnswer.trim() || isEvaluatingPractice}
                className="text-xs font-bold gap-1.5 rounded-xl px-5 shadow-xs"
              >
                {isEvaluatingPractice ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Evaluating Response...</span>
                  </>
                ) : (
                  <>
                    <span>Submit for AI Grading</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </div>

            {/* Feedback Display */}
            {practiceFeedback && (
              <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-2 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    AI Bar Raiser Assessment
                  </span>
                  <span className="font-mono font-black text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                    Score: {practiceFeedback.score}/100
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {practiceFeedback.feedback}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Add Custom Question Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen} maxWidth="md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-foreground">
            <Plus className="w-5 h-5 text-emerald-500" />
            <DialogTitle>Add Custom Interview Question</DialogTitle>
          </div>
          <DialogDescription>
            Add specific questions from your target companies to track and practice.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Question Prompt *</Label>
            <textarea
              rows={3}
              value={customQuestionText}
              onChange={(e) => setCustomQuestionText(e.target.value)}
              placeholder="e.g. How does Kafka guarantee exactly-once message processing semantics?"
              className="w-full p-3 rounded-xl border border-border bg-secondary/30 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Interview Category</Label>
            <select
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value as InterviewCategory)}
              className="w-full h-9 px-3 rounded-xl border border-border bg-secondary/30 text-xs font-medium text-foreground focus:outline-hidden"
            >
              <option value="technical">Technical & Architecture</option>
              <option value="system-design">System Design</option>
              <option value="project">Project Deep Dive</option>
              <option value="behavioral">Behavioral (STAR)</option>
              <option value="leadership">Leadership & Ownership</option>
              <option value="hr">HR & Culture</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Interviewer Evaluation Criteria (Optional)</Label>
            <Input
              value={customIntent}
              onChange={(e) => setCustomIntent(e.target.value)}
              placeholder="e.g. Assessing distributed transaction isolation and commit logs."
              className="h-9 text-xs bg-secondary/30 rounded-xl"
            />
          </div>

          <Button
            type="button"
            variant="radiant"
            size="sm"
            onClick={handleAddCustomQuestion}
            disabled={!customQuestionText.trim()}
            className="w-full text-xs font-bold h-10 rounded-xl shadow-xs"
          >
            Save to Question Repository
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
