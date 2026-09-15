import React, { useState, useRef, useEffect } from 'react';

export default function LiveJsRunner({ code }) {
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState([]);
  const workerRef = useRef(null);
  const timeoutRef = useRef(null);

  const startWorker = () => {
    if (workerRef.current) {
      workerRef.current.terminate();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const workerCode = `
      self.onmessage = async function(e) {
        const { code } = e.data;
        
        // Mock Node.js globals for common snippets
        const __filename = 'index.js';
        const __dirname = '/usr/src/app';
        const module = { exports: {} };
        const exports = module.exports;
        
        // Track async operations to know when to finish
        const pendingTimers = new Set();
        let evalDone = false;
        
        function checkDone() {
          if (evalDone && pendingTimers.size === 0) {
            self.postMessage({ type: 'done' });
          }
        }

        const origSetTimeout = setTimeout;
        self.setTimeout = (cb, ms, ...args) => {
          const id = origSetTimeout((...a) => {
            try { cb(...a); } catch(err) { self.postMessage({ type: 'stderr', text: err.toString() }); }
            pendingTimers.delete(id);
            checkDone();
          }, ms, ...args);
          pendingTimers.add(id);
          return id;
        };
        
        self.setImmediate = (cb, ...args) => self.setTimeout(cb, 0, ...args);
        
        self.require = (mod) => {
          if (mod === 'fs') {
            return {
              readFile: (path, cb) => self.setTimeout(() => cb(null, Buffer.from('mock data')), 10)
            };
          }
          if (mod === './a') {
            if (!self._module_a) {
               let count = 0;
               self._module_a = { increment: () => ++count };
            }
            return self._module_a;
          }
          return {};
        };
        
        self.Buffer = {
          from: (str) => ({ toString: () => str })
        };

        const originalLog = console.log;
        const originalError = console.error;
        
        console.log = function(...args) {
          const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
          self.postMessage({ type: 'stdout', text: msg });
        };
        
        console.error = function(...args) {
          const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
          self.postMessage({ type: 'stderr', text: msg });
        };

        try {
          // Use Function to evaluate in global scope but with injected vars
          const fn = new Function('require', 'module', 'exports', '__filename', '__dirname', 'setImmediate', code);
          const result = fn(self.require, module, exports, __filename, __dirname, self.setImmediate);
          
          if (result instanceof Promise) {
             await result;
          } else if (result !== undefined) {
             self.postMessage({ type: 'stdout', text: String(result) });
          }
        } catch (err) {
          self.postMessage({ type: 'stderr', text: err.toString() });
        } finally {
          evalDone = true;
          checkDone();
        }
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);

    worker.onmessage = (e) => {
      const { type, text } = e.data;
      if (type === 'done') {
        cleanup();
      } else {
        setOutput((prev) => [...prev, { type, text }]);
      }
    };

    worker.onerror = (e) => {
      setOutput((prev) => [...prev, { type: 'stderr', text: e.message || 'Worker error' }]);
      cleanup();
    };

    workerRef.current = worker;
    
    // Set 3000ms timeout
    timeoutRef.current = setTimeout(() => {
      if (workerRef.current) {
        setOutput((prev) => [...prev, { type: 'stderr', text: 'Error: Execution timed out (3000ms limit)' }]);
        cleanup();
      }
    }, 3000);

    worker.postMessage({ code });
  };

  const cleanup = () => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsRunning(false);
  };

  const handleRunCode = () => {
    if (isRunning) return;
    setIsRunning(true);
    setOutput([]);
    startWorker();
  };

  useEffect(() => {
    return () => cleanup();
  }, []);


  return (
    <div className="mt-4 mb-8">
      <div className="flex flex-col gap-3">
        <div>
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? 'Executing...' : 'Run JavaScript'}
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
