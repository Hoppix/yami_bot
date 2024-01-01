compile:
	echo "Clearing build..."
	rm -rf build
	mkdir build
	echo "Copying resources..."
	cp -r resources build
	echo "Generating js from typescript files..."
	tsc

start:
	node build/src/bot.js

check:
	echo "Running mocha tests..."
	npm test
