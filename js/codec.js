/* ============================================================================
   BIT BUILDER — share codes
   A custom level travels in the URL: index.html#lvl=<code>. The code is just
   the level object as JSON in URL-safe base64, so it needs no server and can
   be pasted into a chat message.
   ========================================================================== */

const Codec = {
  /* Only the fields that describe a level — anything else is dropped. */
  clean(level) {
    const out = {
      name: String(level.name || "Custom level").slice(0, 60),
      hint: String(level.hint || "").slice(0, 240),
      time: Math.max(10, Math.min(3600, Math.round(level.time) || 120)),
      map: level.map.map(String)
    };
    if (level.kinds) {
      out.kinds = {};
      for (const ch of "cszx") if (level.kinds[ch] && level.kinds[ch].length) out.kinds[ch] = level.kinds[ch].slice();
    }
    if (level.par) out.par = level.par;
    return out;
  },

  encode(level) {
    const json = JSON.stringify(Codec.clean(level));
    const b64 = typeof btoa === "function"
      ? btoa(unescape(encodeURIComponent(json)))
      : Buffer.from(json, "utf8").toString("base64");
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  },

  decode(code) {
    const b64 = code.replace(/-/g, "+").replace(/_/g, "/");
    const json = typeof atob === "function"
      ? decodeURIComponent(escape(atob(b64)))
      : Buffer.from(b64, "base64").toString("utf8");
    const level = JSON.parse(json);
    if (!Array.isArray(level.map) || !level.map.length) throw new Error("no map in this code");
    const w = level.map[0].length;
    if (level.map.some(r => typeof r !== "string" || r.length !== w)) throw new Error("map rows are ragged");
    return Codec.clean(level);
  },

  link(level, base) {
    const url = base || (typeof location !== "undefined" ? location.href.split("#")[0] : "");
    return `${url}#lvl=${Codec.encode(level)}`;
  }
};

if (typeof module !== "undefined") { module.exports = { Codec }; }
