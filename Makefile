# Gregory MS Website D	@e	@echo "  🚀 Deployment Pipelines:"
# @echo "    deploy-backend     - Backend: submodule → push → pull → restart container"
# @echo " 		echo "🔍 Debug: 		fi; \
		echo "🔍 Debug: Ab		ec		fi; \
		echo "� Debug: About to drop/create with POSTGRES_USER=$$POSTGRES_USER, POSTGRES_DB=$$POSTGRES_DB"; \
		if [ -z "$$POSTGRES_USER" ] || [ -z "$$POSTGRES_DB" ]; then \
			echo "❌ Error: POSTGRES_USER or POSTGRES_DB is empty!"; \
			echo "   POSTGRES_USER='$$POSTGRES_USER'"; \
			echo "   POSTGRES_DB='$$POSTGRES_DB'"; \
			exit 1; \
		fi; \
		echo "�🗑️  Step 2/3: Dropping local development database..." && \
		echo "🔍 Command: docker exec db dropdb -U $$POSTGRES_USER --if-exists $$POSTGRES_DB" && \
		docker exec db dropdb -U $$POSTGRES_USER --if-exists $$POSTGRES_DB && \
		echo "🔍 Command: docker exec db createdb -U $$POSTGRES_USER $$POSTGRES_DB" && \
		docker exec db createdb -U $$POSTGRES_USER $$POSTGRES_DB && \
		echo "✅ Local database recreated" && \
		echo "📥 Step 3/3: Importing production data to local database..." && \
		echo "🔍 Command: docker exec -i db psql -U $$POSTGRES_USER -d $$POSTGRES_DB < /tmp/gregory_prod_dump.sql" && \
		docker exec -i db psql -U $$POSTGRES_USER -d $$POSTGRES_DB < /tmp/gregory_prod_dump.sql && \
		echo "🧹 Cleaning up temporary dump file..." && \
		rm /tmp/gregory_prod_dump.sql && \
		echo "✅ Database sync complete!"; \: Dropping local development database..." && \
		set -x && \
		docker exec db dropdb -U $$POSTGRES_USER --if-exists $$POSTGRES_DB && \
		docker exec db createdb -U $$POSTGRES_USER $$POSTGRES_DB && \
		set +x && \
		echo "✅ Local database recreated" && \
		echo "📥 Step 3/3: Importing production data to local database..." && \
		set -x && \
		docker exec -i db psql -U $$POSTGRES_USER -d $$POSTGRES_DB < /tmp/gregory_prod_dump.sql && \
		set +x && \
		echo "🧹 Cleaning up temporary dump file..." && \
		rm /tmp/gregory_prod_dump.sql && \
		echo "✅ Database sync complete!"; \op/create with POSTGRES_USER=$$POSTGRES_USER, POSTGRES_DB=$$POSTGRES_DB"; \
		if [ -z "$$POSTGRES_USER" ] || [ -z "$$POSTGRES_DB" ]; then \
			echo "❌ Error: POSTGRES_USER or POSTGRES_DB is empty!"; \
			echo "   POSTGRES_USER='$$POSTGRES_USER'"; \
			echo "   POSTGRES_DB='$$POSTGRES_DB'"; \
			exit 1; \
		fi; \
		echo "🗑️  Step 2/3: Dropping local development database..." && \
		set -x && \
		docker exec db dropdb -U $$POSTGRES_USER --if-exists $$POSTGRES_DB && \
		docker exec db createdb -U $$POSTGRES_USER $$POSTGRES_DB && \
		set +x && \
		echo "✅ Local database recreated" && \
		echo "📥 Step 3/3: Importing production data to local database..." && \
		set -x && \
		docker exec -i db psql -U $$POSTGRES_USER -d $$POSTGRES_DB < /tmp/gregory_prod_dump.sql && \
		set +x && \
		echo "🧹 Cleaning up temporary dump file..." && \
		rm /tmp/gregory_prod_dump.sql && \
		echo "✅ Database sync complete!"; \ate with POSTGRES_USER=$$POSTGRES_USER, POSTGRES_DB=$$POSTGRES_DB"; \
		if [ -z "$$POSTGRES_USER" ] || [ -z "$$POSTGRES_DB" ]; then \
			echo "❌ Error: POSTGRES_USER or POSTGRES_DB is empty!"; \
			echo "   POSTGRES_USER='$$POSTGRES_USER'"; \
			echo "   POSTGRES_DB='$$POSTGRES_DB'"; \
			exit 1; \
		fi; \
		echo "🗑️  Step 2/3: Dropping local development database..." && \
		set -x && \
		docker exec db dropdb -U $$POSTGRES_USER --if-exists $$POSTGRES_DB && \
		docker exec db createdb -U $$POSTGRES_USER $$POSTGRES_DB && \
		set +x && \
		echo "✅ Local database recreated" && \
		echo "📥 Step 3/3: Importing production data to local database..." && \
		set -x && \
		docker exec -i db psql -U $$POSTGRES_USER -d $$POSTGRES_DB < /tmp/gregory_prod_dump.sql && \
		set +x && \
		echo "🧹 Cleaning up temporary dump file..." && \
		rm /tmp/gregory_prod_dump.sql && \
		echo "✅ Database sync complete!"; \nd    - Frontend: submodule → push → pull → build assets"
