import React, { useState, useRef, useEffect } from 'react';

export default function LiveCodeRunner({ code }) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState([]);
  const pyodideRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    
    const initPyodide = async () => {
      if (window.loadPyodide && !pyodideRef.current) {
        try {
          const pyodide = await window.loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/",
          });
          
          pyodide.setStdout({ batched: (msg) => {
            if (isMounted) setOutput((prev) => [...prev, { type: 'stdout', text: msg }]);
          }});
          
          pyodide.setStderr({ batched: (msg) => {
            if (isMounted) setOutput((prev) => [...prev, { type: 'stderr', text: msg }]);
          }});
          
          pyodideRef.current = pyodide;
          if (isMounted) setIsInitializing(false);
        } catch (err) {
          console.error("Pyodide init failed", err);
          if (isMounted) {
            setOutput([{ type: 'stderr', text: "Failed to load runtime: " + err.message }]);
            setIsInitializing(false);
          }
        }
      }
    };

    if (window.loadPyodide) {
      initPyodide();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
      script.onload = initPyodide;
      document.body.appendChild(script);
    }
    
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRunCode = async () => {
    if (!pyodideRef.current || isRunning) return;
    
    setIsRunning(true);
    setOutput([]);

    try {
      const result = await pyodideRef.current.runPythonAsync(code);
      if (result !== undefined && result !== null) {
         // Display the return value if it didn't print anything explicitly, simulating a REPL
         setOutput((prev) => [...prev, { type: 'stdout', text: result.toString() }]);
      }
    } catch (err) {
      setOutput((prev) => [...prev, { type: 'stderr', text: err.toString() }]);
    } finally {
      setIsRunning(false);
    }
  };


  return (
    <div className="mt-4 mb-8">
      <div className="flex flex-col gap-3">
        <div>
          <button
            onClick={handleRunCode}
            disabled={isInitializing || isRunning}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isInitializing ? 'Loading Runtime...' : isRunning ? 'Executing...' : 'Run Code'}
          </button>
        </div>
        
        {output.length > 0 && (
          <div className="bg-black text-zinc-300 font-mono p-4 rounded-md border border-zinc-800 text-sm overflow-x-auto whitespace-pre-wrap">
            {output.map((log, index) => (
              <span key={index} className={log.type === 'stderr' ? 'text-red-400' : ''}>
                {log.text + '\n'}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
