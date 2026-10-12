import {BookOpen, ChevronLeft, ChevronRight} from 'lucide-react';
import {ChapterNavigationProps} from "@/types";


export function ChapterNavigation({
                                      chapters,
                                      currentChapter,
                                      onChapterSelect,
                                      isOpen,
                                      onToggle
                                  }: ChapterNavigationProps) {
    const handlePrevious = () => {
        if (currentChapter > 1) {
            onChapterSelect(currentChapter - 1);
        }
    };

    const handleNext = () => {
        if (currentChapter < chapters.length) {
            onChapterSelect(currentChapter + 1);
        }
    };

    return (
        <>
            {!isOpen && (
                <button
                    onClick={onToggle}
                    className="fixed top-4 sm:top-6 left-4 sm:left-6 z-50 p-3 rounded-full bg-black/30 border border-amber-900/30 hover:bg-black/50 transition-all duration-300 backdrop-blur-sm"
                    aria-label="Toggle chapter navigation"
                >
                    <BookOpen className="w-5 h-5 text-amber-100"/>
                </button>
            )}

            <div
                className={`fixed left-0 top-0 h-full w-full sm:w-80 bg-black/95 border-r border-amber-900/30 backdrop-blur-md z-40 transition-transform duration-500 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="p-6 sm:p-8">
                    <h2 className="text-xl sm:text-2xl font-bold text-amber-100 mb-2 font-serif">The Codex</h2>
                    <p className="text-amber-200/60 text-xs sm:text-sm mb-6 sm:mb-8">Select a chapter to begin</p>

                    <div
                        className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-thumb-amber-900/30 scrollbar-track-transparent">
                        {chapters.map((chapter) => (
                            <button
                                key={chapter.id}
                                onClick={() => {
                                    onChapterSelect(chapter.id);
                                    onToggle();
                                }}
                                className={`w-full text-left p-4 rounded-lg transition-all duration-300 ${
                                    currentChapter === chapter.id
                                        ? 'bg-amber-900/40 border border-amber-700/60'
                                        : 'bg-black/40 border border-amber-900/20 hover:bg-amber-950/30'
                                }`}
                            >
                                <div className="text-amber-400 text-xs sm:text-sm font-semibold mb-1">
                                    Chapter {chapter.id}
                                </div>
                                <div className="text-amber-100 font-serif text-sm sm:text-base">
                                    {chapter.subtitle}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30"
                    onClick={onToggle}
                />
            )}

            <div
                className="fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 sm:gap-4 z-30 px-4">
                <button
                    onClick={handlePrevious}
                    disabled={currentChapter === 1}
                    className="px-3 sm:px-4 py-2 bg-black/40 border border-amber-900/40 rounded hover:bg-amber-950/40 transition-all duration-300 flex items-center gap-1 sm:gap-2 text-amber-100 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ChevronLeft className="w-4 h-4"/>
                    <span className="hidden sm:inline">Previous</span>
                </button>

                <div
                    className="px-3 sm:px-4 py-2 bg-black/60 border border-amber-900/60 rounded text-amber-100 font-serif text-xs sm:text-sm whitespace-nowrap">
                    <span className="hidden sm:inline">Chapter {currentChapter} of {chapters.length}</span>
                    <span className="sm:hidden">{currentChapter}/{chapters.length}</span>
                </div>

                <button
                    onClick={handleNext}
                    disabled={currentChapter === chapters.length}
                    className="px-3 sm:px-4 py-2 bg-black/40 border border-amber-900/40 rounded hover:bg-amber-950/40 transition-all duration-300 flex items-center gap-1 sm:gap-2 text-amber-100 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4"/>
                </button>
            </div>
        </>
    );
}
