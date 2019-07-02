/* eslint-env mocha */
"use strict";

const fs = require("fs");
const assert = require("proclaim");
const yaml = require("yamlparser");
const _ = require('lodash');
const uaParser = require('../lib/ua_parser');

const filePath = require.resolve("../uap-core/regexes.yaml");

const refImpl = require("../uap-ref-impl")(readYAML(filePath));

function readYAML(fileName) {
	const data = fs.readFileSync(fileName, "utf8");
	return yaml.eval(data);
}

function msg(name, actual, expected) {
	return "Expected " + name + " to be " + JSON.stringify(expected) + " got " + JSON.stringify(actual) + " instead.";
}

function fixFixture(f, props) {
	// A bug in the YAML parser makes empty fixture props
	// return a vanila object.
	props.forEach(function (p) {
		if (typeof f[p] === "object") {
			f[p] = '';
		}
	});
	return f;
}

const fixtures = _.uniqBy([
		require.resolve("./user_agent_strings.yaml"),
		require.resolve("../uap-core/test_resources/firefox_user_agent_strings.yaml"),
		require.resolve("../uap-core/tests/test_ua.yaml"),
		require.resolve("../uap-core/test_resources/pgts_browser_list.yaml"),
		require.resolve("../uap-core/test_resources/opera_mini_user_agent_strings.yaml"),
		require.resolve("../uap-core/test_resources/podcasting_user_agent_strings.yaml")
	]
	.reduce((acc, filename) => acc.concat(readYAML(filename).test_cases), [])
	.map(f => fixFixture(f, ["major", "minor", "patch"])), 'user_agent_string');

describe("useragent-parser should pass tests from the ua-parser/uap-core project", function () {
	this.timeout(30000);
	fixtures.forEach(function (f) {
		it(`parses ${f.user_agent_string} correctly`, function () {
			const results = uaParser(f.user_agent_string);
			assert.strictEqual(results.family, f.family, msg("results.family", results.family, f.family));
			assert.strictEqual(results.major || '' , f.major, msg("results.major", results.major || '', f.major));
			assert.strictEqual(results.minor || '', f.minor, msg("results.minor", results.minor || '', f.minor));
			assert.equal(results.patch || '', f.patch || '', msg("results.patch", results.patch || '', f.patch || ''));
		});
	});
});