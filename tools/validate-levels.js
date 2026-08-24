/* Runs the shared checker in js/validate.js over the built-in campaign. */
const { validateLevel } = require("../js/validate.js");
const { LEVELS } = require("../js/levels.js");

let bad = 0;
LEVELS.forEach((level, i) => {
  const { ok, problems, info } = validateLevel(level);
  const label = `#${i + 1} ${level.name}`;
  const summary = info.width
    ? `${info.width}x${info.height}  hardware ${info.hardware}  software ${info.software}  decoys ${info.decoys}  kit [${info.kit}]`
    : "";
  if (ok) {
    console.log(`ok   ${label}  ${summary}`);
  } else {
    bad++;
    console.log(`FAIL ${label}  ${summary}`);
    problems.forEach(p => console.log(`      - ${p}`));
  }
});
console.log(bad ? `\n${bad} level(s) need attention` : `\nall ${LEVELS.length} levels look sane`);
process.exit(bad ? 1 : 0);
