# based on Ryan Grove's Makefile https://gist.github.com/rgrove/1116056

# JS files that should be minified, files with a -min.js suffix will be ignored.
JS_FILES = $(filter-out %-min.js,$(wildcard src/*.js))

JS_MINIFIED = build/graphs.min.js

# target: minify - Minifies JS.
minify:
	cp ~/repos/priv/coderstats/coderstats/static/js/graphs.js src/
	yui-compressor --charset utf-8 --verbose --type js -o $(JS_MINIFIED) $(JS_FILES)

# target: clean - Removes minified CSS and JS files.
clean:
	rm -f build/*

# target: help - Displays help.
help:
	@egrep "^# target:" Makefile