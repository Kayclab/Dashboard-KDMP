import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Raw data
import dashboardDataRaw from './data/dashboard_data.json';

// Components
import Sidebar, { MENU_ITEMS } from './components/Sidebar';
import Header from './components/Header';

// Pages
import OverviewPage from './pages/OverviewPage';
import DataUnderstandingPage from './pages/DataUnderstandingPage';
import DataProcessingPage from './pages/DataProcessingPage';
import SentimentAnalysisPage from './pages/SentimentAnalysisPage';
import EmojiEmotionPage from './pages/EmojiEmotionPage';
import PublicSuggestionsPage from './pages/PublicSuggestionsPage';
import IssueAspectPage from './pages/IssueAspectPage';
import TopicTrendPage from './pages/TopicTrendPage';
import ConversationPage from './pages/ConversationPage';
import EvaluationInsightsPage from './pages/EvaluationInsightsPage';
import DataFlowTechnologyPage from './pages/DataFlowTechnologyPage';

export default function App() {
  const [activeMenu, setActiveMenu] = useState('overview');
  const [isCollapsed, setIsCollapsed] = useState(true); // default compact dock like reference
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');
  const [globalSearch, setGlobalSearch] = useState('');

  // Dynamically filter data if date filter is active
  const activeData = useMemo(() => {
    if (dateFilter === 'all') return dashboardDataRaw;

    const filterCommentList = (list = []) => list.filter(c => (c.create_time || '').startsWith(dateFilter));

    return {
      ...dashboardDataRaw,
      samples: {
        positif: filterCommentList(dashboardDataRaw.samples?.positif),
        negatif: filterCommentList(dashboardDataRaw.samples?.negatif),
        netral: filterCommentList(dashboardDataRaw.samples?.netral),
        saran: filterCommentList(dashboardDataRaw.samples?.saran),
        prioritas_tinjau: filterCommentList(dashboardDataRaw.samples?.prioritas_tinjau)
      }
    };
  }, [dateFilter]);

  const activeMenuItem = MENU_ITEMS.find(m => m.id === activeMenu);

  // Page switcher
  const renderActivePage = () => {
    switch (activeMenu) {
      case 'overview':
        return <OverviewPage data={activeData} setActiveMenu={setActiveMenu} />;
      case 'data-understanding':
        return <DataUnderstandingPage data={activeData} />;
      case 'data-processing':
        return <DataProcessingPage data={activeData} />;
      case 'sentiment-analysis':
        return <SentimentAnalysisPage data={activeData} />;
      case 'emoji-emotion':
        return <EmojiEmotionPage data={activeData} />;
      case 'public-suggestions':
        return <PublicSuggestionsPage data={activeData} />;
      case 'issue-aspect':
        return <IssueAspectPage data={activeData} />;
      case 'topic-trend':
        return <TopicTrendPage data={activeData} />;
      case 'conversation':
        return <ConversationPage data={activeData} />;
      case 'evaluation-insights':
        return <EvaluationInsightsPage data={activeData} />;
      case 'data-flow-tech':
        return <DataFlowTechnologyPage data={activeData} />;
      default:
        return <OverviewPage data={activeData} setActiveMenu={setActiveMenu} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#ecebe4] text-[#1a2e26] flex flex-col lg:flex-row antialiased font-sans selection:bg-[#315343] selection:text-white">
      {/* Sleek Floating Dock Sidebar */}
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <Header
          setMobileOpen={setMobileOpen}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
          activeMenuTitle={activeMenuItem?.label}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 px-4 sm:px-8 pb-8 max-w-7xl w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMenu}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {renderActivePage()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Minimal Clean Footer */}
        <footer className="mt-auto py-5 px-4 sm:px-8 text-center text-xs text-[#8e9791]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="font-medium text-[#737c76]">
              KDMP Social Media Analytics Dashboard
            </p>
            <p>
              Teknologi Big Data • Semester 5
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
