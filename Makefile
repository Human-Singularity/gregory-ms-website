upgrade:
	git submodule update --remote
	git add gregory
	git commit -m "update submodules"
	git push
	ssh gregory@House 'cd /home/gregory/gregory-ms-website && git pull && git submodule update && docker restart gregory'

deploy:
	git push
	ssh gregory@House 'cd /home/gregory/gregory-ms-website && git pull && ./build.py --fast'