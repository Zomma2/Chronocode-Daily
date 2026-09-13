import React, { useState } from 'react';

export default function CodeBitsDaily() {
  const [track, setTrack] = useState('python');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);

  // Mock Data for demonstration
  const questionData = {
    python: {
      question: "What will be the output of the following dictionary comprehension?",
      code: "my_dict = {x: x**2 for x in (1, 2, 1, 3)}\nprint(len(my_dict))",
      options: ["2", "3", "4", "TypeError"],
      correctIndex: 1,
      explanation: "Dictionary keys must be unique. The duplicate '1' overwrites the previous value, leaving 3 unique keys (1, 2, 3).",
      tip: "Use dictionary comprehensions sparingly if the logic requires complex conditional branching, as it can severely impact readability."
    },
    node: {
      question: "In what order will the following console logs execute?",
      code: "setTimeout(() => console.log('A'), 0);\nPromise.resolve().then(() => console.log('B'));\nconsole.log('C');",
      options: ["A, B, C", "C, A, B", "C, B, A", "B, C, A"],
      correctIndex: 2,
      explanation: "Synchronous code runs first ('C'). Then microtasks (Promises) run ('B'). Finally, macrotasks (setTimeout) run ('A').",
      tip: "Always prefer native Promises or async/await over raw callbacks to avoid the 'callback hell' pyramid of doom and keep the microtask queue predictable."
    }
  };

  const currentData = questionData[track];

  const handleSelect = (index) => {
    if (hasAnswered) return;
    setSelectedIndex(index);
    setHasAnswered(true);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-zinc-700">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white tracking-tight">Chronocode Daily</h1>
          
          {/* Track Toggle */}
          <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
            <button
              onClick={() => !hasAnswered && setTrack('python')}
              disabled={hasAnswered}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                track === 'python' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'
              } ${hasAnswered ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Python
            </button>
            <button
              onClick={() => !hasAnswered && setTrack('node')}
              disabled={hasAnswered}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                track === 'node' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'
              } ${hasAnswered ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Node.js
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Challenge Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl mb-8">
          <div className="p-6 md:p-8">
            <h2 className="text-lg md:text-xl font-medium text-zinc-100 mb-6">
              {currentData.question}
            </h2>
            
            {/* Code Block */}
            <div className="bg-zinc-950 rounded-lg p-4 mb-8 overflow-x-auto border border-zinc-800/50">
              <pre className="font-mono text-sm text-zinc-300 leading-relaxed">
                <code>{currentData.code}</code>
              </pre>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentData.options.map((option, index) => {
                const isSelected = selectedIndex === index;
                const isCorrect = index === currentData.correctIndex;
                
                let buttonStyle = "bg-zinc-950 border-zinc-800 hover:border-zinc-600 text-zinc-300";
                
                if (hasAnswered) {
                  if (isCorrect) {
                    buttonStyle = "bg-emerald-950/30 border-emerald-500 text-emerald-400";
                  } else if (isSelected && !isCorrect) {
                    buttonStyle = "bg-rose-950/30 border-rose-500 text-rose-400";
                  } else {
                    buttonStyle = "bg-zinc-950 border-zinc-800 opacity-50";
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleSelect(index)}
                    disabled={hasAnswered}
                    className={`w-full text-left px-5 py-4 rounded-lg border transition-all font-mono text-sm ${buttonStyle} ${!hasAnswered && 'hover:bg-zinc-900 cursor-pointer'}`}
                  >
                    <span className="mr-4 text-zinc-500">{['A', 'B', 'C', 'D'][index]}</span>
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Feedback & Tip Panel (Revealed after answering) */}
        {hasAnswered && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            
            {/* Explanation */}
            <div className={`p-5 rounded-lg border ${selectedIndex === currentData.correctIndex ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-rose-950/20 border-rose-900/50'}`}>
              <h3 className={`font-semibold mb-2 ${selectedIndex === currentData.correctIndex ? 'text-emerald-400' : 'text-rose-400'}`}>
                {selectedIndex === currentData.correctIndex ? 'Correct!' : 'Incorrect.'}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {currentData.explanation}
              </p>
            </div>

            {/* Info for Today */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex-1">
                <h3 className="text-sm font-bold tracking-wider text-zinc-500 uppercase mb-3">Info For Today</h3>
                <p className="text-zinc-200 text-sm leading-relaxed">
                  {currentData.tip}
                </p>
              </div>
              <div className="md:w-32 flex flex-col justify-center items-center p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                <span className="text-xs text-zinc-500 mb-1">Next Question</span>
                <span className="text-lg font-mono font-medium text-zinc-300">14:23:05</span>
              </div>
            </div>
            
          </div>
        )}
      </main>
    </div>
  );
}