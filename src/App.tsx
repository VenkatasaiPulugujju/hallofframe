import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PostProvider, usePosts } from './context/PostContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CategoryFilter } from './components/CategoryFilter';
import { PostCard } from './components/PostCard';
import { PostDetailModal } from './components/PostDetailModal';
import { CreatePostModal } from './components/CreatePostModal';
import { ReportModal } from './components/ReportModal';
import { TrendingView } from './components/TrendingView';
import { ModerationDashboard } from './components/ModerationDashboard';
import { UserProfileModal } from './components/UserProfileModal';
import { LoginModal } from './components/LoginModal';
import { RulesAndSetupGuide } from './components/RulesAndSetupGuide';
import { BottomNavigation } from './components/BottomNavigation';
import type { Post } from './types';
import { Sparkles, Frown, PlusCircle, ArrowLeft } from 'lucide-react';

const MainContent: React.FC = () => {
  const { filteredPosts, loading, activeCategory, searchQuery, setSearchQuery } = usePosts();
  const { user } = useAuth();

  const [currentTab, setCurrentTab] = useState<'feed' | 'trending' | 'moderation'>('feed');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [reportingPost, setReportingPost] = useState<Post | null>(null);

  return (
    <div className="min-h-screen bg-[#FFD719] flex flex-col font-sans pb-20 sm:pb-12 text-[#111111]">
      {/* Sticky Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {currentTab === 'feed' && (
          <div>
            {/* Hero Section */}
            <HeroBanner
              onOpenCreate={() => setIsCreateOpen(true)}
              onOpenLogin={() => setIsLoginOpen(true)}
            />

            {/* Category Filter Tabs */}
            <CategoryFilter />

            {/* Active search filter feedback */}
            {searchQuery && (
              <div className="mb-4 flex items-center justify-between bg-[#FFF9F0] border-2 border-[#111111] rounded-xl px-4 py-2 shadow-brutal-xs">
                <span className="text-xs font-bold">
                  Searching for: <span className="font-black text-[#FF4388]">"{searchQuery}"</span>
                </span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-bold underline hover:text-[#FF4388]"
                >
                  Clear search
                </button>
              </div>
            )}

            {/* Posts Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-[#FFF9F0] border-[3px] border-[#111111] rounded-2xl h-96 p-4 animate-pulse shadow-brutal space-y-4"
                  >
                    <div className="h-6 bg-gray-300 rounded w-1/3" />
                    <div className="h-48 bg-gray-200 rounded-xl" />
                    <div className="h-4 bg-gray-300 rounded w-3/4" />
                    <div className="h-8 bg-gray-200 rounded-full w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="bg-[#FFF9F0] border-[3px] border-[#111111] rounded-2xl p-12 text-center shadow-brutal-lg max-w-lg mx-auto my-8">
                <div className="w-16 h-16 bg-[#FFD719] rounded-2xl border-2 border-[#111111] mx-auto flex items-center justify-center text-3xl mb-3 shadow-brutal-xs">
                  💀
                </div>
                <h3 className="font-display font-black text-2xl text-[#111111] mb-2">
                  No legendary moments yet.
                </h3>
                <p className="text-sm font-semibold text-gray-700 mb-6">
                  {searchQuery
                    ? `No moments matched "${searchQuery}". Clear your search or submit one!`
                    : 'Be the first to make campus history.'}
                </p>
                <button
                  onClick={() => (user ? setIsCreateOpen(true) : setIsLoginOpen(true))}
                  className="px-5 py-2.5 bg-[#FF4388] text-white border-2 border-[#111111] rounded-xl font-display font-black text-xs uppercase tracking-wider shadow-brutal-xs btn-press inline-flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post a Legendary Moment</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                  <PostCard
                    key={post.postId}
                    post={post}
                    onOpenDetail={(p) => setSelectedPost(p)}
                    onOpenReport={(p) => setReportingPost(p)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {currentTab === 'trending' && (
          <TrendingView
            onOpenDetail={(p) => setSelectedPost(p)}
            onOpenReport={(p) => setReportingPost(p)}
            onBackToFeed={() => setCurrentTab('feed')}
          />
        )}

        {currentTab === 'moderation' && (
          <ModerationDashboard onOpenDetail={(p) => setSelectedPost(p)} />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 pt-8 pb-16 sm:pb-8 border-t-[3px] border-[#111111] bg-[#FFD719] px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-[#111111]/80">
          <div className="flex items-center gap-2">
            <span className="text-xl">💀</span>
            <span className="font-display font-black text-sm">CAMPUS WALL OF FAME</span>
            <span>• Built for Chinmaya Vishwavidyapeeth</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="underline hover:text-[#FF4388]"
            >
              Firebase Rules & Setup
            </button>
            <span>•</span>
            <span>Consent-Protected Campus Entertainment</span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNavigation
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenCreate={() => setIsCreateOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      {/* Modals */}
      <PostDetailModal
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
        onOpenReport={(p) => setReportingPost(p)}
      />

      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onOpenSetupGuide={() => setIsGuideOpen(true)}
      />

      <ReportModal
        post={reportingPost}
        onClose={() => setReportingPost(null)}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onOpenDetail={(p) => setSelectedPost(p)}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />

      <RulesAndSetupGuide
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <PostProvider>
        <MainContent />
      </PostProvider>
    </AuthProvider>
  );
}
