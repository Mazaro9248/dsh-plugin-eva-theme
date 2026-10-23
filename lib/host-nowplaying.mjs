/**
 * macOS 系统媒体桥的纯函数；固定 JXA 脚本读取当前媒体会话（包括网易云、浏览器）。
 * 系统桥不可用时回退到 Apple Music / Spotify 的固定 AppleScript。
 * 来源 id 只作为独立参数匹配，控制动作使用白名单；不拼接外部脚本。
 * 路由沿用本机同源校验，无曲目或不支持的平台返回空状态。
 */

export const NOWPLAYING_PATH = "/dsh-eva-magi/nowplaying.json";
export const CONTROL_PATH = "/dsh-eva-magi/nowplaying";
export const NP_CACHE_MS = 1500;

/** 系统桥只接收固定动作；来源 id 仅作匹配，不拼接到脚本中。 */
export function systemControlArgs(action, bundleId) {
	if (typeof action !== "string" || !Object.hasOwn(CONTROL_SCRIPTS, action)) return null;
	if (typeof bundleId !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,255}$/.test(bundleId)) return null;
	return [action, bundleId];
}

/** 只接受系统桥的明确状态，不把异常输出解释成正在播放。 */
export function parseSystemNowPlaying(raw) {
	try {
		const data = JSON.parse(raw);
		if (data?.ok !== true) return null;
		if (!data.app || typeof data.title !== "string" || !data.title) return { app: null, playing: false, state: "", source: "system" };
		if (typeof data.app !== "string" || !systemControlArgs("playpause", data.bundleId)) return null;
		const num = (v) => typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : 0;
		return { source: "system", app: data.app.slice(0, 200), bundleId: data.bundleId,
			playing: data.playing === true, state: data.playing === true ? "playing" : "paused",
			title: data.title.slice(0, 1000), artist: typeof data.artist === "string" ? data.artist.slice(0, 1000) : "",
			album: typeof data.album === "string" ? data.album.slice(0, 1000) : "", duration: num(data.duration), position: num(data.position) };
	} catch { return null; }
}

/** 支持的平台白名单。控制动作只允许这些名字，绝不接受外部传入的任意 app 名。 */
export const NP_APPS = ["Music", "Spotify"];

/**
 * 只读脚本：优先正在播放的应用，其次暂停的应用；都没有就返回空串。
 * 输出用制表符分隔，便于 parseNowPlaying 解析。
 */
export const READ_SCRIPT = [
	'set out to ""',
	...NP_APPS.flatMap((app) => [
		'try',
		`if application "${app}" is running then`,
		`  tell application "${app}"`,
		'    if player state is not stopped then',
		'      set t to current track',
		`      set rowText to "${app}" & tab & (player state as text) & tab & (name of t) & tab & (artist of t) & tab & (album of t) & tab & (${app === "Spotify" ? "((duration of t) / 1000)" : "(duration of t)"} as text) & tab & ((player position) as text)`,
		'      if player state is playing then return rowText',
		'      if out is "" then set out to rowText',
		'    end if',
		'  end tell',
		'end if',
		'end try',
	]),
	'return out',
].join("\n");

/** 控制动作白名单 → AppleScript 模板（%APP% 只会被白名单里的名字替换）。 */
export const CONTROL_SCRIPTS = {
	playpause: 'tell application "%APP%" to playpause',
	next: 'tell application "%APP%" to next track',
	previous: 'tell application "%APP%" to previous track',
};

/**
 * 生成控制脚本。app 必须在白名单里、action 必须在白名单里，否则返回 null ——
 * 调用方据此拒绝请求，而不是把外部字符串拼进脚本。
 *
 * @param app - 播放器名（只允许 NP_APPS 里的值）。
 * @param action - 动作名（只允许 CONTROL_SCRIPTS 的键）。
 */
export function controlScript(app, action) {
	if (!NP_APPS.includes(app)) return null;
	if (typeof action !== "string" || !Object.hasOwn(CONTROL_SCRIPTS, action)) return null;
	const template = CONTROL_SCRIPTS[action];
	if (!template) return null;
	return template.replace("%APP%", app);
}

/**
 * 解析 osascript 的输出。空串表示「没有支持的播放器在放」。
 *
 * @param raw - osascript 的 stdout。
 */
export function parseNowPlaying(raw) {
	const text = String(raw === undefined || raw === null ? "" : raw).trim();
	if (!text) return { app: null, playing: false, state: "" };
	const parts = text.split("\t");
	const num = (value) => {
		const n = Number(value);
		return Number.isFinite(n) && n >= 0 ? n : 0;
	};
	const state = parts[1] || "";
	return {
		app: parts[0] || null,
		state,
		playing: /playing/i.test(state),
		title: parts[2] || "",
		artist: parts[3] || "",
		album: parts[4] || "",
		duration: num(parts[5]),
		position: num(parts[6]),
	};
}