# @echo "    deploy-full        - Complete: backend + dependencies + migrations"oyment Pipeline
# =====================================
# Incremental deployment targets from basic to full deployment

.PHONY: help submodule-update local-push remote-pull remote-deps remote-migrate remote-restart \
        deploy-backend deploy-frontend deploy-full build status sync-db

# Default target - show help
help:
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "🚀 Gregory MS Website Deployment Pipeline"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "🔄 Available Targets:"
	@echo "  🔧 Basic Operations:"
	@echo "    submodule-update    - Update and commit submodules"
	@echo "    local-push         - Push local changes to GitHub"
	@echo "    remote-pull        - Pull changes on remote server"
	@echo "    remote-deps        - Install dependencies on remote"
	@echo "    remote-migrate     - Run database migrations on remote"
	@echo "    remote-restart     - Restart application container"
	@echo ""
	@echo "  🚀 Deployment Pipelines:"
	@echo "    deploy-backend     - Backend: submodule → push → pull → deps → migrate → restart"
	@echo "    deploy-frontend    - Frontend: submodule → push → pull → build assets"
	@echo "    deploy-full        - Complete: backend + dependencies + migrations"
	@echo ""
	@echo "  🔨 Utilities:"
	@echo "    build             - Run build script on remote"
	@echo "    status            - Check application status"
	@echo "    sync-db           - Sync development database from production"
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Step 1: Update submodules locally
submodule-update:
	@echo "🔄 [1/7] Updating submodules..."
	@git submodule update --remote
	@if git diff --quiet gregory; then \
		echo "✅ No submodule changes to commit"; \
	else \
		echo "📝 Committing submodule changes..."; \
		git add gregory && \
		git commit -m "update submodules" && \
		echo "✅ Submodule update complete!"; \
	fi

# Step 2: Push local changes to GitHub
local-push:
	@echo "🔄 [2/7] Pushing local changes to GitHub..."
	@git push
	@echo "✅ Local changes pushed successfully"

# Step 3: Pull changes on remote server
remote-pull:
	@echo "🔄 [3/7] Pulling changes on remote server..."
	@ssh gregory@House 'cd /home/gregory/gregory-ms-website && \
		echo "🔄 Pulling from GitHub..." && \
		git pull --no-edit && \
		echo "🔄 Updating submodules..." && \
		git submodule update && \
		echo "✅ Remote repository updated"'

# Step 4: Install dependencies on remote
remote-deps:
	@echo "📦 [4/7] Installing dependencies on remote..."
	@ssh gregory@House 'cd /home/gregory/gregory-ms-website && \
		echo "📦 Installing Python requirements..." && \
		docker exec gregory pip install -q -r requirements.txt && \
		echo "✅ Dependencies installed"'

# Step 5: Run database migrations on remote
remote-migrate:
	@echo "🔄️  [5/7] Running database migrations..."
	@ssh gregory@House 'cd /home/gregory/gregory-ms-website && \
		echo "🗃️  Applying database migrations..." && \
		docker exec gregory python manage.py migrate && \
		echo "✅ Database migrations complete"'

# Step 6: Restart application container
remote-restart:
	@echo "🔄 [6/7] Restarting application..."
	@ssh gregory@House 'echo "🔄 Restarting application container..." && \
		docker restart gregory && \
		echo "✅ Container restarted successfully"'

# Backend deployment pipeline (for application code changes)
deploy-backend: submodule-update local-push remote-pull remote-deps remote-migrate remote-restart
	@echo ""
	@echo "🎉 Backend deployment completed successfully!"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Frontend deployment pipeline (for static assets and frontend changes)
