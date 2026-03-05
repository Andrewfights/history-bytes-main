import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { ChevronRight, BookOpen, Layers, FileText, ArrowLeft, Save, Clock, Star, Users, Plus, Trash2, X, Edit3, Database, GripVertical, Image, Video, HelpCircle, Upload, Wand2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { courses as initialCourses, units as initialUnits, lessons as initialLessons, formatDuration } from '@/data/courseData';
import { Course, Unit, Lesson } from '@/types';
import {
  saveCourses,
  loadStoredCourses,
  saveUnits,
  loadStoredUnits,
  saveLessons,
  loadStoredLessons,
  saveLessonContentLocal,
  loadStoredLessonContent,
  setCourseThumbnail,
  getCourseThumbnail,
  initCourseMediaCache,
  setLessonContentMedia,
  getLessonContentMedia,
  initLessonMediaCache,
} from '@/lib/adminStorage';
import {
  saveCourse as saveCourseToDb,
  saveUnit as saveUnitToDb,
  saveLesson as saveLessonToDb,
  loadCourses as loadCoursesFromDb,
  loadUnits as loadUnitsFromDb,
  loadLessons as loadLessonsFromDb,
  type LessonContent,
  type QuizQuestion,
  type QuizMetadata,
} from '@/lib/database';
import { isFirebaseConfigured } from '@/lib/firebase';
import { QuizBuilderModal } from './QuizBuilder';
import { MediaPicker } from './MediaPicker';
import { uploadFile, type MediaFile } from '@/lib/supabase';
import { generateImage, base64ToDataUrl, isGeminiConfigured } from '@/lib/gemini';
import { useThumbnailUrl, PLACEHOLDER_IMAGE } from '@/lib/thumbnailUtils';
import { triggerDataRefresh } from '@/hooks/useLiveData';

type ViewMode = 'courses' | 'units' | 'lessons' | 'edit';

const difficultyColors: Record<string, string> = {
  'beginner': 'bg-green-500/20 text-green-400',
  'intermediate': 'bg-amber-500/20 text-amber-400',
  'advanced': 'bg-red-500/20 text-red-400',
};

const difficultyOptions = ['beginner', 'intermediate', 'advanced'];

export default function CourseEditor() {
  // Load from localStorage or fall back to initial data
  const [coursesData, setCoursesData] = useState<Course[]>(() => {
    const stored = loadStoredCourses();
    return stored || [...initialCourses];
  });
  const [unitsData, setUnitsData] = useState<Unit[]>(() => {
    const stored = loadStoredUnits();
    return stored || [...initialUnits];
  });
  const [lessonsData, setLessonsData] = useState<Lesson[]>(() => {
    const stored = loadStoredLessons();
    return stored || [...initialLessons];
  });
  const [mediaInitialized, setMediaInitialized] = useState(false);

  // Initialize IndexedDB caches for media
  useEffect(() => {
    const initMedia = async () => {
      await Promise.all([initCourseMediaCache(), initLessonMediaCache()]);
      setMediaInitialized(true);
    };
    initMedia();
  }, []);

  // Load from Firestore on mount to stay in sync with frontend
  useEffect(() => {
    const loadFromFirestore = async () => {
      if (!isFirebaseConfigured()) return;

      try {
        // Load courses from Firestore
        const firestoreCourses = await loadCoursesFromDb();
        if (firestoreCourses && firestoreCourses.length > 0) {
          // Convert to Course type and merge with local data
          const converted: Course[] = firestoreCourses.map(c => ({
            id: c.id,
            title: c.title,
            slug: c.id,
            description: c.description || '',
            thumbnailUrl: c.thumbnailUrl || '/images/courses/default.jpg',
            heroImageUrl: c.thumbnailUrl || '/images/courses/default.jpg',
            category: 'general',
            difficulty: c.difficulty,
            totalDurationMinutes: 0,
            rating: 0,
            ratingsCount: 0,
            enrolledCount: 0,
            instructorId: c.instructor || '',
            instructor: c.instructor || '',
            unitsCount: 0,
            lessonsCount: 0,
            learningOutcomes: [],
            chronoOrder: c.displayOrder,
            isFeatured: c.isFeatured,
          }));
          setCoursesData(converted);
          saveCourses(converted); // Update localStorage cache
        }

        // Load units from Firestore
        const firestoreUnits = await loadUnitsFromDb();
        if (firestoreUnits && firestoreUnits.length > 0) {
          const convertedUnits: Unit[] = firestoreUnits.map(u => ({
            id: u.id,
            courseId: u.courseId,
            title: u.title,
            description: u.description || '',
            order: u.displayOrder,
            totalDurationMinutes: 0,
          }));
          setUnitsData(convertedUnits);
          saveUnits(convertedUnits);
        }

        // Load lessons from Firestore
        const firestoreLessons = await loadLessonsFromDb();
        if (firestoreLessons && firestoreLessons.length > 0) {
          const convertedLessons: Lesson[] = firestoreLessons.map(l => ({
            id: l.id,
            unitId: l.unitId,
            title: l.title,
            order: l.displayOrder,
            durationMinutes: l.durationMinutes || 10,
            cardsCount: 0,
            questionsCount: 0,
            xpReward: l.xpReward || 25,
          }));
          setLessonsData(convertedLessons);
          saveLessons(convertedLessons);
        }
      } catch (err) {
        console.error('Failed to load from Firestore:', err);
      }
    };

    loadFromFirestore();
  }, []);

  const [view, setView] = useState<ViewMode>('courses');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Modal states
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Course | Unit | Lesson | null>(null);

  // Bulk generation state
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });

  // Auto-save to localStorage when data changes
  useEffect(() => {
    saveCourses(coursesData);
  }, [coursesData]);

  useEffect(() => {
    saveUnits(unitsData);
  }, [unitsData]);

  useEffect(() => {
    saveLessons(lessonsData);
  }, [lessonsData]);

  // Helper functions
  const getCourseById = (id: string) => coursesData.find(c => c.id === id);
  const getUnitsByCourseId = (courseId: string) => unitsData.filter(u => u.courseId === courseId);
  const getLessonsByUnitId = (unitId: string) => lessonsData.filter(l => l.unitId === unitId);

  const selectedCourse = selectedCourseId ? getCourseById(selectedCourseId) : null;
  const courseUnits = selectedCourseId ? getUnitsByCourseId(selectedCourseId) : [];
  const selectedUnit = courseUnits.find(u => u.id === selectedUnitId);
  const unitLessons = selectedUnitId ? getLessonsByUnitId(selectedUnitId) : [];
  const selectedLesson = unitLessons.find(l => l.id === selectedLessonId);

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setSelectedUnitId(null);
    setSelectedLessonId(null);
    setView('units');
  };

  const handleSelectUnit = (unitId: string) => {
    setSelectedUnitId(unitId);
    setSelectedLessonId(null);
    setView('lessons');
  };

  const handleSelectLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setView('edit');
  };

  const handleBack = () => {
    if (view === 'edit') {
      setSelectedLessonId(null);
      setView('lessons');
    } else if (view === 'lessons') {
      setSelectedUnitId(null);
      setView('units');
    } else if (view === 'units') {
      setSelectedCourseId(null);
      setView('courses');
    }
  };

  const handleSave = useCallback(async () => {
    // Save to Supabase and localStorage
    try {
      let allSuccess = true;

      // Save all courses
      for (const course of coursesData) {
        const success = await saveCourseToDb({
          id: course.id,
          title: course.title,
          description: course.description,
          thumbnailUrl: course.thumbnailUrl,
          difficulty: course.difficulty,
          instructor: course.instructor,
          displayOrder: coursesData.indexOf(course),
          isFeatured: course.isFeatured,
        });
        if (!success) allSuccess = false;
      }

      // Save all units
      for (const unit of unitsData) {
        const success = await saveUnitToDb({
          id: unit.id,
          courseId: unit.courseId,
          title: unit.title,
          description: unit.description,
          displayOrder: unit.order || 0,
        });
        if (!success) allSuccess = false;
      }

      // Save all lessons
      for (const lesson of lessonsData) {
        const success = await saveLessonToDb({
          id: lesson.id,
          unitId: lesson.unitId,
          title: lesson.title,
          durationMinutes: lesson.durationMinutes,
          xpReward: lesson.xpReward,
          displayOrder: lesson.order || 0,
        });
        if (!success) allSuccess = false;
      }

      // Also save to localStorage as cache
      saveCourses(coursesData);
      saveUnits(unitsData);
      saveLessons(lessonsData);
      setHasUnsavedChanges(false);

      // Trigger refresh for frontend components
      triggerDataRefresh('COURSES');
      triggerDataRefresh('UNITS');
      triggerDataRefresh('LESSONS');

      if (allSuccess) {
        toast.success('All changes saved to cloud', {
          description: 'Data synced to Supabase database.',
        });
      } else {
        toast.success('Changes saved locally', {
          description: 'Supabase unavailable - saved to browser storage.',
        });
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Error saving changes', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [coursesData, unitsData, lessonsData]);

  // CRUD Operations for Courses
  const handleCreateCourse = async (data: Partial<Course>) => {
    const newCourse: Course = {
      id: `course-${Date.now()}`,
      title: data.title || 'New Course',
      description: data.description || '',
      thumbnailUrl: data.thumbnailUrl || '/images/courses/default.jpg',
      difficulty: (data.difficulty as 'beginner' | 'intermediate' | 'advanced') || 'beginner',
      instructor: data.instructor || 'Unknown',
      rating: 0,
      totalDurationMinutes: 0,
      enrolledCount: 0,
    };
    setCoursesData(prev => [...prev, newCourse]);
    setShowCourseModal(false);
    setEditingItem(null);

    // Auto-save to Firestore
    const success = await saveCourseToDb({
      id: newCourse.id,
      title: newCourse.title,
      description: newCourse.description,
      thumbnailUrl: newCourse.thumbnailUrl,
      difficulty: newCourse.difficulty,
      instructor: newCourse.instructor || '',
      displayOrder: coursesData.length,
      isFeatured: false,
    });

    if (success) {
      toast.success('Course created and synced to cloud');
    } else {
      toast.success('Course created (saved locally)');
    }
  };

  const handleUpdateCourse = async (data: Partial<Course>) => {
    if (!editingItem) return;
    const updatedCourse = { ...editingItem, ...data } as Course;
    setCoursesData(prev => prev.map(c => c.id === editingItem.id ? updatedCourse : c));
    setShowCourseModal(false);
    setEditingItem(null);

    // Auto-save to Firestore
    const courseIndex = coursesData.findIndex(c => c.id === editingItem.id);
    const success = await saveCourseToDb({
      id: updatedCourse.id,
      title: updatedCourse.title,
      description: updatedCourse.description || '',
      thumbnailUrl: updatedCourse.thumbnailUrl,
      difficulty: updatedCourse.difficulty,
      instructor: updatedCourse.instructor || '',
      displayOrder: courseIndex >= 0 ? courseIndex : 0,
      isFeatured: updatedCourse.isFeatured || false,
    });

    if (success) {
      toast.success('Course updated and synced to cloud');
    } else {
      toast.success('Course updated (saved locally)');
    }
  };

  const handleDeleteCourse = (id: string) => {
    if (!confirm('Delete this course and all its units and lessons?')) return;
    // Delete related units and lessons
    const unitIds = unitsData.filter(u => u.courseId === id).map(u => u.id);
    setLessonsData(prev => prev.filter(l => !unitIds.includes(l.unitId)));
    setUnitsData(prev => prev.filter(u => u.courseId !== id));
    setCoursesData(prev => prev.filter(c => c.id !== id));
    toast.success('Course deleted');
  };

  // CRUD Operations for Units
  const handleCreateUnit = (data: Partial<Unit>) => {
    if (!selectedCourseId) return;
    const existingUnits = getUnitsByCourseId(selectedCourseId);
    const newUnit: Unit = {
      id: `unit-${Date.now()}`,
      courseId: selectedCourseId,
      title: data.title || 'New Unit',
      description: data.description || '',
      order: existingUnits.length + 1,
      totalDurationMinutes: 0,
    };
    setUnitsData(prev => [...prev, newUnit]);
    setShowUnitModal(false);
    setEditingItem(null);
    toast.success('Unit created successfully');
  };

  const handleUpdateUnit = (data: Partial<Unit>) => {
    if (!editingItem) return;
    setUnitsData(prev => prev.map(u => u.id === editingItem.id ? { ...u, ...data } : u));
    setShowUnitModal(false);
    setEditingItem(null);
    toast.success('Unit updated');
  };

  const handleDeleteUnit = (id: string) => {
    if (!confirm('Delete this unit and all its lessons?')) return;
    setLessonsData(prev => prev.filter(l => l.unitId !== id));
    setUnitsData(prev => prev.filter(u => u.id !== id));
    toast.success('Unit deleted');
  };

  // CRUD Operations for Lessons
  const handleCreateLesson = (data: Partial<Lesson>) => {
    if (!selectedUnitId) return;
    const existingLessons = getLessonsByUnitId(selectedUnitId);
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      unitId: selectedUnitId,
      title: data.title || 'New Lesson',
      order: existingLessons.length + 1,
      durationMinutes: data.durationMinutes || 10,
      xpReward: data.xpReward || 50,
      cardsCount: data.cardsCount || 5,
      questionsCount: data.questionsCount || 3,
    };
    setLessonsData(prev => [...prev, newLesson]);
    setShowLessonModal(false);
    setEditingItem(null);
    toast.success('Lesson created successfully');
  };

  const handleUpdateLesson = (data: Partial<Lesson>) => {
    if (!editingItem) return;
    setLessonsData(prev => prev.map(l => l.id === editingItem.id ? { ...l, ...data } : l));
    setShowLessonModal(false);
    setEditingItem(null);
    toast.success('Lesson updated');
  };

  const handleDeleteLesson = (id: string) => {
    if (!confirm('Delete this lesson?')) return;
    setLessonsData(prev => prev.filter(l => l.id !== id));
    if (selectedLessonId === id) {
      setSelectedLessonId(null);
      setView('lessons');
    }
    toast.success('Lesson deleted');
  };

  // Edit helpers
  const openEditCourse = (course: Course) => {
    setEditingItem(course);
    setShowCourseModal(true);
  };

  const openEditUnit = (unit: Unit) => {
    setEditingItem(unit);
    setShowUnitModal(true);
  };

  const openEditLesson = (lesson: Lesson) => {
    setEditingItem(lesson);
    setShowLessonModal(true);
  };

  // Check if a thumbnail URL is valid (not a local path placeholder)
  const isValidThumbnail = (url: string | undefined): boolean => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:');
  };

  // Bulk generate thumbnails for all courses without valid images
  const handleGenerateAllThumbnails = async () => {
    if (!isGeminiConfigured()) {
      toast.error('Gemini API not configured', {
        description: 'Add VITE_GEMINI_API_KEY to your .env file'
      });
      return;
    }

    // Find courses that need thumbnails
    const coursesNeedingThumbnails = coursesData.filter(c => !isValidThumbnail(c.thumbnailUrl));

    if (coursesNeedingThumbnails.length === 0) {
      toast.info('All courses already have thumbnails');
      return;
    }

    setIsGeneratingAll(true);
    setGenerationProgress({ current: 0, total: coursesNeedingThumbnails.length });

    let successCount = 0;
    const updatedCourses = [...coursesData];

    for (let i = 0; i < coursesNeedingThumbnails.length; i++) {
      const course = coursesNeedingThumbnails[i];
      setGenerationProgress({ current: i + 1, total: coursesNeedingThumbnails.length });

      try {
        toast.loading(`Generating thumbnail for "${course.title}"...`, { id: `gen-${course.id}` });

        const prompt = `Educational course thumbnail for "${course.title}". ${course.description || ''}. Professional, clean design with historical imagery, suitable for an online learning platform. Artistic, engaging, high quality illustration.`;

        const result = await generateImage({
          prompt,
          aspectRatio: '16:9',
          style: 'cinematic'
        });

        if (result) {
          // Convert base64 to blob and upload to Firebase Storage
          const dataUrl = base64ToDataUrl(result.base64Data, result.mimeType);
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          const fileName = `course-${course.id}-${Date.now()}.${result.mimeType.split('/')[1] || 'png'}`;
          const file = new File([blob], fileName, { type: result.mimeType });

          const uploadResult = await uploadFile(file);

          if (uploadResult) {
            // Update course with new thumbnail URL
            const courseIndex = updatedCourses.findIndex(c => c.id === course.id);
            if (courseIndex >= 0) {
              updatedCourses[courseIndex] = {
                ...updatedCourses[courseIndex],
                thumbnailUrl: uploadResult.url
              };

              // Save to Firestore
              await saveCourseToDb({
                id: course.id,
                title: course.title,
                description: course.description || '',
                thumbnailUrl: uploadResult.url,
                difficulty: course.difficulty,
                instructor: course.instructor || '',
                displayOrder: courseIndex,
                isFeatured: course.isFeatured || false,
              });

              successCount++;
              toast.success(`Generated thumbnail for "${course.title}"`, { id: `gen-${course.id}` });
            }
          } else {
            toast.error(`Failed to upload thumbnail for "${course.title}"`, { id: `gen-${course.id}` });
          }
        } else {
          toast.error(`Failed to generate thumbnail for "${course.title}"`, { id: `gen-${course.id}` });
        }
      } catch (error) {
        console.error(`Error generating thumbnail for ${course.title}:`, error);
        toast.error(`Error generating thumbnail for "${course.title}"`, { id: `gen-${course.id}` });
      }

      // Small delay between generations to avoid rate limiting
      if (i < coursesNeedingThumbnails.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Update state with all the new thumbnails
    setCoursesData(updatedCourses);
    saveCourses(updatedCourses);

    setIsGeneratingAll(false);
    setGenerationProgress({ current: 0, total: 0 });

    toast.success(`Generated ${successCount} of ${coursesNeedingThumbnails.length} thumbnails`);
  };

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {view !== 'courses' && (
            <button
              onClick={handleBack}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <ArrowLeft size={20} className="text-muted-foreground" />
            </button>
          )}
          <div>
            <h1 className="font-editorial text-3xl font-bold text-foreground">Course Editor</h1>
            <Breadcrumbs
              course={selectedCourse}
              unit={selectedUnit}
              lesson={selectedLesson}
              onSelectCourse={() => { setSelectedUnitId(null); setSelectedLessonId(null); setView('units'); }}
              onSelectUnit={() => { setSelectedLessonId(null); setView('lessons'); }}
            />
          </div>
        </div>

        {/* Add Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
          >
            <Database size={18} />
            Save All
          </button>
          {view === 'courses' && (
            <>
              <button
                onClick={handleGenerateAllThumbnails}
                disabled={isGeneratingAll || !isGeminiConfigured()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={!isGeminiConfigured() ? 'Configure Gemini API key first' : 'Generate thumbnails for all courses'}
              >
                {isGeneratingAll ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {generationProgress.current}/{generationProgress.total}
                  </>
                ) : (
                  <>
                    <Wand2 size={18} />
                    Generate All Art
                  </>
                )}
              </button>
              <button
                onClick={() => { setEditingItem(null); setShowCourseModal(true); }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus size={18} />
                Add Course
              </button>
            </>
          )}
        {view === 'units' && (
            <button
              onClick={() => { setEditingItem(null); setShowUnitModal(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus size={18} />
              Add Unit
            </button>
          )}
          {view === 'lessons' && (
            <button
              onClick={() => { setEditingItem(null); setShowLessonModal(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus size={18} />
              Add Lesson
            </button>
          )}
        </div>
      </div>

      {/* Course List */}
      {view === 'courses' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-3"
        >
          {coursesData.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              unitCount={getUnitsByCourseId(course.id).length}
              onClick={() => handleSelectCourse(course.id)}
              onEdit={() => openEditCourse(course)}
              onDelete={() => handleDeleteCourse(course.id)}
            />
          ))}
          {coursesData.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No courses yet. Click "Add Course" to create one.
            </div>
          )}
        </motion.div>
      )}

      {/* Unit List */}
      {view === 'units' && selectedCourse && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-3"
        >
          {courseUnits.map((unit) => (
            <UnitCard
              key={unit.id}
              unit={unit}
              lessonCount={getLessonsByUnitId(unit.id).length}
              onClick={() => handleSelectUnit(unit.id)}
              onEdit={() => openEditUnit(unit)}
              onDelete={() => handleDeleteUnit(unit.id)}
            />
          ))}
          {courseUnits.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No units yet. Click "Add Unit" to create one.
            </div>
          )}
        </motion.div>
      )}

      {/* Lesson List */}
      {view === 'lessons' && selectedUnit && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-3"
        >
          {unitLessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              onClick={() => handleSelectLesson(lesson.id)}
              onEdit={() => openEditLesson(lesson)}
              onDelete={() => handleDeleteLesson(lesson.id)}
            />
          ))}
          {unitLessons.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No lessons yet. Click "Add Lesson" to create one.
            </div>
          )}
        </motion.div>
      )}

      {/* Lesson Editor */}
      {view === 'edit' && selectedLesson && (
        <LessonEditor
          lesson={selectedLesson}
          onSave={handleSave}
          onDelete={() => handleDeleteLesson(selectedLesson.id)}
          onUpdateLesson={(updates) => {
            setLessonsData(prev => prev.map(l =>
              l.id === selectedLesson.id ? { ...l, ...updates } : l
            ));
          }}
        />
      )}

      {/* Course Modal */}
      <AnimatePresence>
        {showCourseModal && (
          <CourseModal
            course={editingItem as Course | null}
            onClose={() => { setShowCourseModal(false); setEditingItem(null); }}
            onSave={editingItem ? handleUpdateCourse : handleCreateCourse}
          />
        )}
      </AnimatePresence>

      {/* Unit Modal */}
      <AnimatePresence>
        {showUnitModal && (
          <UnitModal
            unit={editingItem as Unit | null}
            onClose={() => { setShowUnitModal(false); setEditingItem(null); }}
            onSave={editingItem ? handleUpdateUnit : handleCreateUnit}
          />
        )}
      </AnimatePresence>

      {/* Lesson Modal */}
      <AnimatePresence>
        {showLessonModal && (
          <LessonModal
            lesson={editingItem as Lesson | null}
            onClose={() => { setShowLessonModal(false); setEditingItem(null); }}
            onSave={editingItem ? handleUpdateLesson : handleCreateLesson}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Breadcrumbs Component
function Breadcrumbs({
  course,
  unit,
  lesson,
  onSelectCourse,
  onSelectUnit,
}: {
  course: Course | null | undefined;
  unit: Unit | undefined;
  lesson: Lesson | undefined;
  onSelectCourse: () => void;
  onSelectUnit: () => void;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
      <span className="hover:text-foreground cursor-default">Courses</span>
      {course && (
        <>
          <ChevronRight size={14} />
          <button onClick={onSelectCourse} className="hover:text-foreground truncate max-w-[200px]">
            {course.title}
          </button>
        </>
      )}
      {unit && (
        <>
          <ChevronRight size={14} />
          <button onClick={onSelectUnit} className="hover:text-foreground truncate max-w-[200px]">
            {unit.title}
          </button>
        </>
      )}
      {lesson && (
        <>
          <ChevronRight size={14} />
          <span className="text-foreground truncate max-w-[200px]">{lesson.title}</span>
        </>
      )}
    </div>
  );
}

// Helper to resolve media URL from IndexedDB reference
function resolveMediaUrl(mediaUrl: string | undefined, lessonId: string, contentId: string): string | undefined {
  if (!mediaUrl) return undefined;

  if (mediaUrl.startsWith('idb:lesson:')) {
    // Parse the IDB reference: idb:lesson:{lessonId}:{contentId}
    const parts = mediaUrl.split(':');
    if (parts.length >= 4) {
      const storedMedia = getLessonContentMedia(parts[2], parts[3]);
      return storedMedia || undefined;
    }
  }

  return mediaUrl;
}

// Hook for resolved lesson content media
function useResolvedMediaUrl(mediaUrl: string | undefined, lessonId: string, contentId: string): string | undefined {
  const [resolved, setResolved] = useState<string | undefined>(undefined);

  useEffect(() => {
    const url = resolveMediaUrl(mediaUrl, lessonId, contentId);
    setResolved(url);
  }, [mediaUrl, lessonId, contentId]);

  return resolved;
}

// Course Card Component
function CourseCard({ course, unitCount, onClick, onEdit, onDelete }: {
  course: Course;
  unitCount: number;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const thumbnailUrl = useThumbnailUrl(course.thumbnailUrl, course.id);

  return (
    <div className="w-full bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors group">
      <div className="flex items-center justify-between">
        <button onClick={onClick} className="flex items-center gap-4 flex-1 text-left">
          <div className="w-14 h-14 rounded-xl bg-muted overflow-hidden">
            <img src={thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {course.title}
              </h3>
              <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full font-medium ${difficultyColors[course.difficulty]}`}>
                {course.difficulty}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Layers size={14} />
                {unitCount} units
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {formatDuration(course.totalDurationMinutes)}
              </span>
              <span className="flex items-center gap-1">
                <Star size={14} />
                {course.rating}
              </span>
            </div>
          </div>
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Edit"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
          <button onClick={onClick} className="p-2 text-muted-foreground group-hover:text-primary transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Unit Card Component
function UnitCard({ unit, lessonCount, onClick, onEdit, onDelete }: {
  unit: Unit;
  lessonCount: number;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="w-full bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors group">
      <div className="flex items-center justify-between">
        <button onClick={onClick} className="flex items-center gap-4 flex-1 text-left">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <Layers size={18} className="text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {unit.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {lessonCount} lessons | {formatDuration(unit.totalDurationMinutes)}
            </p>
          </div>
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Edit"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
          <button onClick={onClick} className="p-2 text-muted-foreground group-hover:text-primary transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Lesson Card Component
function LessonCard({ lesson, onClick, onEdit, onDelete }: {
  lesson: Lesson;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="w-full bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors group">
      <div className="flex items-center justify-between">
        <button onClick={onClick} className="flex items-center gap-4 flex-1 text-left">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <FileText size={18} className="text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {lesson.title}
            </h3>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{lesson.durationMinutes} min</span>
              <span>{lesson.cardsCount} cards</span>
              <span>{lesson.questionsCount} questions</span>
              <span>{lesson.xpReward} XP</span>
            </div>
          </div>
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Edit"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
          <button onClick={onClick} className="p-2 text-muted-foreground group-hover:text-primary transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Content type definitions
type ContentType = 'card' | 'quiz' | 'video' | 'image';

const CONTENT_TYPES: { value: ContentType; label: string; icon: React.ElementType }[] = [
  { value: 'card', label: 'Text Card', icon: FileText },
  { value: 'image', label: 'Image', icon: Image },
  { value: 'video', label: 'Video', icon: Video },
  { value: 'quiz', label: 'Quiz', icon: HelpCircle },
];

function generateContentId(): string {
  return `content-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Lesson Editor Component with Content Management
function LessonEditor({
  lesson,
  onSave,
  onDelete,
  onUpdateLesson,
}: {
  lesson: Lesson;
  onSave: () => void;
  onDelete: () => void;
  onUpdateLesson: (updates: Partial<Lesson>) => void;
}) {
  const [title, setTitle] = useState(lesson.title);
  const [duration, setDuration] = useState(lesson.durationMinutes);
  const [xpReward, setXpReward] = useState(lesson.xpReward);

  // Content management state
  const [content, setContent] = useState<LessonContent[]>(() => {
    const stored = loadStoredLessonContent(lesson.id);
    return stored || [];
  });
  const [expandedContent, setExpandedContent] = useState<string | null>(null);
  const [showQuizBuilder, setShowQuizBuilder] = useState<string | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState<{ contentId: string; type: 'image' | 'video' } | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Update lesson metadata when title/duration/xp change
  useEffect(() => {
    onUpdateLesson({ title, durationMinutes: duration, xpReward });
  }, [title, duration, xpReward, onUpdateLesson]);

  // Save content to localStorage when it changes
  useEffect(() => {
    saveLessonContentLocal(lesson.id, content);
  }, [lesson.id, content]);

  const addContent = (type: ContentType) => {
    const newContent: LessonContent = {
      id: generateContentId(),
      lessonId: lesson.id,
      contentType: type,
      displayOrder: content.length,
      title: '',
      body: type === 'card' ? '' : undefined,
      mediaUrl: type === 'image' || type === 'video' ? '' : undefined,
      mediaAutoplay: type === 'video' ? false : undefined,
      mediaLoop: type === 'video' ? false : undefined,
      mediaMuted: type === 'video' ? false : undefined,
      metadata: type === 'quiz' ? { questions: [] } as QuizMetadata : undefined,
    };
    setContent(prev => [...prev, newContent]);
    setExpandedContent(newContent.id);
    setShowAddMenu(false);
  };

  const updateContent = (id: string, updates: Partial<LessonContent>) => {
    setContent(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteContent = (id: string) => {
    if (confirm('Delete this content?')) {
      setContent(prev => prev.filter(c => c.id !== id));
      if (expandedContent === id) setExpandedContent(null);
    }
  };

  const handleReorderContent = (newOrder: LessonContent[]) => {
    setContent(newOrder.map((c, i) => ({ ...c, displayOrder: i })));
  };

  const handleQuizSave = (questions: QuizQuestion[]) => {
    if (showQuizBuilder) {
      updateContent(showQuizBuilder, { metadata: { questions } as QuizMetadata });
      setShowQuizBuilder(null);
    }
  };

  const handleMediaSelect = (file: MediaFile) => {
    if (showMediaPicker) {
      // If media is a data URL, save to IndexedDB
      if (file.url.startsWith('data:')) {
        setLessonContentMedia(lesson.id, showMediaPicker.contentId, file.url);
        updateContent(showMediaPicker.contentId, { mediaUrl: `idb:lesson:${lesson.id}:${showMediaPicker.contentId}` });
      } else {
        updateContent(showMediaPicker.contentId, { mediaUrl: file.url });
      }
      setShowMediaPicker(null);
    }
  };

  const handleSaveAll = () => {
    saveLessonContentLocal(lesson.id, content);
    onSave();
    triggerDataRefresh('LESSON_CONTENT');
    toast.success('Lesson and content saved');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Lesson Details Card */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText size={20} className="text-primary" />
            <span className="text-sm text-muted-foreground">Lesson: {lesson.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 size={16} />
              Delete
            </button>
            <button
              onClick={handleSaveAll}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              <Save size={16} />
              Save All
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-foreground mb-1.5 block">Lesson Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-background border border-border focus:border-primary outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Duration</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-lg bg-background border border-border focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">XP</label>
              <input
                type="number"
                value={xpReward}
                onChange={(e) => setXpReward(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-lg bg-background border border-border focus:border-primary outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Builder */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Lesson Content</h3>
            <p className="text-sm text-muted-foreground">{content.length} items - Drag to reorder</p>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus size={16} />
              Add Content
            </button>
            <AnimatePresence>
              {showAddMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-10"
                >
                  {CONTENT_TYPES.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => addContent(value)}
                      className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-secondary transition-colors"
                    >
                      <Icon size={18} className="text-muted-foreground" />
                      <span className="text-sm">{label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {content.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-xl">
            <FileText size={48} className="mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No content yet</p>
            <p className="text-sm text-muted-foreground mt-1">Add cards, images, videos, or quizzes</p>
          </div>
        ) : (
          <Reorder.Group axis="y" values={content} onReorder={handleReorderContent} className="space-y-2">
            {content.map((item) => {
              const ContentIcon = CONTENT_TYPES.find(t => t.value === item.contentType)?.icon || FileText;
              const isExpanded = expandedContent === item.id;

              return (
                <Reorder.Item key={item.id} value={item} className="bg-muted/30 border border-border rounded-xl overflow-hidden">
                  {/* Content Header */}
                  <button
                    onClick={() => setExpandedContent(isExpanded ? null : item.id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
                  >
                    <GripVertical size={16} className="text-muted-foreground cursor-grab" />
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <ContentIcon size={16} className="text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm">{item.title || `Untitled ${item.contentType}`}</p>
                      <p className="text-xs text-muted-foreground capitalize">{item.contentType}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteContent(item.id); }}
                      className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </button>

                  {/* Expanded Editor */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border"
                      >
                        <div className="p-4 space-y-4">
                          {/* Title */}
                          <div>
                            <label className="text-sm font-medium mb-1.5 block">Title</label>
                            <input
                              type="text"
                              value={item.title || ''}
                              onChange={(e) => updateContent(item.id, { title: e.target.value })}
                              placeholder="Content title..."
                              className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
                            />
                          </div>

                          {/* Type-specific fields */}
                          {item.contentType === 'card' && (
                            <div>
                              <label className="text-sm font-medium mb-1.5 block">Body Text</label>
                              <textarea
                                value={item.body || ''}
                                onChange={(e) => updateContent(item.id, { body: e.target.value })}
                                placeholder="Card content..."
                                rows={4}
                                className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none resize-none"
                              />
                            </div>
                          )}

                          {item.contentType === 'image' && (
                            <ContentMediaEditor
                              lessonId={lesson.id}
                              contentId={item.id}
                              mediaUrl={item.mediaUrl}
                              type="image"
                              onSelectMedia={() => setShowMediaPicker({ contentId: item.id, type: 'image' })}
                            />
                          )}

                          {item.contentType === 'video' && (
                            <div className="space-y-4">
                              <ContentMediaEditor
                                lessonId={lesson.id}
                                contentId={item.id}
                                mediaUrl={item.mediaUrl}
                                type="video"
                                onSelectMedia={() => setShowMediaPicker({ contentId: item.id, type: 'video' })}
                              />
                              <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={item.mediaAutoplay || false}
                                    onChange={(e) => updateContent(item.id, { mediaAutoplay: e.target.checked })}
                                    className="rounded"
                                  />
                                  <span className="text-sm">Autoplay</span>
                                </label>
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={item.mediaLoop || false}
                                    onChange={(e) => updateContent(item.id, { mediaLoop: e.target.checked })}
                                    className="rounded"
                                  />
                                  <span className="text-sm">Loop</span>
                                </label>
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={item.mediaMuted || false}
                                    onChange={(e) => updateContent(item.id, { mediaMuted: e.target.checked })}
                                    className="rounded"
                                  />
                                  <span className="text-sm">Muted</span>
                                </label>
                              </div>
                            </div>
                          )}

                          {item.contentType === 'quiz' && (
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium">Quiz Questions</label>
                                <span className="text-xs text-muted-foreground">
                                  {(item.metadata as QuizMetadata)?.questions?.length || 0} questions
                                </span>
                              </div>
                              <button
                                onClick={() => setShowQuizBuilder(item.id)}
                                className="w-full px-4 py-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 flex items-center justify-center gap-2 transition-colors"
                              >
                                <HelpCircle size={16} className="text-primary" />
                                <span className="text-sm">
                                  {(item.metadata as QuizMetadata)?.questions?.length > 0 ? 'Edit Quiz' : 'Create Quiz'}
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        )}
      </div>

      {/* Quiz Builder Modal */}
      <QuizBuilderModal
        isOpen={!!showQuizBuilder}
        initialQuestions={
          showQuizBuilder
            ? (content.find(c => c.id === showQuizBuilder)?.metadata as QuizMetadata)?.questions
            : undefined
        }
        onSave={handleQuizSave}
        onClose={() => setShowQuizBuilder(null)}
      />

      {/* Media Picker Modal */}
      <MediaPicker
        isOpen={!!showMediaPicker}
        onClose={() => setShowMediaPicker(null)}
        onSelect={handleMediaSelect}
        allowedTypes={showMediaPicker?.type ? [showMediaPicker.type] : ['image', 'video']}
        title={showMediaPicker?.type === 'video' ? 'Select Video' : 'Select Image'}
      />
    </motion.div>
  );
}

// Content Media Editor Component (handles IndexedDB resolution)
function ContentMediaEditor({
  lessonId,
  contentId,
  mediaUrl,
  type,
  onSelectMedia,
}: {
  lessonId: string;
  contentId: string;
  mediaUrl: string | undefined;
  type: 'image' | 'video';
  onSelectMedia: () => void;
}) {
  const resolvedUrl = useResolvedMediaUrl(mediaUrl, lessonId, contentId);

  return (
    <div>
      <label className="text-sm font-medium mb-1.5 block">{type === 'image' ? 'Image' : 'Video'}</label>
      {resolvedUrl ? (
        <div className="relative">
          {type === 'image' ? (
            <img src={resolvedUrl} alt="" className="w-full h-48 object-cover rounded-lg" />
          ) : (
            <video src={resolvedUrl} className="w-full h-48 object-cover rounded-lg" controls />
          )}
          <button
            onClick={onSelectMedia}
            className="absolute bottom-2 right-2 px-3 py-1.5 rounded-lg bg-black/50 text-white text-sm"
          >
            Change
          </button>
        </div>
      ) : (
        <button
          onClick={onSelectMedia}
          className="w-full h-32 rounded-lg border-2 border-dashed border-border hover:border-primary flex items-center justify-center gap-2 transition-colors"
        >
          {type === 'image' ? (
            <Image size={24} className="text-muted-foreground" />
          ) : (
            <Video size={24} className="text-muted-foreground" />
          )}
          <span className="text-sm text-muted-foreground">Select {type === 'image' ? 'Image' : 'Video'}</span>
        </button>
      )}
    </div>
  );
}

// Modal Components
function CourseModal({ course, onClose, onSave }: {
  course: Course | null;
  onClose: () => void;
  onSave: (data: Partial<Course>) => void;
}) {
  const [title, setTitle] = useState(course?.title || '');
  const [description, setDescription] = useState(course?.description || '');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [difficulty, setDifficulty] = useState(course?.difficulty || 'beginner');
  const [instructor, setInstructor] = useState(course?.instructor || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load thumbnail from IndexedDB if editing existing course
  useEffect(() => {
    if (course?.id) {
      const storedThumb = getCourseThumbnail(course.id);
      if (storedThumb) {
        setThumbnailUrl(storedThumb);
      } else if (course.thumbnailUrl) {
        setThumbnailUrl(course.thumbnailUrl);
      }
    } else if (course?.thumbnailUrl) {
      setThumbnailUrl(course.thumbnailUrl);
    }
  }, [course]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const courseId = course?.id || `course-${Date.now()}`;

    // If it's a Firebase Storage URL or external URL, save directly
    if (thumbnailUrl && (thumbnailUrl.startsWith('https://') || thumbnailUrl.startsWith('http://'))) {
      onSave({ title, description, thumbnailUrl, difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced', instructor });
    }
    // If it's a data URL (base64), save to IndexedDB for local fallback
    else if (thumbnailUrl && thumbnailUrl.startsWith('data:')) {
      setCourseThumbnail(courseId, thumbnailUrl);
      onSave({ title, description, thumbnailUrl: `idb:course:${courseId}`, difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced', instructor });
    }
    // No thumbnail or already an idb reference
    else {
      onSave({ title, description, thumbnailUrl, difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced', instructor });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Upload to Firebase Storage
    toast.loading('Uploading image...');
    const result = await uploadFile(file);
    toast.dismiss();

    if (result) {
      setThumbnailUrl(result.url);
      toast.success('Image uploaded to cloud');
    } else {
      // Fallback to base64 if upload fails
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setThumbnailUrl(dataUrl);
        toast.success('Image saved locally');
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerateImage = async () => {
    if (!isGeminiConfigured()) {
      toast.error('Gemini API not configured');
      return;
    }

    if (!title && !imagePrompt) {
      toast.error('Enter a course title or custom prompt first');
      return;
    }

    setIsGenerating(true);
    toast.info('Generating thumbnail...', { description: 'This may take a moment' });

    try {
      // Use custom prompt if provided, otherwise generate from title/description
      const prompt = imagePrompt.trim()
        ? imagePrompt
        : `Educational course thumbnail for "${title}". ${description || ''}. Professional, clean design with historical imagery, suitable for an online learning platform. Artistic, engaging, high quality illustration.`;

      const result = await generateImage({
        prompt,
        aspectRatio: '16:9',
        style: 'cinematic'
      });

      if (result) {
        // Convert base64 to blob and upload to Firebase Storage
        const dataUrl = base64ToDataUrl(result.base64Data, result.mimeType);

        // Create a File object from the base64 data
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const fileName = `generated-${Date.now()}.${result.mimeType.split('/')[1] || 'png'}`;
        const file = new File([blob], fileName, { type: result.mimeType });

        // Upload to Firebase Storage
        toast.loading('Uploading to cloud...');
        const uploadResult = await uploadFile(file);
        toast.dismiss();

        if (uploadResult) {
          setThumbnailUrl(uploadResult.url);
          toast.success('Thumbnail generated and uploaded!');
        } else {
          // Fallback to local storage if upload fails
          setThumbnailUrl(dataUrl);
          toast.success('Thumbnail generated (saved locally)');
        }
      } else {
        toast.error('Failed to generate image');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Error generating image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMediaSelect = (file: MediaFile) => {
    setThumbnailUrl(file.url);
    setShowMediaPicker(false);
    toast.success('Image selected');
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-card border border-border rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">{course ? 'Edit Course' : 'Create New Course'}</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Thumbnail Section */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Course Thumbnail</label>
              <div className="space-y-3">
                {/* Image Preview */}
                <div className="aspect-video rounded-xl bg-muted border-2 border-dashed border-border overflow-hidden relative">
                  {thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      alt="Course thumbnail"
                      className="w-full h-full object-cover"
                      onError={() => setThumbnailUrl('')}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                      <Image size={48} className="mb-2 opacity-50" />
                      <p className="text-sm">No thumbnail set</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
                  >
                    <Upload size={16} />
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMediaPicker(true)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
                  >
                    <Image size={16} />
                    Library
                  </button>
                </div>

                {/* AI Generation Section */}
                <div className="space-y-2 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <label className="text-xs font-medium text-purple-300 flex items-center gap-1.5">
                    <Wand2 size={12} />
                    AI Image Generation
                  </label>
                  <textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-purple-500 outline-none text-sm resize-none"
                    placeholder="Custom prompt (optional) - leave empty to auto-generate from title..."
                  />
                  <button
                    type="button"
                    onClick={handleGenerateImage}
                    disabled={isGenerating || !isGeminiConfigured()}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors text-sm disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                    {isGenerating ? 'Generating...' : imagePrompt.trim() ? 'Generate with Custom Prompt' : 'Generate from Title'}
                  </button>
                </div>

                {/* URL Input (optional) */}
                <input
                  type="text"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
                  placeholder="Or paste image URL..."
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
                placeholder="Course title"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none resize-none"
                placeholder="Course description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
                >
                  {difficultyOptions.map(d => (
                    <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Instructor</label>
                <input
                  type="text"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
                  placeholder="Instructor name"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                {course ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>

      {/* Media Picker */}
      <MediaPicker
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handleMediaSelect}
        allowedTypes={['image']}
        title="Select Course Thumbnail"
      />
    </>
  );
}

function UnitModal({ unit, onClose, onSave }: {
  unit: Unit | null;
  onClose: () => void;
  onSave: (data: Partial<Unit>) => void;
}) {
  const [title, setTitle] = useState(unit?.title || '');
  const [description, setDescription] = useState(unit?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, description });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card border border-border rounded-xl p-6 w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{unit ? 'Edit Unit' : 'Create New Unit'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
              placeholder="Unit title"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none resize-none"
              placeholder="Unit description"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              {unit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function LessonModal({ lesson, onClose, onSave }: {
  lesson: Lesson | null;
  onClose: () => void;
  onSave: (data: Partial<Lesson>) => void;
}) {
  const [title, setTitle] = useState(lesson?.title || '');
  const [durationMinutes, setDurationMinutes] = useState(lesson?.durationMinutes || 10);
  const [xpReward, setXpReward] = useState(lesson?.xpReward || 50);
  const [cardsCount, setCardsCount] = useState(lesson?.cardsCount || 5);
  const [questionsCount, setQuestionsCount] = useState(lesson?.questionsCount || 3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title, durationMinutes, xpReward, cardsCount, questionsCount });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card border border-border rounded-xl p-6 w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{lesson ? 'Edit Lesson' : 'Create New Lesson'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
              placeholder="Lesson title"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Duration (min)</label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                min={1}
                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">XP Reward</label>
              <input
                type="number"
                value={xpReward}
                onChange={(e) => setXpReward(Number(e.target.value))}
                min={0}
                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Cards Count</label>
              <input
                type="number"
                value={cardsCount}
                onChange={(e) => setCardsCount(Number(e.target.value))}
                min={0}
                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Questions</label>
              <input
                type="number"
                value={questionsCount}
                onChange={(e) => setQuestionsCount(Number(e.target.value))}
                min={0}
                className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              {lesson ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
