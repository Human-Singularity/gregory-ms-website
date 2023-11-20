import os
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from google.oauth2.service_account import Credentials
import io
import zipfile

# Credentials and folder ID
credentials_path = 'gregoryai-41cd67dab7a5.json'
folder_id = '1KuEj8mERv5FcLfmJ1hP840GMrREoJpRc'
scopes = ['https://www.googleapis.com/auth/drive.readonly']

# Authenticate and build service
credentials = Credentials.from_service_account_file(credentials_path, scopes=scopes)
service = build('drive', 'v3', credentials=credentials)

# Dictionary to hold folder ID to path mapping
def setup_dir(directory_name):
	print('''
####
## Check for press kit directory
####
''')
	if not os.path.exists(directory_name):
		os.makedirs(directory_name)
		print(f"The directory {directory_name} has been created.")
	else:
		print(f"The directory {directory_name} already exists.")

def create_zip_from_folder(folder_path, zip_name):
	print('''
####
## Create zip file for press kit
####
''')
	with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
		# Iterate through all the directories and files in the given folder
		for root, dirs, files in os.walk(folder_path):
			for file in files:
				# Create a relative file path to keep the folder structure inside the ZIP
				rel_path = os.path.relpath(os.path.join(root, file), os.path.join(folder_path, '..'))
				zipf.write(os.path.join(root, file), rel_path)

# Recursive function to process folders
def process_folder(folder_id, directory_name, is_first_call=True):
	if is_first_call:
		print('''
####
## Download press kit files
####
''')
	folder_structure = {folder_id: directory_name}
	if not os.path.exists(directory_name):
		os.makedirs(directory_name)

	# Query for items in folder
	query = f"'{folder_id}' in parents"
	results = service.files().list(q=query, fields="files(id, name, mimeType)").execute()
	items = results.get('files', [])

	for item in items:
		item_id = item['id']
		item_name = item['name']
		item_type = item['mimeType']
		file_path = os.path.join(directory_name, item_name)

		if item_type == 'application/vnd.google-apps.folder':
			folder_structure[item_id] = os.path.join(directory_name, item_name)
			process_folder(item_id, folder_structure[item_id], is_first_call=False)
		else:
			if item_type.startswith('application/vnd.google-apps.'):
				# Export Google Docs Editors files as PDF
				request = service.files().export_media(fileId=item_id, mimeType='application/pdf')
				file_path += '.pdf'  # Append PDF extension
			else:
				# Download binary files directly
				request = service.files().get_media(fileId=item_id)
		
			with io.FileIO(file_path, mode='wb') as file_handle:
				downloader = MediaIoBaseDownload(file_handle, request)
				done = False
				while done is False:
					status, done = downloader.next_chunk()
					print(f'Download {int(status.progress() * 100)}% for {item_name}.')
				print(f'{item_name} Download complete.')

###
# Usage
###

# process_folder(folder_id, directory_name )
# create_zip_from_folder(directory_name, 'content/press-kit/press-kit.zip')