deploy-frontend: submodule-update local-push remote-pull build
	@echo ""
	@echo "🎉 Frontend deployment completed successfully!"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Full deployment pipeline (for major updates with dependencies and migrations)
deploy-full: submodule-update local-push remote-pull remote-deps remote-migrate remote-restart build
	@echo ""
	@echo "🎉 Full deployment completed successfully!"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Build application on remote
build:
	@echo "🔨 Building application on remote..."
	@ssh gregory@House 'cd /home/gregory/gregory-ms-website && \
		echo "🔧 Running build script..." && \
		./build.py --fast && \
		echo "✅ Build complete"'

# Check application status
status:
	@echo "📊 Checking application status..."
	@ssh gregory@House 'echo "🔍 Container status:" && \
		docker ps | grep gregory && \
		echo "" && \
		echo "🔍 Recent logs:" && \
		docker logs gregory --tail 10'

# Sync development database from production
# Usage: make sync-db [SKIP_FETCH=1]
# SKIP_FETCH=1 will skip downloading the dump and use existing /tmp/gregory_prod_dump.sql
sync-db:
	@echo "🔄 Syncing development database from production..."
	@echo "⚠️  WARNING: This will replace your local development database!"
	@read -p "Continue? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		if [ -f .env ]; then \
			echo "📂 Loading .env file from $$(pwd)"; \
			export $$(cat .env | grep -v '^#' | xargs); \
		else \
			echo "⚠️  No local .env file found, using environment variables"; \
		fi; \
		if [ "$(SKIP_FETCH)" != "1" ]; then \
			echo "📦 Step 1/3: Creating production database dump..."; \
			echo "🔍 Debug: Local POSTGRES_USER=$$POSTGRES_USER, POSTGRES_DB=$$POSTGRES_DB"; \
			ssh gregory@House 'cd /home/gregory/gregory-ms-website && set -a && source gregory/.env && set +a && echo "📍 Current directory: $$(pwd)" && echo "📍 Env loaded: POSTGRES_USER=$$POSTGRES_USER POSTGRES_DB=$$POSTGRES_DB" && docker compose exec db pg_dump -U $$POSTGRES_USER -d $$POSTGRES_DB --clean --if-exists' > /tmp/gregory_prod_dump.sql 2>&1; \
			DUMP_EXIT=$$?; \
			if [ $$DUMP_EXIT -ne 0 ]; then \
				echo "❌ Dump failed with exit code $$DUMP_EXIT"; \
				echo "📄 Last 20 lines of output:"; \
				tail -20 /tmp/gregory_prod_dump.sql; \
				exit 1; \
			fi; \
			echo "✅ Production database dumped to /tmp/gregory_prod_dump.sql"; \
		else \
			echo "⏭️  Skipping database fetch, using existing dump..."; \
			if [ ! -f /tmp/gregory_prod_dump.sql ]; then \
				echo "❌ Error: /tmp/gregory_prod_dump.sql not found!"; \
				exit 1; \
			fi; \
			echo "✅ Using existing dump at /tmp/gregory_prod_dump.sql"; \
		fi; \
		echo "� Debug: About to drop/create with POSTGRES_USER=$$POSTGRES_USER, POSTGRES_DB=$$POSTGRES_DB"; \
		if [ -z "$$POSTGRES_USER" ] || [ -z "$$POSTGRES_DB" ]; then \
			echo "❌ Error: POSTGRES_USER or POSTGRES_DB is empty!"; \
			echo "   POSTGRES_USER='$$POSTGRES_USER'"; \
			echo "   POSTGRES_DB='$$POSTGRES_DB'"; \
			exit 1; \
		fi; \
		echo "�🗑️  Step 2/3: Dropping local development database..." && \
		docker exec db dropdb -U $$POSTGRES_USER --if-exists $$POSTGRES_DB && \
		docker exec db createdb -U $$POSTGRES_USER $$POSTGRES_DB && \
		echo "✅ Local database recreated" && \
		echo "📥 Step 3/3: Importing production data to local database..." && \
		docker exec -i db psql -U $$POSTGRES_USER -d $$POSTGRES_DB < /tmp/gregory_prod_dump.sql && \
		echo "🧹 Cleaning up temporary dump file..." && \
		rm /tmp/gregory_prod_dump.sql && \
		echo "✅ Database sync complete!"; \
	else \
		echo "❌ Database sync cancelled."; \
	fi
