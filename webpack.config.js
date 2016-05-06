module.exports = {
	entry: "./src/entry",
    output: {
        path: __dirname + "/dist",
        filename: "mgsc.js"
    },
    module: {
    	noParse:[/build\/libmgsc\.js$/]
    }
};
