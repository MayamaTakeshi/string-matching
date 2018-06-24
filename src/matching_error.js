class MatchingError extends Error {
	constructor(reason, path) {
		// Pass remaining arguments (including vendor specific ones) to parent constructor
		super(reason);

		// Maintains proper stack trace for where our error was thrown (only available on V8)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, MatchingError);
		}

		this.reason = reason;
		this.path = path;
	}
}

module.exports = MatchingError;

