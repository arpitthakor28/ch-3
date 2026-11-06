import React, { useState } from 'react';
import { Award, CheckCircle2, XCircle, ArrowLeft, RotateCcw, BookOpen } from 'lucide-react';

interface QuizQuestion {
  id: number;
  prompt: string;
  type: 'multiple-choice' | 'true-false';
  options: string[];
  answer: string;
  why: string;
}

const CHAPTER_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    prompt: 'What structural property of meristematic cells enables them to divide repeatedly?',
    type: 'multiple-choice',
    options: [
      'Thin cellulose walls, dense cytoplasm, and a large prominent nucleus',
      'Thick lignified walls with large central vacuoles',
      'Extracellular mineralized matrix with calcium salts',
      'Long branched fibres with intercalated discs',
    ],
    answer: 'Thin cellulose walls, dense cytoplasm, and a large prominent nucleus',
    why: 'Meristematic cells are actively dividing embryonic cells that have thin primary walls, rich cytoplasm, and active large nuclei without bulky vacuoles.',
  },
  {
    id: 2,
    prompt: 'A plant is unable to transport manufactured sugars and organic food from its leaves down to its roots. Which tissue system is impaired?',
    type: 'multiple-choice',
    options: ['Phloem (sieve tubes & companion cells)', 'Xylem vessels', 'Epidermal cuticle', 'Apical meristem'],
    answer: 'Phloem (sieve tubes & companion cells)',
    why: 'Phloem carries organic photosynthetic food (sugars) bidirectionally away from the leaves to all growing parts and storage roots.',
  },
  {
    id: 3,
    prompt: 'Why is the epithelial lining of internal exchange organs (such as lung alveoli and capillary walls) only a single thin cell layer thick?',
    type: 'multiple-choice',
    options: [
      'To allow rapid, unobstructed diffusion and exchange of gases and nutrients',
      'To withstand severe friction and mechanical abrasion',
      'To store large starch grains for times of starvation',
      'To produce rigid skeletal support for the organ',
    ],
    answer: 'To allow rapid, unobstructed diffusion and exchange of gases and nutrients',
    why: 'Squamous exchange epithelium minimizes barrier distance, enabling rapid physical diffusion of oxygen and carbon dioxide.',
  },
  {
    id: 4,
    prompt: "Which joint type bends in the knee and ankle in the chapter's jump landing task?",
    type: 'multiple-choice',
    options: ['Hinge joint', 'Pivot joint', 'Fixed joint', 'Ball and socket joint'],
    answer: 'Hinge joint',
    why: 'Both the knee and ankle bend predominantly in one plane like a swinging door hinge.',
  },
  {
    id: 5,
    prompt: 'True or False: Lung epithelium consists of many stacked layers of tall cells that slow diffusion.',
    type: 'true-false',
    options: ['True', 'False'],
    answer: 'False',
    why: 'False: Lung exchange epithelium is a single ultra-thin layer of flat squamous cells that accelerates gas diffusion.',
  },
  {
    id: 6,
    prompt: 'True or False: Cardiac muscle tissue works rhythmically for a lifetime without experiencing muscular fatigue.',
    type: 'true-false',
    options: ['True', 'False'],
    answer: 'True',
    why: 'True: Involuntary branched cardiac muscle cells contract rhythmically throughout life without fatigue.',
  },
  {
    id: 7,
    prompt: 'True or False: Tendons join bone to bone at joints.',
    type: 'true-false',
    options: ['True', 'False'],
    answer: 'False',
    why: 'False: Tendons connect muscle to bone. Ligaments connect bone to bone.',
  },
  {
    id: 8,
    prompt: 'True or False: In a hinge joint, bones slide and rotate freely in all directions.',
    type: 'true-false',
    options: ['True', 'False'],
    answer: 'False',
    why: 'False: Hinge joints permit movement in one single back-and-forth plane only.',
  },
  {
    id: 9,
    prompt: 'Which plant tissue provides tensile mechanical flexibility without breaking to a young mango stem?',
    type: 'multiple-choice',
    options: ['Collenchyma', 'Sclerenchyma', 'Aerenchyma', 'Apical meristem'],
    answer: 'Collenchyma',
    why: 'Collenchyma cells have unevenly pectin-thickened cell corners that confer mechanical support combined with bending elasticity.',
  },
  {
    id: 10,
    prompt: 'Why do coconut husk fibres feel tough, rigid and gritty?',
    type: 'multiple-choice',
    options: [
      'Sclerenchyma tissue has thick lignified secondary walls and dead cells',
      'Parenchyma cells store excessive water',
      'Phloem fibres are alive and actively divide',
      'The tissue is composed of living thin-walled cells',
    ],
    answer: 'Sclerenchyma tissue has thick lignified secondary walls and dead cells',
    why: 'Sclerenchyma fibres have thick walls heavily impregnated with lignin; at functional maturity, their protoplasts die, leaving hard rigid walls.',
  },
  {
    id: 11,
    prompt: 'From the teak tree annual ring data, what is the direct biological relationship between trunk diameter and ring count?',
    type: 'multiple-choice',
    options: [
      'Trunk diameter widens as concentric annual rings are added by lateral meristem',
      'Tree rings only form when a branch is removed by pruning',
      'Rings decrease as diameter expands',
      'Annual rings have no correlation to age or girth',
    ],
    answer: 'Trunk diameter widens as concentric annual rings are added by lateral meristem',
    why: 'Each season, the lateral cambium meristem generates a new cylinder of xylem cells, expanding the trunk diameter by one ring per year.',
  },
  {
    id: 12,
    prompt: 'Which plant tissue makes the stem thicker in girth, and where is it situated?',
    type: 'multiple-choice',
    options: [
      'Lateral meristem (cambium), arranged in a cylindrical ring along the stem sides',
      'Apical meristem, located at the growing shoot tips',
      'Intercalary meristem, located at internode bases',
      'Epidermis, on the outer leaf cuticle',
    ],
    answer: 'Lateral meristem (cambium), arranged in a cylindrical ring along the stem sides',
    why: 'Lateral meristem divides radially outward and inward, increasing the girth and thickness of stems and roots.',
  },
];

