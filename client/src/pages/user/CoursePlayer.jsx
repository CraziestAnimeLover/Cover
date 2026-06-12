import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { FiPlay, FiTv, FiRefreshCw, FiVideo, FiYoutube, FiList } from 'react-icons/fi';

const CoursePlayer = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/courses/${courseId}?_=${Date.now()}`);
      setCourse(res.data.course || res.data);
      setSections(res.data.sections || []);
      
      // Auto-select first available lecture
      for (const s of (res.data.sections || [])) {
        if (s.lectures?.length) {
          setCurrentLecture(s.lectures[0]);
          break;
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load course modules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) fetchData();
  }, [courseId]);

  // Convert YouTube URL to embed URL safely
  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes('watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('/embed/')) return url;
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96 font-sans">
        <div className="animate-spin rounded-xl h-10 w-10 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20 bg-white border border-slate-100 rounded-[20px] max-w-md mx-auto my-12 font-sans">
        <p className="text-rose-500 font-semibold">Course not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans selection:bg-orange-500/20">
      
      {/* Top Header Layer */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <span className="text-[10px] bg-slate-100 text-slate-600 font-bold tracking-[0.15em] uppercase px-2.5 py-1 rounded-md border border-slate-200 inline-block mb-2">
            Course Player
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{course.title}</h1>
        </div>
        
        <button 
          onClick={fetchData} 
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-orange-600 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl transition-all shadow-sm self-start sm:self-auto"
        >
          <FiRefreshCw className="stroke-[2.5]" /> Sync Playlist
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Video Canvas & Meta Info */}
        <div className="lg:col-span-2 space-y-5">
          {currentLecture ? (
            <>
              {/* Media Screening Stage */}
              <div className="bg-slate-950 rounded-[24px] overflow-hidden aspect-video shadow-lg ring-1 ring-slate-900/10 relative">
                {currentLecture.videoType === 'youtube' ? (
                  <iframe
                    src={getYoutubeEmbedUrl(currentLecture.youtubeUrl)}
                    className="w-full h-full"
                    allowFullScreen
                    title={currentLecture.title}
                  />
                ) : (
                  <video
                    src={`https://res.cloudinary.com/ded15rjju/video/upload/${currentLecture.videoPublicId}.mp4`}
                    controls
                    className="w-full h-full"
                    controlsList="nodownload"
                  />
                )}
              </div>
              
              {/* Active Lecture Metadata */}
              <div className="bg-white border border-slate-100 rounded-[20px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.01)]">
                <div className="flex items-center gap-2 text-orange-600 mb-2">
                  {currentLecture.videoType === 'youtube' ? <FiYoutube size={16} /> : <FiVideo size={16} />}
                  <span className="text-[11px] font-black uppercase tracking-wider">
                    Now Streaming ({currentLecture.videoType || 'Native Player'})
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{currentLecture.title}</h2>
                {currentLecture.description && (
                  <p className="text-slate-500 text-sm font-medium leading-relaxed mt-2.5 pt-4 border-t border-slate-50">
                    {currentLecture.description}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[24px] py-24 text-center">
              <FiTv size={36} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-bold">No lecture selected</p>
              <p className="text-slate-400 text-xs font-medium mt-1">Select a core segment from the playlist deck to begin learning.</p>
            </div>
          )}
        </div>

        {/* Right Side: Curriculum Navigation Deck */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-100 rounded-[24px] shadow-[0_12px_40px_rgba(0,0,0,0.02)] p-4 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
            <h3 className="font-extrabold text-slate-900 text-base tracking-tight mb-4 flex items-center gap-2 px-1">
              <FiList className="text-orange-500" /> Course Content
            </h3>
            
            <div className="space-y-4">
              {sections.map((section) => (
                <div key={section._id} className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
                  {/* Section Label Header */}
                  <div className="p-3 bg-slate-100/70 border-b border-slate-100 text-xs font-black text-slate-700 tracking-tight uppercase">
                    {section.title}
                  </div>
                  
                  {/* Playlist Queue Links */}
                  <div className="divide-y divide-slate-100/60 bg-white">
                    {section.lectures?.map((lecture) => {
                      const isActive = currentLecture?._id === lecture._id;
                      return (
                        <button
                          key={lecture._id}
                          type="button"
                          onClick={() => setCurrentLecture(lecture)}
                          className={`w-full text-left p-3.5 flex items-start gap-3 transition-all text-xs font-semibold ${
                            isActive
                              ? 'bg-orange-500/[0.07] text-orange-600 border-l-4 border-orange-500 pl-2.5 font-bold'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/60'
                          }`}
                        >
                          <FiPlay 
                            size={12} 
                            className={`mt-0.5 flex-shrink-0 ${isActive ? 'text-orange-500 fill-current' : 'text-slate-400 opacity-60'}`} 
                          />
                          <span className="line-clamp-2 leading-normal flex-1">{lecture.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CoursePlayer;