import React, { useState } from 'react';
import { ArrowLeft, Download, Plus, CheckCircle2, Clock, Users, BookOpen, BarChart3, Award } from 'lucide-react';
import { ALL_MODULES } from '../modules/registry';

interface TeacherDashboardProps {
  onBack: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onBack }) => {
  // Sample pseudonymous student records (Section 9.2: privacy first, no personal health data)
  const [students, setStudents] = useState([
    { pseudoId: 'STD-8841', completed: 9, avgScore: 88, activeMin: 42, lastSeen: 'Today 10:45' },
    { pseudoId: 'STD-3104', completed: 11, avgScore: 94, activeMin: 55, lastSeen: 'Today 11:10' },
    { pseudoId: 'STD-5529', completed: 6, avgScore: 78, activeMin: 28, lastSeen: 'Yesterday' },
    { pseudoId: 'STD-1942', completed: 10, avgScore: 91, activeMin: 48, lastSeen: 'Today 09:30' },
    { pseudoId: 'STD-7210', completed: 4, avgScore: 72, activeMin: 18, lastSeen: '3 days ago' },
  ]);

  const [assignments, setAssignments] = useState([
    { id: 'as-1', module: 'M01 Onion Root-Growth', classGrade: 'Class 9-A', due: 'Nov 12, 2026', submissions: '24/28' },
    { id: 'as-2', module: 'M04 Xylem and Phloem', classGrade: 'Class 9-A', due: 'Nov 15, 2026', submissions: '18/28' },
    { id: 'as-3', module: 'M09 Elbow Muscle-Bone', classGrade: 'Class 9-B', due: 'Nov 18, 2026', submissions: '8/26' },
  ]);

  const [newModuleToAssign, setNewModuleToAssign] = useState<string>('M01');
  const [newDueDate, setNewDueDate] = useState<string>('2026-11-20');

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMod = ALL_MODULES.find((m) => m.meta.id === newModuleToAssign);
    if (!targetMod) return;

    setAssignments([
      ...assignments,
      {
        id: `as-${Date.now()}`,
        module: `${targetMod.meta.id} ${targetMod.meta.title}`,
        classGrade: 'Class 9-A',
        due: newDueDate,
        submissions: '0/28',
      },
    ]);
  };

  // CSV Export (PRD Section 10 Release V4)
  const handleExportCSV = () => {
    const headers = 'Pseudonymous_ID,Completed_Modules,Average_Score_Percent,Active_Minutes,Last_Seen\n';
    const rows = students
      .map((s) => `${s.pseudoId},${s.completed},${s.avgScore}%,${s.activeMin},"${s.lastSeen}"`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VLS_Class9_Tissues_Progress_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        maxWidth: '980px',
        margin: '0 auto',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--surface)',
            color: 'var(--text)',
            fontSize: '0.82rem',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} /> Back to Modules
        </button>

        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
            Teacher Dashboard & Progress Reports (V4)
          </h2>
          <span style={{ fontSize: '0.78rem', color: 'var(--text)', opacity: 0.8 }}>
            Class 9-A · Chapter 3: Tissues in Action
          </span>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            backgroundColor: 'var(--accent)',
            color: '#ffffff',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Download size={15} /> Export Progress CSV
        </button>
      </div>

      {/* Metric Cards Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
        }}
      >
        {[
          { label: 'Enrolled Students', val: '28', note: 'Pseudonymous IDs', icon: <Users size={18} color="var(--primary)" /> },
          { label: 'Average Completion', val: '74%', note: 'Target: ≥ 70%', icon: <CheckCircle2 size={18} color="var(--accent)" /> },
          { label: 'Check Accuracy', val: '86.2%', note: 'Target: ≥ 75%', icon: <Award size={18} color="var(--secondary)" /> },
          { label: 'Avg Active Time', val: '7.8 min', note: 'PRD standard: 5–10 min', icon: <Clock size={18} color="var(--primary)" /> },
        ].map((card, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: 'var(--surface)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text)', opacity: 0.75, fontWeight: 600 }}>
                {card.label}
              </span>
              {card.icon}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
              {card.val}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--accent)', marginTop: '4px', fontWeight: 600 }}>
              {card.note}
            </div>
          </div>
        ))}
      </div>

      {/* Active Assignments & Assign New Module */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          padding: '20px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary)' }}>
            Assigned Chapter Modules
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
          {assignments.map((as) => (
            <div
              key={as.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(0,0,0,0.015)',
                border: '1px solid var(--border)',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div>
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)' }}>{as.module}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text)', opacity: 0.75, marginLeft: '8px' }}>
                  ({as.classGrade})
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.78rem' }}>
                <span>Due: {as.due}</span>
                <span style={{ fontWeight: 700, color: 'var(--accent)' }}>Submissions: {as.submissions}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Assign Form */}
        <form
          onSubmit={handleCreateAssignment}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(51, 71, 168, 0.04)',
            border: '1px dashed var(--primary)',
          }}
        >
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>
            + Assign Module:
          </span>
          <select
            value={newModuleToAssign}
            onChange={(e) => setNewModuleToAssign(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.8rem' }}
          >
            {ALL_MODULES.map((m) => (
              <option key={m.meta.id} value={m.meta.id}>
                {m.meta.id}: {m.meta.title}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            style={{ padding: '5px 8px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.8rem' }}
          />

          <button
            type="submit"
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Assign to Class
          </button>
        </form>
      </div>

      {/* Student Roster Table (Pseudonymous) */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          padding: '20px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
          overflowX: 'auto',
        }}
      >
        <h3 style={{ margin: '0 0 12px 0', fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary)' }}>
          Learner Progress Overview
        </h3>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(0,0,0,0.03)', borderBottom: '2px solid var(--border)' }}>
              <th style={{ padding: '8px 10px', textAlign: 'left' }}>Pseudonymous ID</th>
              <th style={{ padding: '8px 10px', textAlign: 'center' }}>Completed Modules</th>
              <th style={{ padding: '8px 10px', textAlign: 'center' }}>Avg Check Accuracy</th>
              <th style={{ padding: '8px 10px', textAlign: 'center' }}>Active Time</th>
              <th style={{ padding: '8px 10px', textAlign: 'right' }}>Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.pseudoId} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 10px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {s.pseudoId}
                </td>
                <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                  {s.completed} / {ALL_MODULES.length}
                </td>
                <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700, color: 'var(--accent)' }}>
                  {s.avgScore}%
                </td>
                <td style={{ padding: '8px 10px', textAlign: 'center' }}>{s.activeMin} mins</td>
                <td style={{ padding: '8px 10px', textAlign: 'right', opacity: 0.8 }}>{s.lastSeen}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
