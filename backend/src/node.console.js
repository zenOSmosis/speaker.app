import path from "path";
import dayjs from "dayjs";

// TODO: Use global PhantomLogger instead
// TODO: Apply yellow coloring for warnings; red for errors

/**
 * Node.js console debugger.
 *
 * Provides support for additional log method with line number support.
 *
 * NOTE: This may be replaced w/ something else.  It is here to make it easier
 * to debug.
 *
 * @see https://stackoverflow.com/questions/45395369/how-to-get-console-log-line-numbers-shown-in-nodejs/60305881#60305881
 */
["debug", "log", "warn", "error"].forEach(methodName => {
  // NOTE: This is not portable across projects; This number is not typical for
  // Node.js' process.env, and is derived from Speaker.app's backend
  // index.post-esm.js script
  const { CPU_NO } = process.env;

  const originalLoggingMethod = console[methodName];
  console[methodName] = (firstArgument, ...otherArguments) => {
    const originalPrepareStackTrace = Error.prepareStackTrace;
    Error.prepareStackTrace = (_, stack) => stack;
    const callee = new Error().stack[1];
    Error.prepareStackTrace = originalPrepareStackTrace;
    const relativeFileName = path.relative(process.cwd(), callee.getFileName());

    const prefix = `${dayjs().format()}:${
      CPU_NO !== undefined ? `CPU(${CPU_NO}):` : ``
    }${relativeFileName}:${callee.getLineNumber()}:`;

    if (typeof firstArgument === "string") {
      originalLoggingMethod(prefix + " " + firstArgument, ...otherArguments);
    } else {
      originalLoggingMethod(prefix, firstArgument, ...otherArguments);
    }
  };
});

console.debug("Initialized console override debugger");
