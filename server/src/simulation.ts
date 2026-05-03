/**
 * Simulation Service
 * 
 * Handles execution of the Python blockchain simulation.
 * Uses Effect for structured error handling and logging.
 */

import { Effect, pipe } from 'effect';
import { spawn } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import { MetricsData } from './router';

// Path to Python script (relative to server directory)
const PYTHON_SCRIPT_PATH = path.join(__dirname, '../../python-sim/main.py');
const METRICS_FILE_PATH = path.join(__dirname, '../../python-sim/metrics.json');

/**
 * Effect wrapper for executing Python simulation
 */
const runPythonSimulation = (episodes: number): Effect.Effect<string, Error> => {
  return Effect.async((resume) => {
    console.log(`[Simulation] Starting Python script with ${episodes} episodes...`);
    console.log(`[Simulation] Script path: ${PYTHON_SCRIPT_PATH}`);
    
    const startTime = Date.now();
    
    const pythonProcess = spawn('python', [
      PYTHON_SCRIPT_PATH,
      '--episodes', episodes.toString(),
      '--quiet'  // Suppress Python output
    ], {
      cwd: path.dirname(PYTHON_SCRIPT_PATH)
    });
    
    let stdout = '';
    let stderr = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      
      if (code === 0) {
        console.log(`[Simulation] Completed in ${duration}s`);
        resume(Effect.succeed(stdout));
      } else {
        console.error(`[Simulation] Failed with code ${code}`);
        console.error(`[Simulation] stderr: ${stderr}`);
        resume(Effect.fail(new Error(`Python script failed: ${stderr || 'Unknown error'}`)));
      }
    });
    
    pythonProcess.on('error', (error) => {
      console.error(`[Simulation] Process error: ${error.message}`);
      resume(Effect.fail(new Error(`Failed to start Python: ${error.message}`)));
    });
  });
};

/**
 * Effect wrapper for reading metrics file
 */
const readMetricsFile = (): Effect.Effect<MetricsData, Error> => {
  return pipe(
    Effect.tryPromise(() => fs.readFile(METRICS_FILE_PATH, 'utf-8')),
    Effect.map((content) => JSON.parse(content) as MetricsData),
    Effect.tap(() => console.log('[Metrics] Successfully loaded metrics.json')),
    Effect.catchAll((error) => {
      console.error(`[Metrics] Failed to read metrics: ${error}`);
      return Effect.fail(new Error(`Failed to read metrics: ${error}`));
    })
  );
};

/**
 * Run the complete simulation pipeline
 */
export const runSimulation = async (episodes: number): Promise<MetricsData> => {
  const program = pipe(
    // Step 1: Run Python simulation
    runPythonSimulation(episodes),
    
    // Step 2: Read metrics file
    Effect.flatMap(() => readMetricsFile()),
    
    // Add logging
    Effect.tap(() => console.log(`[API] Simulation completed for ${episodes} episodes`))
  );
  
  return await Effect.runPromise(program);
};

/**
 * Get existing metrics without running simulation
 */
export const getMetrics = async (): Promise<MetricsData | null> => {
  try {
    return await Effect.runPromise(readMetricsFile());
  } catch (error) {
    console.log('[Metrics] No existing metrics found');
    return null;
  }
};
