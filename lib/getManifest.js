const { existsSync, lstatSync, readFileSync } = require("fs");
const yaml = require('yaml');

/**
 * Read the content of target package.json if exists.
 *
 * @param {string} path file path
 * @returns {string} file content
 *
 * @internal
 */
function readManifest(path) {
	// Check it exists.
	if (!existsSync(path)) throw new ReferenceError(`package.json file not found: "${path}"`);

	// Stat the file.
	let stat;
	try {
		stat = lstatSync(path);
	} catch (_) {
		// istanbul ignore next (hard to test — happens if no read access etc).
		throw new ReferenceError(`package.json cannot be read: "${path}"`);
	}

	// Check it's a file!
	if (!stat.isFile()) throw new ReferenceError(`package.json is not a file: "${path}"`);

	// Read the file.
	try {
		return readFileSync(path, "utf8");
	} catch (_) {
		// istanbul ignore next (hard to test — happens if no read access etc).
		throw new ReferenceError(`package.json cannot be read: "${path}"`);
	}
}

/**
 * Get the parsed contents of a package.json manifest file.
 *
 * @param {string} path The path to the package.json manifest file.
 * @returns {object} The manifest file's contents.
 *
 * @internal
 */
function getManifest(path) {
	// Read the file.

	// Parse the file.
	let manifest;
	let contents = readManifest(path);
	try {
		manifest = JSON.parse(contents);
	} catch (_) {
		contents = readFileSync(path, 'utf8');
		manifest = yaml.parse(contents);
	}

	// Must be an object.
	if (typeof manifest !== "object") throw new SyntaxError(`package.json was not an object: "${path}"`);

	// Must have a name.
	if (typeof manifest.name !== "string" || !manifest.name.length)
		throw new SyntaxError(`Package name must be non-empty string: "${path}"`);


	// NOTE non-enumerable prop is skipped by JSON.stringify
	Object.defineProperty(manifest, "__contents__", { enumerable: false, value: contents });

	// Return contents.
	return manifest;
}

// Exports.
module.exports = getManifest;
