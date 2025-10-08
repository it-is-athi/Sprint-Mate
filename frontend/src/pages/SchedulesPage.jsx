import React, { useRef, useEffect } from 'react';
import { Calendar, Plus } from 'lucide-react';
import AnimatedScheduleCard from '../components/AnimatedScheduleCard';
import gsap from 'gsap';
import '../styles/animations.css';

function SchedulesPage({ 
  schedules, 
  loading, 
  onScheduleClick, 
  onCreateClick, 
  onDeleteClick, 
  onEditClick,
  onEditSave,
  onEditCancel,
  editingSchedule,
  editForm,
  setEditForm
}) {
  return (
    <div 
      className="min-h-screen space-y-6 p-6 overflow-x-hidden"
      style={{
        backgroundColor: "#0a0a0a",
        backgroundImage: `
          linear-gradient(to right, rgba(234, 179, 8, 0.1) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(234, 179, 8, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: "50px 50px",
        backgroundPosition: "0 0"
      }}
    >
      {/* Font Import */}
      <link
        href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@400;700&display=swap"
        rel="stylesheet"
      />

      {/* Ambient glow effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-[128px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[128px] animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[20rem] bg-orange-500/5 rounded-full blur-[96px] animate-pulse" style={{ animationDuration: '6s' }} />
      </div>

      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 
            className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500 hover:scale-[1.01] transition-transform duration-300"
            style={{ 
              fontFamily: "'Bodoni Moda', serif",
              backgroundSize: '200% auto',
              animation: 'gradient 8s linear infinite'
            }}
          >
            My Learning Schedules
          </h2>
          <p 
            className="text-gray-400 mt-2 hover:text-gray-300 transition-colors duration-300" 
            style={{ fontFamily: "'Bodoni Moda', serif" }}
          >
            Organize and track your educational journey
          </p>
        </div>
        
        {/* Create Schedule Button */}
        <button
          onClick={onCreateClick}
          className="group flex items-center space-x-3 bg-gradient-to-r from-yellow-600 to-amber-600 text-black px-6 py-3 rounded-xl hover:from-yellow-500 hover:to-amber-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          style={{ fontFamily: "'Bodoni Moda', serif" }}
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span className="font-semibold">Create Schedule</span>
        </button>
      </div>

      {/* Schedules Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-600/30 border-t-yellow-600"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-amber-500 animate-spin" style={{animationDuration: '1.5s', animationDirection: 'reverse'}}></div>
          </div>
        </div>
      ) : schedules.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden">
          {schedules.map((schedule) => (
            <AnimatedScheduleCard
              key={schedule._id}
              schedule={schedule}
              editingSchedule={editingSchedule}
              editForm={editForm}
              setEditForm={setEditForm}
              onScheduleClick={onScheduleClick}
              onEditClick={onEditClick}
              onDeleteClick={onDeleteClick}
              onEditSave={onEditSave}
              onEditCancel={onEditCancel}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-yellow-500/30">
            <Calendar className="w-12 h-12 text-yellow-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-300 mb-3">No schedules yet</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">Start your learning journey by creating your first schedule. Our AI will help you break down your goals into manageable daily tasks.</p>
          <button
            onClick={onCreateClick}
            className="inline-flex items-center space-x-3 bg-gradient-to-r from-yellow-600 to-amber-600 text-black px-8 py-4 rounded-xl font-bold hover:from-yellow-500 hover:to-amber-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            <Plus className="w-5 h-5" />
            <span>Create Your First Schedule</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default SchedulesPage;