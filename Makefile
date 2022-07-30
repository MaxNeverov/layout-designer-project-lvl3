install:
	npm install

lint:
	npx stylelint ./dist/css/*.css
	npx stylelint ./src/scss/**/*.scss
	npx htmlhint ./dist/*.html

deploy:
	npx surge ./dist/
