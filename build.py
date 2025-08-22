#!/usr/bin/python3
import os
import sys
import subprocess
import json
import time
from pathlib import Path
from datetime import datetime

# Set current directory as the working directory
GREGORY_DIR = os.getenv('GREGORY_DIR', os.getcwd())
WEBSITE_PATH = os.getenv('WEBSITE_PATH', 'public')
now = datetime.now()
datetime_string = now.strftime("%d-%m-%Y_%Hh%Mm%Ss")

# Optional imports with fallbacks
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("Warning: python-dotenv not installed. Environment variables will not be loaded from .env file.")

# press kit variables
directory_name = 'gregory-ai-press-kit'
folder_id = '1KuEj8mERv5FcLfmJ1hP840GMrREoJpRc'

def check_dependencies(feature):
    """Check if dependencies for a specific feature are available."""
    if feature == 'presskit':
        try:
            # Try to import local presskit module
            import sys
            sys.path.append(os.getcwd())  # Add current directory to path
            import presskit
            return True
        except ImportError as e:
            print(f"Warning: presskit module error: {e}")
            print("Make sure 'gregoryai-41cd67dab7a5.json' credentials file exists.")
            print("You may need to install required dependencies:")
            print("pip install google-api-python-client google-auth")
            return False
    elif feature == 'metabase':
        try:
            import jwt
            return True
        except ImportError:
            print("Warning: PyJWT not installed. Metabase embed generation will be skipped.")
            print("Install with: pip install PyJWT")
            return False
    elif feature == 'git':
        try:
            import git
            return True
        except ImportError:
            print("Warning: GitPython not installed. Using subprocess for git operations.")
            return False
    return False

def install_dependencies(feature):
    """Attempt to install missing dependencies for a specific feature."""
    try:
        if feature == 'presskit':
            print("Attempting to install Google API dependencies...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", 
                                  "google-api-python-client", "google-auth"])
            return True
        elif feature == 'metabase':
            print("Attempting to install PyJWT...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", "PyJWT"])
            return True
        elif feature == 'git':
            print("Attempting to install GitPython...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", "GitPython"])
            return True
        return False
    except subprocess.CalledProcessError as e:
        print(f"Failed to install dependencies: {e}")
        return False

def pull_from_github():
    print('''
####
## PULL FROM GITHUB
####
''')
    # Try to use GitPython if available, or install it if possible
    if not check_dependencies('git'):
        if '--auto-install' in sys.argv:
            print("Missing git dependencies. Attempting to install...")
            install_dependencies('git')
    
    if check_dependencies('git'):
        import git
        os.chdir(GREGORY_DIR)
        g = git.cmd.Git(GREGORY_DIR)
        output = g.pull()
        print(output)
    else:
        # Fallback to using subprocess
        subprocess.run(["git", "pull"])

def delete_temporary_files():
    print('\n# delete temporary files')
    for name in ['articles', 'trials']:
        for ext in ['.xlsx', '.json', '.csv']:
            file = Path(f'content/developers/{name}_{datetime_string}{ext}')
            if file.exists():
                file.unlink()


def process_presskit():
    print('''
####
## PROCESS PRESS KIT
####
''')
    # Check for dependencies and attempt to install if missing
    if not check_dependencies('presskit'):
        print("Missing presskit dependencies. Attempting to install...")
        if not install_dependencies('presskit'):
            print("Could not install presskit dependencies. Skipping presskit processing.")
            return
        # Check again after attempting to install
        if not check_dependencies('presskit'):
            print("Skipping presskit processing due to missing dependencies.")
            return
    
    try:
        # Ensure we're importing the local presskit module
        import sys
        sys.path.append(os.getcwd())  # Add current directory to path
        import presskit
        
        print("Processing presskit files...")
        presskit.setup_dir(directory_name)
        presskit.process_folder(folder_id, directory_name)
        presskit.create_zip_from_folder(directory_name, 'content/gregoryai_press.zip')
        print("Presskit processing completed successfully.")
    except Exception as e:
        print(f"Error processing presskit: {e}")
        print("Check if the Google Drive credentials file exists and is valid.")

def check_docker():
    """Check if Docker is available in the system."""
    try:
        result = subprocess.run(["docker", "--version"], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"Using Docker: {result.stdout.strip()}")
            return True
        else:
            print("Docker is not running or accessible.")
            return False
    except FileNotFoundError:
        print("Docker is not installed or not in PATH.")
        print("Please install Docker to use this script: https://docs.docker.com/get-docker/")
        return False

def check_output_directory():
    """Check if the output directory is accessible and writable."""
    website_path = os.environ.get("WEBSITE_PATH", "/var/www/gregory-ms.com")
    try:
        # Create the directory if it doesn't exist
        os.makedirs(website_path, exist_ok=True)
        
        # Check if we can write to it
        test_file = Path(website_path) / ".write_test"
        test_file.touch()
        test_file.unlink()
        
        return True
    except (PermissionError, OSError) as e:
        print(f"Warning: Output directory {website_path} is not writable: {e}")
        print("You may need to run this script with sudo or change WEBSITE_PATH to a writable location.")
        print("Example: WEBSITE_PATH=./public python build.py --build")
        return False

