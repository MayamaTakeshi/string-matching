class MatchingError extends Error {
	constructor(path, reason) {
		// Pass remaining arguments (including vendor specific ones) to parent constructor
		super(reason);

		// Maintains proper stack trace for where our error was thrown (only available on V8)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, MatchingError);
		}

		this.path = path;
		this.reason = reason;
	}
}

module.exports = MatchingError;

