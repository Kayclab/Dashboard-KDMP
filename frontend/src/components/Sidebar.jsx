import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Database, 
  Binary, 
  BarChart3, 
  Smile, 
  Lightbulb, 
  Layers, 
  TrendingUp, 
  MessageSquare, 
  Award, 
  Workflow, 
  ChevronLeft, 
  ChevronRight, 
  X
} from 'lucide-react';

export const MENU_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'data-understanding', label: 'Data Understanding', icon: Database },
  { id: 'data-processing', label: 'Data Processing', icon: Binary },
  { id: 'sentiment-analysis', label: 'Sentiment Analysis', icon: BarChart3 },
  { id: 'emoji-emotion', label: 'Emoji & Emosi', icon: Smile },
  { id: 'public-suggestions', label: 'Saran Publik', icon: Lightbulb },
  { id: 'issue-aspect', label: 'Isu & Aspek', icon: Layers },
  { id: 'topic-trend', label: 'Topik & Tren', icon: TrendingUp },
  { id: 'conversation', label: 'Analisis Percakapan', icon: MessageSquare },
  { id: 'evaluation-insights', label: 'Evaluasi Model', icon: Award },
  { id: 'data-flow-tech', label: 'Alur Data & Teknologi', icon: Workflow },
];

export default function Sidebar({ 
  activeMenu, 
  setActiveMenu, 
  isCollapsed, 
  setIsCollapsed, 
  mobileOpen, 
  setMobileOpen 
}) {
  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Floating White Capsule Sidebar */}
      <div className="lg:pl-6 lg:py-6 lg:h-screen lg:sticky lg:top-0 z-50 flex items-stretch">
        <motion.aside
          initial={false}
          animate={{ 
            width: isCollapsed ? 82 : 240,
          }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
          className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white rounded-none lg:rounded-[28px] shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-slate-100 lg:static lg:translate-x-0 ${
            mobileOpen ? 'translate-x-0 !w-64' : '-translate-x-full'
          } transition-transform lg:transition-none`}
        >
          {/* Top Logo / App Icon - Fully visible without clipping */}
          <div className="h-20 flex items-center justify-between px-3.5 border-b border-slate-100/60 flex-shrink-0">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-10 h-10 rounded-2xl bg-[#1a2e26] text-white flex items-center justify-center flex-shrink-0 hover:bg-[#315343] transition-colors shadow-xs"
                title={isCollapsed ? "Buka Menu" : "Kecilkan Menu"}
              >
                <div className="grid grid-cols-2 gap-1 w-3.5 h-3.5">
                  <div className="w-1.5 h-1.5 rounded-sm bg-white" />
                  <div className="w-1.5 h-1.5 rounded-sm bg-white" />
                  <div className="w-1.5 h-1.5 rounded-sm bg-white" />
                  <div className="w-1.5 h-1.5 rounded-sm bg-white" />
                </div>
              </button>

              {(!isCollapsed || mobileOpen) && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="min-w-0"
                >
                  <h2 className="font-bold text-sm text-[#1a2e26] tracking-tight leading-tight truncate">
                    KDMP Analytics
                  </h2>
                  <p className="text-[11px] text-[#737c76] font-medium truncate">
                    TikTok Dashboard
                  </p>
                </motion.div>
              )}
            </div>

            {/* Mobile close button */}
            <button 
              onClick={() => setMobileOpen(false)} 
              className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu List */}
          <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-1.5 custom-scrollbar">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveMenu(item.id);
                    setMobileOpen(false);
                  }}
                  title={item.label}
                  className={`relative w-full flex items-center gap-3 p-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 group text-left ${
                    isActive
                      ? 'bg-[#1a2e26] text-white shadow-sm'
                      : 'text-[#737c76] hover:bg-[#f6f5ef] hover:text-[#1a2e26]'
                  } ${isCollapsed && !mobileOpen ? 'justify-center px-0' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                    isActive 
                      ? 'text-white' 
                      : 'text-[#737c76] group-hover:text-[#1a2e26]'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  {(!isCollapsed || mobileOpen) && (
                    <span className="truncate flex-1">
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom Controls (Collapse Toggle) */}
          <div className="p-2.5 border-t border-slate-100/60 flex-shrink-0">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full hidden lg:flex items-center justify-center p-2 rounded-2xl text-[#737c76] hover:bg-[#f6f5ef] hover:text-[#1a2e26] transition-colors"
              title={isCollapsed ? "Perluas Sidebar" : "Perkecil Sidebar"}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </motion.aside>
      </div>
    </>
  );
}
