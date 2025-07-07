# Gregory MS Website D	@e	@echo "  🚀 Deployment Pipelines:"
# @echo "    deploy-backend     - Backend: submodule → push → pull → restart container"
# @echo "    deploy-frontend    - Frontend: submodule → push → pull → build assets"
# @echo "    deploy-full        - Complete: backend + dependencies + migrations"oyment Pipeline
# =====================================
# Incremental deployment targets from basic to full deployment

.PHONY: help submodule-update local-push remote-pull remote-deps remote-migrate remote-restart \
        deploy-backend deploy-frontend deploy-full build status

# Default target - show help
help:
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo "🚀 Gregory MS Website Deployment Pipeline"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo "� Available Targets:"
	@echo "  🔧 Basic Operations:"
	@echo "    submodule-update    - Update and commit submodules"
	@echo "    local-push         - Push local changes to GitHub"
	@echo "    remote-pull        - Pull changes on remote server"
	@echo "    remote-deps        - Install dependencies on remote"
	@echo "    remote-migrate     - Run database migrations on remote"
	@echo "    remote-restart     - Restart application container"
	@echo ""
	@echo "  🚀 Deployment Pipelines:"
	@echo "    deploy-backend     - Backend: submodule → push → pull → restart container"
	@echo "    deploy-frontend    - Frontend: submodule → push → pull → build assets"
	@echo "    deploy-full        - Complete: backend + dependencies + migrations"
	@echo ""
	@echo "  🔨 Utilities:"
	@echo "    build             - Run build script on remote"
	@echo "    status            - Check application status"
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Step 1: Update submodules locally
submodule-update:
	@echo "� [1/7] Updating submodules..."
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
	@echo "� [2/7] Pushing local changes to GitHub..."
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
		docker exec gregory pip install -r requirements.txt && \
		echo "✅ Dependencies installed"'

# Step 5: Run database migrations on remote
remote-migrate:
	@echo "�️  [5/7] Running database migrations..."
	@ssh gregory@House 'cd /home/gregory/gregory-ms-website && \
		echo "🗃️  Applying database migrations..." && \
		docker exec gregory python manage.py migrate && \
		echo "✅ Database migrations complete"'

# Step 6: Restart application container
remote-restart:
	@echo "� [6/7] Restarting application..."
	@ssh gregory@House 'echo "🔄 Restarting application container..." && \
		docker restart gregory && \
		echo "✅ Container restarted successfully"'

# Backend deployment pipeline (for application code changes)
deploy-backend: submodule-update local-push remote-pull remote-restart
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
