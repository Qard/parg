.PHONY: clean

clean:
	@rm -rf docs

docs:
	@docco index.js