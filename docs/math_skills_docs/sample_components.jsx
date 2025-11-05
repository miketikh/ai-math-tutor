// React Component Examples for Tutoring App

// ============================================
// 1. PERSISTENT HEADER COMPONENT
// ============================================

const ProgressHeader = ({ mainProblem, skillPath, currentProgress }) => {
  return (
    <div className="sticky top-0 bg-white border-b shadow-sm z-10">
      <div className="max-w-3xl mx-auto p-4">
        {/* Main Goal */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🏠</span>
          <div className="flex-1">
            <div className="text-xs text-gray-500">Main Goal</div>
            <div className="font-semibold">{mainProblem}</div>
          </div>
          <button className="text-blue-500 text-sm">
            View Full
          </button>
        </div>

        {/* Breadcrumb Trail */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Your Path:</span>
          {skillPath.map((skill, idx) => (
            <React.Fragment key={skill}>
              <button 
                className="text-blue-500 hover:underline"
                onClick={() => navigateToLevel(skill)}
              >
                {skill}
              </button>
              {idx < skillPath.length - 1 && (
                <span className="text-gray-400">→</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${currentProgress}%` }}
            />
          </div>
          <span className="text-sm font-medium">{currentProgress}%</span>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 2. SKILL FORK COMPONENT (Practice Path)
// ============================================

const SkillFork = ({ skill, onStartPractice, onWatchVideo }) => {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">🎯</div>
        <h2 className="text-2xl font-bold mb-2">I found what's tricky!</h2>
        <p className="text-gray-600">
          To solve your problem, you'll need:
        </p>
      </div>

      {/* Main Practice Card */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200 mb-4">
        <div className="flex items-start gap-3 mb-4">
          <span className="text-3xl">🔒</span>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1">{skill.name}</h3>
            <p className="text-gray-700 mb-4">
              Master this first, then you'll be ready for two-step equations!
            </p>
          </div>
        </div>

        <button 
          onClick={onStartPractice}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition"
        >
          Practice This (3-5 problems)
        </button>
      </div>

      {/* Alternative Option */}
      <div className="text-center">
        <div className="text-gray-500 mb-3">OR</div>
        <button 
          onClick={onWatchVideo}
          className="w-full bg-white border-2 border-gray-300 py-3 rounded-lg font-medium hover:border-gray-400 transition"
        >
          💡 Watch a quick explanation (2 min video)
        </button>
      </div>

      {/* Encouragement */}
      <p className="text-center text-gray-600 mt-6 text-sm">
        After this, you'll return to your main problem with new skills! 🚀
      </p>
    </div>
  );
};

// ============================================
// 3. PRACTICE PROBLEM COMPONENT
// ============================================

const PracticeProblem = ({ 
  problem, 
  currentIndex, 
  totalProblems, 
  onSubmit,
  hint 
}) => {
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress Stars */}
      <div className="flex justify-center gap-2 mb-6">
        {Array.from({ length: totalProblems }).map((_, idx) => (
          <span 
            key={idx}
            className={`text-3xl ${
              idx < currentIndex 
                ? 'opacity-100' 
                : 'opacity-20'
            }`}
          >
            ⭐
          </span>
        ))}
      </div>

      {/* Problem Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-100">
        <div className="text-center mb-8">
          <div className="text-sm text-gray-500 mb-2">
            Problem {currentIndex + 1} of {totalProblems}
          </div>
          <div className="text-3xl font-mono font-bold text-gray-800">
            {problem.text}
          </div>
        </div>

        {/* Answer Input */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            What is x?
          </label>
          <input 
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full text-2xl text-center font-mono p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            placeholder="Enter your answer"
            autoFocus
          />
        </div>

        {/* Submit Button */}
        <button 
          onClick={() => onSubmit(answer)}
          disabled={!answer}
          className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
        >
          Submit Answer
        </button>

        {/* Hint Toggle */}
        <div className="mt-4 text-center">
          <button 
            onClick={() => setShowHint(!showHint)}
            className="text-blue-500 text-sm hover:underline"
          >
            💡 {showHint ? 'Hide hint' : 'Show hint'}
          </button>
          
          {showHint && (
            <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-gray-700">
              {hint}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// 4. SKILL MASTERY CELEBRATION
// ============================================

const SkillMastered = ({ skill, onReturn, onPracticeMore }) => {
  useEffect(() => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 text-center">
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-12 border-2 border-green-200">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Skill Unlocked!
        </h2>
        <div className="text-xl text-gray-700 mb-8">
          {skill.name} ✓
        </div>

        <p className="text-gray-600 mb-8">
          You're ready to tackle your main problem now!
        </p>

        {/* Return Button - Primary */}
        <button 
          onClick={onReturn}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition mb-3"
        >
          Return to Main Problem →
        </button>

        {/* Practice More - Secondary */}
        <button 
          onClick={onPracticeMore}
          className="w-full bg-white border-2 border-gray-300 py-3 rounded-lg font-medium hover:border-gray-400 transition"
        >
          Practice 5 More (Keep building confidence)
        </button>

        {/* Stats */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-around text-sm">
            <div>
              <div className="text-2xl font-bold text-green-600">5/5</div>
              <div className="text-gray-500">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">+100</div>
              <div className="text-gray-500">XP Earned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">⚡</div>
              <div className="text-gray-500">On Fire</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 5. RECURSIVE DEPTH INDICATOR
// ============================================

const DepthIndicator = ({ skillStack }) => {
  return (
    <div className="max-w-2xl mx-auto p-4 mb-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-sm font-medium text-gray-700 mb-2">
          Your Journey:
        </div>
        <div className="space-y-2">
          {skillStack.map((skill, idx) => {
            const isComplete = idx < skillStack.length - 1;
            const isCurrent = idx === skillStack.length - 1;
            
            return (
              <div 
                key={idx}
                className="flex items-center gap-3"
              >
                <span className="text-2xl">
                  {isComplete ? '✓' : isCurrent ? '🎯' : '○'}
                </span>
                <div className={`flex-1 ${
                  isComplete 
                    ? 'text-gray-500 line-through' 
                    : isCurrent 
                    ? 'font-semibold text-blue-700'
                    : 'text-gray-400'
                }`}>
                  {idx + 1}. {skill.name}
                  {isCurrent && <span className="ml-2 text-xs">(← you are here)</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============================================
// 6. SOCRATIC CHAT INTERFACE
// ============================================

const SocraticChat = ({ messages, onSendMessage, quickOptions }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div 
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {msg.role === 'assistant' && (
                <div className="text-sm font-medium mb-1">🤖 Tutor</div>
              )}
              <div className="text-base">{msg.content}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Options (if provided) */}
      {quickOptions && (
        <div className="p-4 border-t space-y-2">
          <div className="text-sm text-gray-600 mb-2">Quick options:</div>
          {quickOptions.map((option, idx) => (
            <button 
              key={idx}
              onClick={() => onSendMessage(option.text)}
              className="w-full text-left p-3 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-400 transition"
            >
              {option.icon} {option.text}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && input.trim()) {
                onSendMessage(input);
                setInput('');
              }
            }}
            placeholder="Type your answer..."
            className="flex-1 p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
          <button 
            onClick={() => {
              if (input.trim()) {
                onSendMessage(input);
                setInput('');
              }
            }}
            disabled={!input.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 7. SKILL TREE VISUALIZATION (Optional)
// ============================================

const SkillTreeView = ({ skills, currentSkill, onSelectSkill }) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Your Learning Map
      </h2>

      <div className="relative">
        {/* Main Problem - Top */}
        <div className="flex justify-center mb-8">
          <SkillNode 
            skill={skills.mainProblem}
            status="goal"
            onClick={onSelectSkill}
          />
        </div>

        {/* Connector Lines */}
        <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: -1 }}>
          {/* Draw lines between nodes here */}
        </svg>

        {/* Layer 1 Prerequisites */}
        <div className="flex justify-around mb-8">
          {skills.layer1.map(skill => (
            <SkillNode 
              key={skill.id}
              skill={skill}
              status={skill.mastered ? 'complete' : skill.id === currentSkill ? 'current' : 'locked'}
              onClick={onSelectSkill}
            />
          ))}
        </div>

        {/* Layer 2 Prerequisites (if expanded) */}
        {skills.layer2Visible && (
          <div className="flex justify-around">
            {skills.layer2.map(skill => (
              <SkillNode 
                key={skill.id}
                skill={skill}
                status={skill.mastered ? 'complete' : 'locked'}
                onClick={onSelectSkill}
              />
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm font-medium mb-2">Legend:</div>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <span>Current Goal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            <span>Current Focus</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">✓</span>
            <span>Mastered</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔒</span>
            <span>Locked</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const SkillNode = ({ skill, status, onClick }) => {
  const styles = {
    goal: 'bg-yellow-100 border-yellow-400',
    current: 'bg-blue-100 border-blue-400',
    complete: 'bg-green-100 border-green-400',
    locked: 'bg-gray-100 border-gray-300'
  };

  const icons = {
    goal: '🎯',
    current: '⭐',
    complete: '✓',
    locked: '🔒'
  };

  return (
    <button 
      onClick={() => onClick(skill)}
      className={`p-4 rounded-xl border-2 ${styles[status]} transition hover:scale-105`}
    >
      <div className="text-3xl mb-2">{icons[status]}</div>
      <div className="font-medium text-sm">{skill.name}</div>
      {skill.progress && (
        <div className="text-xs text-gray-600 mt-1">
          {skill.progress.current}/{skill.progress.total}
        </div>
      )}
    </button>
  );
};

// ============================================
// 8. MAIN APP ORCHESTRATOR
// ============================================

const TutoringApp = () => {
  const [state, setState] = useState({
    mainProblem: null,
    currentScreen: 'entry',
    skillStack: [],
    currentSkill: null,
    messages: [],
    skillProgress: {}
  });

  const handleProblemEntry = (problem) => {
    setState(prev => ({
      ...prev,
      mainProblem: problem,
      currentScreen: 'diagnosis',
      skillStack: [{ name: 'Main Problem', type: 'main' }]
    }));
  };

  const handleBranchToSkill = (skill) => {
    setState(prev => ({
      ...prev,
      currentScreen: 'practice',
      skillStack: [...prev.skillStack, skill],
      currentSkill: skill
    }));
  };

  const handleReturnToParent = () => {
    setState(prev => {
      const newStack = [...prev.skillStack];
      newStack.pop();
      return {
        ...prev,
        skillStack: newStack,
        currentSkill: newStack[newStack.length - 1],
        currentScreen: newStack.length === 1 ? 'diagnosis' : 'practice'
      };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Persistent Header */}
      {state.mainProblem && (
        <ProgressHeader 
          mainProblem={state.mainProblem.text}
          skillPath={state.skillStack.map(s => s.name)}
          currentProgress={calculateProgress(state)}
        />
      )}

      {/* Main Content Area */}
      <div className="pt-4">
        {state.currentScreen === 'entry' && (
          <ProblemEntry onSubmit={handleProblemEntry} />
        )}
        {state.currentScreen === 'diagnosis' && (
          <SocraticChat 
            messages={state.messages}
            onSendMessage={handleDiagnosisMessage}
            quickOptions={getQuickOptions(state)}
          />
        )}
        {state.currentScreen === 'practice' && (
          <PracticeProblem 
            problem={state.currentProblem}
            onSubmit={handlePracticeSubmit}
          />
        )}
        {state.currentScreen === 'mastered' && (
          <SkillMastered 
            skill={state.currentSkill}
            onReturn={handleReturnToParent}
            onPracticeMore={handlePracticeMore}
          />
        )}
      </div>
    </div>
  );
};

export default TutoringApp;
