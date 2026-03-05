import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import { AdminLayout } from "./components/admin/AdminLayout";
import JourneyEditor from "./components/admin/JourneyEditor";
import CourseEditor from "./components/admin/CourseEditor";
import ArcadeEditor from "./components/admin/ArcadeEditor";
import MediaLibrary from "./components/admin/MediaLibrary";
import MediaStudio from "./components/admin/MediaStudio";
import VoicesEditor from "./components/admin/VoicesEditor";
import GuideEditor from "./components/admin/GuideEditor";
import { GhostArmyEditor } from "./components/admin/GhostArmyEditor";
import { PearlHarborEditor } from "./components/admin/PearlHarborEditor";
import { TriviaEditor } from "./components/admin/TriviaEditor";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="journeys" element={<JourneyEditor />} />
                <Route path="courses" element={<CourseEditor />} />
                <Route path="arcade" element={<ArcadeEditor />} />
                <Route path="studio" element={<MediaStudio />} />
                <Route path="media" element={<MediaLibrary />} />
                <Route path="voices" element={<VoicesEditor />} />
                <Route path="guides" element={<GuideEditor />} />
                <Route path="ghost-army" element={<GhostArmyEditor />} />
                <Route path="pearl-harbor" element={<PearlHarborEditor />} />
                <Route path="trivia" element={<TriviaEditor />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
