"use client";

import { useState } from "react";
import {
  GraduationCap,
  Plus,
  Search,
  BookOpen,
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  HelpCircle,
  TrendingUp,
  Sparkles,
  ChevronRight
} from "lucide-react";

export interface QuizItem {
  id: string;
  title: string;
  grade: number;
  unit: string;
  topic: string;
  difficulty: "TEMEL" | "KAZANIM" | "YENI_NESIL";
  durationMin: number;
  questionCount: number;
  attemptCount: number;
  avgScore: number;
  isPublished: boolean;
}

interface QuizListProps {
  initialQuizzes?: QuizItem[];
}

export function QuizListClient({ initialQuizzes = [] }: QuizListProps) {
  const [quizzes, setQuizzes] = useState(initialQuizzes);
  const [search, setSearch] = useState("");

  const filtered = quizzes.filter(
    (q) =>
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.topic.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>Quizler & Denemeler</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {filtered.length} Aktif Test
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Öğrencilere yönelik ünite taramaları, konu kavrama testleri ve LGS denemeleri.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Quiz veya konu ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs rounded-xl border border-indigo-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all">
            <Plus size={15} />
            <span>Yeni Quiz</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((q) => (
          <div
            key={q.id}
            className="rounded-2xl border border-indigo-100/80 dark:border-slate-800/90 bg-white dark:bg-[#0a0f1d] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {q.grade}. Sınıf
                </span>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    q.difficulty === "YENI_NESIL"
                      ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                      : q.difficulty === "KAZANIM"
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  }`}
                >
                  {q.difficulty}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1 mb-1">
                {q.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-4">
                {q.unit} • {q.topic}
              </p>

              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-center mb-4">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold">Soru</div>
                  <div className="text-xs font-black text-slate-800 dark:text-slate-100">{q.questionCount}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold">Çözüm</div>
                  <div className="text-xs font-black text-indigo-600 dark:text-indigo-400">{q.attemptCount}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold">Ort. Başarı</div>
                  <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">%{q.avgScore}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
              <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <Clock size={12} />
                <span>{q.durationMin} Dk</span>
              </span>
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <Edit3 size={14} />
                </button>
                <button className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