interface ChapterQuizProps {
  onBack: () => void;
}

export const ChapterQuiz: React.FC<ChapterQuizProps> = ({ onBack }) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSelectOption = (qId: number, option: string) => {
    if (submitted) return;
    setAnswers({ ...answers, [qId]: option });
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  let score = 0;
  CHAPTER_QUIZ_QUESTIONS.forEach((q) => {
    if (answers[q.id] === q.answer) score++;
  });
  const percent = Math.round((score / CHAPTER_QUIZ_QUESTIONS.length) * 100);

  return (
    <div
      style={{
        maxWidth: '850px',
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

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
            Class 9 Chapter 3 Mastery Quiz Bank
          </h2>
          <span style={{ fontSize: '0.78rem', color: 'var(--text)', opacity: 0.8 }}>
            12 Chapter-Level Concept Assessments (PRD Section 13.1)
          </span>
        </div>

        {submitted && (
          <button
            type="button"
            onClick={handleReset}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface)',
              color: 'var(--text)',
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={14} /> Retake Quiz
          </button>
        )}
      </div>

      {/* Score Summary Banner if submitted */}
      {submitted && (
        <div
          style={{
            padding: '18px 24px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: percent >= 75 ? 'rgba(0, 158, 115, 0.1)' : 'rgba(213, 94, 0, 0.1)',
            border: `2px solid ${percent >= 75 ? 'var(--accent)' : '#D55E00'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Award size={32} color={percent >= 75 ? 'var(--accent)' : '#D55E00'} />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                {percent >= 75 ? 'Mastery Standard Achieved!' : 'Review Key Tissues & Retake'}
              </h3>
              <span style={{ fontSize: '0.84rem', opacity: 0.85 }}>
                You scored {score} of {CHAPTER_QUIZ_QUESTIONS.length} ({percent}%) · Target: 75%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {CHAPTER_QUIZ_QUESTIONS.map((q) => {
          const selected = answers[q.id];
          const isCorrect = selected === q.answer;

          return (
            <div
              key={q.id}
              style={{
                backgroundColor: 'var(--surface)',
                padding: '16px 20px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.92rem', fontWeight: 700, color: 'var(--text)' }}>
                  Question {q.id}. {q.prompt}
                </h4>
                {submitted && (
                  <span>
                    {isCorrect ? (
                      <CheckCircle2 size={20} color="var(--accent)" />
                    ) : (
                      <XCircle size={20} color="#D55E00" />
                    )}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {q.options.map((opt, oIdx) => {
                  const isOptSelected = selected === opt;
                  return (
                    <button
                      key={oIdx}
                      type="button"
                      disabled={submitted}
                      onClick={() => handleSelectOption(q.id, opt)}
                      style={{
                        textAlign: 'left',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border:
                          submitted && opt === q.answer
                            ? '2px solid var(--accent)'
                            : isOptSelected
                            ? '2px solid var(--primary)'
                            : '1px solid var(--border)',
                        backgroundColor:
                          submitted && opt === q.answer
                            ? 'rgba(0, 158, 115, 0.08)'
                            : isOptSelected
                            ? 'rgba(51, 71, 168, 0.08)'
                            : 'transparent',
                        color: 'var(--text)',
                        fontSize: '0.84rem',
                        fontWeight: isOptSelected ? 700 : 400,
                        cursor: submitted ? 'default' : 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {submitted && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isCorrect ? 'rgba(0, 158, 115, 0.06)' : 'rgba(213, 94, 0, 0.06)',
                    fontSize: '0.8rem',
                    lineHeight: 1.4,
                  }}
                >
                  <strong>{isCorrect ? '✓ Correct: ' : '✗ Explanation: '}</strong>
                  {q.why}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      {!submitted && (
        <button
          type="button"
          onClick={() => setSubmitted(true)}
          disabled={Object.keys(answers).length < CHAPTER_QUIZ_QUESTIONS.length}
          style={{
            padding: '12px 24px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            fontSize: '0.95rem',
            fontWeight: 800,
            cursor: Object.keys(answers).length >= CHAPTER_QUIZ_QUESTIONS.length ? 'pointer' : 'default',
            opacity: Object.keys(answers).length >= CHAPTER_QUIZ_QUESTIONS.length ? 1 : 0.5,
            alignSelf: 'center',
            minWidth: '240px',
          }}
        >
          Submit Full Chapter Quiz
        </button>
      )}
    </div>
  );
};

