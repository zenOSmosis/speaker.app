// Console.log helper
(() => {
  const _origConsoleLog = console.log;

  console.log = function (msg, ...rest) {
    try {
      _origConsoleLog(
        JSON.stringify({
          msg,
          ...rest,
        })
      );
    } catch (err) {
      console.error(
        "Caught console.log mod error. Reverting to default console.log call.",
        err
      );

      _origConsoleLog(msg, ...rest);
    }
  };
})();
