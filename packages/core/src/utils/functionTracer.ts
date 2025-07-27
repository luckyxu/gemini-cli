/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Function call tracer utility for debugging the complete call chain
 */
export class FunctionTracer {
  private static instance: FunctionTracer;
  private enabled = false;
  private callStack: string[] = [];
  private depth = 0;

  private constructor() {
    // Enable tracing if DEBUG environment variable is set or explicitly enabled
    this.enabled = process.env.DEBUG === '1' || process.env.GEMINI_TRACE_FUNCTIONS === '1';
  }

  static getInstance(): FunctionTracer {
    if (!FunctionTracer.instance) {
      FunctionTracer.instance = new FunctionTracer();
    }
    return FunctionTracer.instance;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  private getIndent(): string {
    return '  '.repeat(this.depth);
  }

  private formatTimestamp(): string {
    return new Date().toISOString().slice(11, 23); // HH:MM:SS.sss
  }

  /**
   * Log function entry
   */
  enter(functionName: string, className?: string, args?: unknown[]): void {
    if (!this.enabled) return;

    const fullName = className ? `${className}.${functionName}` : functionName;
    let argsStr = '';
    
    if (args) {
      const formattedArgs = args.map(arg => {
        if (typeof arg === 'string' && arg.length > 200) {
          return `"${arg.slice(0, 100)}..." (${arg.length} chars)`;
        } else if (typeof arg === 'object' && arg !== null) {
          const objStr = JSON.stringify(arg);
          return objStr.length > 200 ? `${objStr.slice(0, 100)}...` : objStr;
        } else {
          return String(arg);
        }
      });
      argsStr = ` (${formattedArgs.join(', ')})`;
    }
    
    console.debug(`[${this.formatTimestamp()}] ${this.getIndent()}→ ${fullName}${argsStr}`);
    
    this.callStack.push(fullName);
    this.depth++;
  }

  /**
   * Log function exit
   */
  exit(functionName: string, className?: string, result?: unknown): void {
    if (!this.enabled) return;

    this.depth = Math.max(0, this.depth - 1);
    const fullName = className ? `${className}.${functionName}` : functionName;
    const resultStr = result !== undefined ? ` → ${typeof result === 'object' ? JSON.stringify(result).slice(0, 100) : String(result)}` : '';
    
    console.debug(`[${this.formatTimestamp()}] ${this.getIndent()}← ${fullName}${resultStr}`);
    
    this.callStack.pop();
  }

  /**
   * Log function error
   */
  error(functionName: string, className: string | undefined, error: unknown): void {
    if (!this.enabled) return;

    const fullName = className ? `${className}.${functionName}` : functionName;
    const errorStr = error instanceof Error ? error.message : String(error);
    
    console.debug(`[${this.formatTimestamp()}] ${this.getIndent()}✗ ${fullName} ERROR: ${errorStr}`);
  }

  /**
   * Log a custom message with current call stack context
   */
  log(message: string, data?: unknown): void {
    if (!this.enabled) return;

    let dataStr = '';
    if (data !== undefined) {
      if (typeof data === 'string' && data.length > 200) {
        dataStr = ` | "${data.slice(0, 100)}..." (${data.length} chars)`;
      } else if (typeof data === 'object' && data !== null) {
        const objStr = JSON.stringify(data);
        dataStr = ` | ${objStr.length > 200 ? `${objStr.slice(0, 100)}...` : objStr}`;
      } else {
        dataStr = ` | ${String(data)}`;
      }
    }
    console.debug(`[${this.formatTimestamp()}] ${this.getIndent()}• ${message}${dataStr}`);
  }

  /**
   * Log user prompt with special formatting
   */
  logPrompt(prompt: string, metadata?: Record<string, unknown>): void {
    if (!this.enabled) return;

    const truncatedPrompt = prompt.length > 100 ? `${prompt.slice(0, 100)}...` : prompt;
    const metaStr = metadata ? ` | ${JSON.stringify(metadata)}` : '';
    console.debug(`[${this.formatTimestamp()}] ${this.getIndent()}🎯 USER_PROMPT: "${truncatedPrompt}" (${prompt.length} chars)${metaStr}`);
  }

  /**
   * Log API response with special formatting
   */
  logResponse(response: string, metadata?: Record<string, unknown>): void {
    if (!this.enabled) return;

    const truncatedResponse = response.length > 200 ? `${response.slice(0, 200)}...` : response;
    const metaStr = metadata ? ` | ${JSON.stringify(metadata)}` : '';
    console.debug(`[${this.formatTimestamp()}] ${this.getIndent()}📤 API_RESPONSE: "${truncatedResponse}" (${response.length} chars)${metaStr}`);
  }

  /**
   * Log the complete prompt sent to LLM with green color
   */
  logLLMPrompt(prompt: unknown, metadata?: Record<string, unknown>): void {
    if (!this.enabled) return;

    // Format the prompt for display
    let promptStr: string;
    if (typeof prompt === 'string') {
      promptStr = prompt;
    } else if (Array.isArray(prompt)) {
      promptStr = prompt.map(part => {
        if (typeof part === 'string') return part;
        if (part && typeof part === 'object' && 'text' in part) return part.text;
        return JSON.stringify(part);
      }).join(' ');
    } else if (prompt && typeof prompt === 'object') {
      promptStr = JSON.stringify(prompt, null, 2);
    } else {
      promptStr = String(prompt);
    }

    const metaStr = metadata ? ` | ${JSON.stringify(metadata)}` : '';
    
    // Green color: \x1b[32m for text, \x1b[0m to reset
    console.debug(`[${this.formatTimestamp()}] ${this.getIndent()}\x1b[32m🚀 LLM_PROMPT:\x1b[0m`);
    console.debug(`\x1b[32m${promptStr}\x1b[0m`);
    console.debug(`[${this.formatTimestamp()}] ${this.getIndent()}\x1b[32m📏 PROMPT_LENGTH: ${promptStr.length} chars${metaStr}\x1b[0m`);
  }

  /**
   * Get current call stack
   */
  getCallStack(): string[] {
    return [...this.callStack];
  }
}

/**
 * Decorator to automatically trace function calls
 */
export function trace(target: any, propertyName?: string, descriptor?: PropertyDescriptor): any {
  // Handle both decorator patterns: @trace and function decorators
  if (typeof target === 'function' && !propertyName && !descriptor) {
    // Direct function decoration (for exported functions)
    const originalFunction = target;
    const tracer = FunctionTracer.getInstance();
    
    return function (this: any, ...args: any[]) {
      const functionName = originalFunction.name || 'anonymous';
      tracer.enter(functionName, undefined, args);

      try {
        const result = originalFunction.apply(this, args);
        
        // Handle async functions
        if (result instanceof Promise) {
          return result
            .then((res) => {
              tracer.exit(functionName, undefined, res);
              return res;
            })
            .catch((error) => {
              tracer.error(functionName, undefined, error);
              throw error;
            });
        } else {
          tracer.exit(functionName, undefined, result);
          return result;
        }
      } catch (error) {
        tracer.error(functionName, undefined, error);
        throw error;
      }
    };
  }

  // Method decorator pattern
  if (propertyName && descriptor) {
    const originalMethod = descriptor.value;
    const tracer = FunctionTracer.getInstance();

    descriptor.value = function (...args: any[]) {
      const className = target.constructor?.name || 'Unknown';
      tracer.enter(propertyName, className, args);

      try {
        const result = originalMethod.apply(this, args);
        
        // Handle async functions
        if (result instanceof Promise) {
          return result
            .then((res) => {
              tracer.exit(propertyName, className, res);
              return res;
            })
            .catch((error) => {
              tracer.error(propertyName, className, error);
              throw error;
            });
        } else {
          tracer.exit(propertyName, className, result);
          return result;
        }
      } catch (error) {
        tracer.error(propertyName, className, error);
        throw error;
      }
    };

    return descriptor;
  }

  throw new Error('Invalid decorator usage');
}

// Export singleton instance
export const functionTracer = FunctionTracer.getInstance();