def build_website():
    print('''
####
## RUN HUGO BUILD USING DOCKER
####
''')
    if not check_docker():
        sys.exit(1)
    
    if not check_output_directory():
        sys.exit(1)
        
    # Get the target website path - default to /var/www/gregory-ms.com/ if not specified
    website_path = os.environ.get("WEBSITE_PATH", "/var/www/gregory-ms.com")
    current_dir = os.getcwd()
    
    # Check if output directory exists on host, create if it doesn't
    host_website_path = Path(website_path)
    if not host_website_path.exists():
        print(f"Output directory {website_path} does not exist. Creating it...")
        try:
            os.makedirs(website_path, exist_ok=True)
            print(f"Created output directory: {website_path}")
        except PermissionError:
            print(f"Error: No permission to create directory {website_path}")
            print("You may need to run this script with sudo or create the directory manually.")
            return
    
    # Get user and group info for file ownership
    try:
        import pwd
        import grp
        uid = pwd.getpwnam('gregory').pw_uid
        gid = grp.getgrnam('www-data').gr_gid
        user_opts = ["--user", f"{uid}:{gid}"]
    except (KeyError, ImportError):
        print("Warning: Could not determine UID/GID for gregory:www-data. Files may be owned by root.")
        print("Ensure user 'gregory' and group 'www-data' exist on the host system.")
        user_opts = []

    # Use Docker to run Hugo with proper environment variables and volume mounts
    docker_command = [
        "docker", "run", "--rm",
        *user_opts,
        "-v", f"{current_dir}:/src",  # Mount source code
        "-v", f"{website_path}:/output",  # Mount output directory
        "-e", "NODE_ENV=production",  # Ensure production mode for JS builds
        "hugomods/hugo:latest",
        "hugo", "-d", "/output", "--gc", "--minify"  # Output to mounted volume
    ]
    
    print(f"Building website to host directory: {website_path}")
    
    # Run the Docker command
    result = subprocess.run(docker_command)
    
    if result.returncode == 0:
        print(f"Website built successfully in {website_path} directory")
    else:
        print(f"Error building website. Check Docker output for details.")
        print("If permission errors occur, ensure you have write access to the output directory.")

def serve_website():
    print('''
####
## RUN HUGO SERVER USING DOCKER
####
''')
    if not check_docker():
        sys.exit(1)
        
    current_dir = os.getcwd()
    
    # Use Docker to run Hugo server with proper flags for interactive use
    docker_command = [
        "docker", "run", "--rm", "-it",
        "-p", "1313:1313",
        "-v", f"{current_dir}:/src",
        "hugomods/hugo:latest",
        "hugo", "server", "--bind", "0.0.0.0"
    ]
    
    print("Starting Hugo server using Docker...")
    print("Access the site at http://localhost:1313/")
    print("Press Ctrl+C to stop the server.")
    
    # Run the Docker command (this will block until Ctrl+C)
    try:
        subprocess.run(docker_command)
    except KeyboardInterrupt:
        print("\nHugo server stopped")

def show_help():
    print('''
Gregory MS Website Build Script
===============================

Usage:
  python build.py [options]

Options:
  --build         Build the website using Docker (production mode)
  --server        Start Hugo server using Docker (development mode)
  --fast          Pull from GitHub and build the website (skip presskit processing)
  --auto-install  Automatically install missing Python dependencies
  --help          Show this help message

Environment Variables:
  WEBSITE_PATH    Set the output directory for the built website
                  Default: /var/www/gregory-ms.com

Description:
  This script builds the Gregory MS website using Docker to run Hugo.
  It also processes press kit materials and generates metabase embeds.
  
  The built website will be output to the host directory specified by
  WEBSITE_PATH environment variable (/var/www/gregory-ms.com by default).
  
  For full functionality, install required dependencies:
  pip install python-dotenv GitPython PyJWT google-api-python-client google-auth
  
  Make sure the Google Drive credentials file 'gregoryai-41cd67dab7a5.json' exists in the project root.
''')

if __name__ == '__main__':
    # Check for output directory in arguments (format: --output=/path/to/dir)
    for arg in sys.argv:
        if arg.startswith('--output='):
            output_path = arg.split('=')[1]
            os.environ['WEBSITE_PATH'] = output_path
            print(f"Setting output directory to: {output_path}")
    
    if '--help' in sys.argv or len(sys.argv) == 1:
        # If --help is passed or no arguments provided, show the help message
        show_help()
        if len(sys.argv) == 1:
            print("\nNo option specified. Use --build to build the website or --server to start the development server.")
    elif '--server' in sys.argv:
        # If --server is passed, run the Hugo server using Docker
        serve_website()
    elif '--build' in sys.argv or '--fast' in sys.argv:
        # If --build or --fast is passed as a command-line argument, pull and build
        # Check if output directory is writable
        check_output_directory()
        
        pull_from_github()
        if '--fast' not in sys.argv:
            # Only run these if not in fast mode
            process_presskit()
            delete_temporary_files()
        build_website()