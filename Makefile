.PHONY: update-submodule deploy upgrade build

update-submodule:
	git submodule update --remote
	@if git diff --quiet gregory; then \
		echo "No submodule changes to commit"; \
	else \
		git add gregory && \
		git commit -m "update submodules" && \
		git push; \
	fi

deploy: update-submodule
	ssh gregory@House 'cd /home/gregory/gregory-ms-website && git pull && git submodule update && docker exec gregory python manage.py migrate && docker exec pip install -r requirements.txt && docker restart gregory'

upgrade: update-submodule
	ssh gregory@House 'cd /home/gregory/gregory-ms-website && git pull && git submodule update && docker restart gregory'

build:
	ssh gregory@House 'cd /home/gregory/gregory-ms-website && ./build.py --fast'
