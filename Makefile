export PATH := $(CURDIR)/node_modules/.bin:$(PATH)

.PHONY: test
test:
	mocha --reporter dot --bail
