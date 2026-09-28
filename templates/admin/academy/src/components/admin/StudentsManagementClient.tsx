"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Users,
  GraduationCap,
  Clock,
  Award,
  Filter,
  CheckCircle2,
  Calendar,
  Building2,
  ArrowUpDown
} from "lucide-react";

export interface StudentItem {
  id: string;
  name: string;
  email: string;
  grade: number;
  schoolName: string;
  totalAttempts: number;
  averageScore: number;
  lastActive: string;
}

interface StudentsManagementProps {
  initialStudents?: StudentItem[];
}

export function StudentsManagementClient({ initialStudents = [] }: StudentsManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<number | "ALL">("ALL");

  const filtered = useMemo(() => {
    return initialStudents.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.schoolName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchGrade = selectedGrade === "ALL" || s.grade === selectedGrade;
      return matchSearch && matchGrade;
    });
  }, [initialStudents, searchTerm, selectedGrade]);

  return (
    <div className="space-y-6">
      {/* Başlık ve Filtreler */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>Öğrenci Yönetimi</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {filtered.length} Öğrenci
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Kayıtlı öğrencilerin sınav başarıları, deneme sayıları ve aktivite takibi.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Arama Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Öğrenci veya okul ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-indigo-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Sınıf Filtresi */}
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
            className="py-2 px-3 text-xs rounded-xl border border-indigo-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Tüm Sınıflar</option>
            <option value="5">5. Sınıf</option>
            <option value="6">6. Sınıf</option>
            <option value="7">7. Sınıf</option>
            <option value="8">8. Sınıf (LGS)</option>
          </select>
        </div>
      </div>

      {/* Öğrenci Tablosu */}
      <div className="rounded-2xl border border-indigo-100/80 dark:border-slate-800/90 bg-white dark:bg-[#0a0f1d] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 dark:bg-slate-900/60 border-b border-indigo-100/60 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Öğrenci</th>
                <th className="py-3 px-4">Sınıf & Okul</th>
                <th className="py-3 px-4 text-center">Çözülen Deneme</th>
                <th className="py-3 px-4 text-center">Ort. Puan</th>
                <th className="py-3 px-4 text-right">Son Aktivite</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-indigo-50/30 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-bold flex items-center justify-center shrink-0">
                        {s.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{s.name}</div>
                        <div className="text-[11px] text-slate-400">{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{s.grade}. Sınıf</span>
                    <div className="text-[11px] text-slate-400 truncate max-w-[160px]">{s.schoolName}</div>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-700 dark:text-slate-200">
                    {s.totalAttempts}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        s.averageScore >= 85
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : s.averageScore >= 70
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                      }`}
                    >
                      %{s.averageScore}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                    {s.lastActive}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
