import { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/context/AuthContext";
import { AudioProvider } from "@/context/AudioContext";
import { Loader2 } from 'lucide-react';
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DebugAssets from "./pages/DebugAssets";

// Lazy load admin components to reduce initial bundle size
const AdminLayout = lazy(() => import('./components/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminRoute = lazy(() => import('./components/admin/AdminRoute').then(m => ({ default: m.AdminRoute })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const JourneyEditor = lazy(() => import('./components/admin/JourneyEditor'));
const CourseEditor = lazy(() => import('./components/admin/CourseEditor'));
const ArcadeEditor = lazy(() => import('./components/admin/ArcadeEditor'));
const MediaLibrary = lazy(() => import('./components/admin/MediaLibrary'));
const MediaStudio = lazy(() => import('./components/admin/MediaStudio'));
const VoicesEditor = lazy(() => import('./components/admin/VoicesEditor'));
const GuideEditor = lazy(() => import('./components/admin/GuideEditor'));
const WW2GuideEditor = lazy(() => import('./components/admin/WW2GuideEditor'));
const GhostArmyEditor = lazy(() => import('./components/admin/GhostArmyEditor').then(m => ({ default: m.GhostArmyEditor })));
const PearlHarborEditor = lazy(() => import('./components/admin/PearlHarborEditor').then(m => ({ default: m.PearlHarborEditor })));
const TriviaEditor = lazy(() => import('./components/admin/TriviaEditor').then(m => ({ default: m.TriviaEditor })));
const JourneyManagement = lazy(() => import('./components/admin/journey-management').then(m => ({ default: m.JourneyManagement })));
const PantheonEditor = lazy(() => import('./components/admin/PantheonEditor'));
const EraTileEditor = lazy(() => import('./components/admin/EraTileEditor'));
const MapEditor = lazy(() => import('./components/admin/MapEditor'));
const JourneyUIEditor = lazy(() => import('./components/admin/JourneyUIEditor'));
const WW2ModuleEditor = lazy(() => import('./components/admin/WW2ModuleEditor'));
const ExamVideoManager = lazy(() => import('./components/admin/ExamVideoManager'));
const FeaturedSectionEditor = lazy(() => import('./components/admin/FeaturedSectionEditor'));
const AppSettingsEditor = lazy(() => import('./components/admin/AppSettingsEditor').then(m => ({ default: m.AppSettingsEditor })));

const queryClient = new QueryClient();

// Loading fallback for lazy-loaded components
function AdminLoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="animate-spin mx-auto mb-4" size={32} />
        <p className="text-muted-foreground">Loading admin panel...</p>
      </div>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AudioProvider>
            <BrowserRouter>
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/debug-assets" element={<DebugAssets />} />
              {/* Admin Routes - Protected and Lazy Loaded */}
              <Route
                path="/admin"
                element={
                  <Suspense fallback={<AdminLoadingFallback />}>
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  </Suspense>
                }
              >
                <Route index element={<Suspense fallback={<AdminLoadingFallback />}><AdminDashboard /></Suspense>} />
                <Route path="journeys" element={<Suspense fallback={<AdminLoadingFallback />}><JourneyEditor /></Suspense>} />
                <Route path="journey-management" element={<Suspense fallback={<AdminLoadingFallback />}><JourneyManagement /></Suspense>} />
                <Route path="courses" element={<Suspense fallback={<AdminLoadingFallback />}><CourseEditor /></Suspense>} />
                <Route path="arcade" element={<Suspense fallback={<AdminLoadingFallback />}><ArcadeEditor /></Suspense>} />
                <Route path="studio" element={<Suspense fallback={<AdminLoadingFallback />}><MediaStudio /></Suspense>} />
                <Route path="media" element={<Suspense fallback={<AdminLoadingFallback />}><MediaLibrary /></Suspense>} />
                <Route path="voices" element={<Suspense fallback={<AdminLoadingFallback />}><VoicesEditor /></Suspense>} />
                <Route path="guides" element={<Suspense fallback={<AdminLoadingFallback />}><GuideEditor /></Suspense>} />
                <Route path="ww2-guides" element={<Suspense fallback={<AdminLoadingFallback />}><WW2GuideEditor /></Suspense>} />
                <Route path="era-tiles" element={<Suspense fallback={<AdminLoadingFallback />}><EraTileEditor /></Suspense>} />
                <Route path="maps" element={<Suspense fallback={<AdminLoadingFallback />}><MapEditor /></Suspense>} />
                <Route path="ghost-army" element={<Suspense fallback={<AdminLoadingFallback />}><GhostArmyEditor /></Suspense>} />
                <Route path="pearl-harbor" element={<Suspense fallback={<AdminLoadingFallback />}><PearlHarborEditor /></Suspense>} />
                <Route path="trivia" element={<Suspense fallback={<AdminLoadingFallback />}><TriviaEditor /></Suspense>} />
                <Route path="pantheon" element={<Suspense fallback={<AdminLoadingFallback />}><PantheonEditor /></Suspense>} />
                <Route path="journey-ui" element={<Suspense fallback={<AdminLoadingFallback />}><JourneyUIEditor /></Suspense>} />
                <Route path="ww2-module" element={<Suspense fallback={<AdminLoadingFallback />}><WW2ModuleEditor /></Suspense>} />
                <Route path="exam-videos" element={<Suspense fallback={<AdminLoadingFallback />}><ExamVideoManager /></Suspense>} />
                <Route path="featured-section" element={<Suspense fallback={<AdminLoadingFallback />}><FeaturedSectionEditor /></Suspense>} />
                <Route path="app-settings" element={<Suspense fallback={<AdminLoadingFallback />}><AppSettingsEditor /></Suspense>} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AudioProvider>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
