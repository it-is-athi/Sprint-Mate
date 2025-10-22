import React, { useRef, useEffect } from 'react';
import { Calendar, Plus, ArrowLeft, Trash2, Edit3, Check, X } from 'lucide-react';
import gsap from 'gsap';

const AnimatedScheduleCard = ({
  schedule,
  editingSchedule,
  editForm,
  setEditForm,
  onScheduleClick,
  onEditClick,
  onDeleteClick,
  onEditSave,
  onEditCancel,
}) => {
  const cardRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    let glowEffect = null;

    const createGlowEffect = () => {
      if (glowRef.current) return;
      
      const glow = document.createElement('div');
      glow.style.cssText = `
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at center, 
          rgba(255, 215, 0, 0.2), 
          rgba(234, 179, 8, 0.15) 30%,
          rgba(218, 165, 32, 0.1) 50%,
          transparent 70%
        );
        pointer-events: none;
        opacity: 0;
        z-index: 1;
        mix-blend-mode: soft-light;
      `;
      glowRef.current = glow;
      card.appendChild(glow);
    };

    const handleMouseMove = (e) => {
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Tilt effect
      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;

      gsap.to(card, {
        rotateX,
        rotateY,
        duration: 0.1,
        ease: 'power2.out',
        transformPerspective: 1000,
      });

      // Glow effect
      if (!glowRef.current) createGlowEffect();
      
      const glowX = (x / rect.width) * 100;
      const glowY = (y / rect.height) * 100;

      gsap.to(glowRef.current, {
        opacity: 0.8,
        duration: 0.3,
        background: `
          radial-gradient(circle at ${glowX}% ${glowY}%, 
            rgba(255, 215, 0, 0.2), 
            rgba(234, 179, 8, 0.15) 30%,
            rgba(218, 165, 32, 0.1) 50%,
            transparent 70%
          )
        `,
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.3,
        ease: 'power2.out',
      });

      if (glowRef.current) {
        gsap.to(glowRef.current, {
          opacity: 0,
          duration: 0.3,
        });
      }
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
      glowRef.current = null;
    };
  }, []);

  return (
    <div
      ref={cardRef}
      onClick={() => onScheduleClick(schedule)}
      className="group relative bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl p-6 border border-yellow-600/30 hover:border-yellow-400/70 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/20 transform hover:scale-[1.02] overflow-hidden"
      style={{
        transform: 'perspective(1000px)',
        transformStyle: 'preserve-3d',
        boxShadow: 'inset 0 0 20px rgba(255, 215, 0, 0.05)',
      }}
    >
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-amber-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {editingSchedule === schedule._id ? (
              <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={editForm.schedule_title}
                  onChange={(e) => setEditForm({...editForm, schedule_title: e.target.value})}
                  className="w-full text-xl font-bold text-white bg-gray-800/60 border border-yellow-500/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent placeholder-yellow-300"
                  style={{ caretColor: '#FFD36B' }}
                  placeholder="Schedule title"
                />
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  className="w-full text-gray-200 text-sm bg-gray-800/60 border border-yellow-500/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none placeholder-yellow-400"
                  style={{ caretColor: '#FFD36B' }}
                  rows="2"
                  placeholder="Schedule description"
                />
              </div>
            ) : (
              <>
                <h3 className="text-xl font-serif bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-yellow-500 mb-2 group-hover:from-yellow-100 group-hover:to-yellow-400 transition-colors">
                  {schedule.schedule_title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">{schedule.description}</p>
              </>
            )}
          </div>
          
          {/* Status Indicator and Action Buttons */}
          <div className="flex items-center space-x-2">
            {editingSchedule !== schedule._id && (
              <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                schedule.status === 'active' 
                  ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                schedule.status === 'completed' 
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                  'bg-gray-500/20 text-gray-400 border-gray-500/30'
              }`}>
                {schedule.status}
              </div>
            )}
            
            {editingSchedule === schedule._id ? (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditSave(schedule._id);
                  }}
                  className="p-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 hover:border-green-400/50 hover:text-green-300 transition-all duration-200"
                  title="Save Changes"
                >
                  <Check className="w-4 h-4" />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditCancel();
                  }}
                  className="p-1.5 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-lg hover:bg-gray-500/30 hover:border-gray-400/50 hover:text-gray-300 transition-all duration-200"
                  title="Cancel Edit"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={(e) => onEditClick(e, schedule)}
                  className="p-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 hover:border-blue-400/50 hover:text-blue-300 transition-all duration-200 opacity-0 group-hover:opacity-100"
                  title="Edit Schedule"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                
                <button
                  onClick={(e) => onDeleteClick(e, schedule)}
                  className="p-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 hover:border-red-400/50 hover:text-red-300 transition-all duration-200 opacity-0 group-hover:opacity-100"
                  title="Delete Schedule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-yellow-400" />
            <span className="text-gray-500 text-sm font-medium capitalize">{schedule.repeat_pattern}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-500 text-xs">
            <span>Click to view tasks</span>
            <ArrowLeft className="w-3 h-3 rotate-180 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4 bg-gray-700/50 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${schedule.progress?.percentage || 0}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedScheduleCard;