import chalk from 'chalk';

type LogArgs = Parameters<typeof console.log>;

const icons = {
	bug: '',
	error: ' ',
	warning: ' ',
	info: ' ',
	hint: '󰌶 ',
};

export const enum LogLevel {
	Debug = 1,
	Info = 2,
	Warn = 3,
	Error = 4,
}

export function log(...args: LogArgs) {
	console.log(icons.hint, chalk.dim(...args));
}

export function info(...args: LogArgs) {
	console.debug(chalk.blue(icons.info), chalk.dim(...args));
}

export function warn(...args: LogArgs) {
	console.warn(chalk.yellow(icons.warning, ...args));
}

export function error(...args: LogArgs) {
	console.error(chalk.red(icons.error, ...args));
}

export function debug(...args: LogArgs) {
	console.debug(chalk.cyan(icons.bug), chalk.dim(...args));
}

export default class Logger {
	constructor(
		private label: string,
		private level = LogLevel.Warn,
	) {}

	setLogLevel(level: LogLevel) {
		this.level = level;
	}

	/**
	 * Whether or not to print statements for the given level
	 * @param level The level to check
	 * @returns Whether or not to print statements for the given level
	 */
	private checkLevel(level: LogLevel) {
		return level >= this.level;
	}

	log(...args: LogArgs) {
		this.checkLevel(LogLevel.Debug) && log(this.label, ...args);
	}
	debug(...args: LogArgs) {
		this.checkLevel(LogLevel.Debug) && debug(this.label, ...args);
	}
	info(...args: LogArgs) {
		this.checkLevel(LogLevel.Info) && info(this.label, ...args);
	}
	warn(...args: LogArgs) {
		this.checkLevel(LogLevel.Warn) && warn(this.label, ...args);
	}
	error(...args: LogArgs) {
		this.checkLevel(LogLevel.Error) && error(this.label, ...args);
	}
	group(label?: string) {
		if (this.checkLevel(LogLevel.Debug)) {
			label ? console.group(chalk.yellow(`${icons.hint}`), `${label}`) : console.group();
		}
	}
	groupEnd() {
		this.checkLevel(LogLevel.Debug) && console.groupEnd();
	}
}
