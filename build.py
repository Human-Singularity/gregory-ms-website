#!/usr/bin/python3
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from dotenv import load_dotenv
from lxml import etree
from math import ceil
from pathlib import Path
from shutil import which
from slugify import slugify
from zipfile import ZipFile
import git
import html
import json
import jwt
import numpy as np
import os
import pandas as pd
import presskit
import re
import requests
import sqlalchemy
import subprocess
import sys
import time
from tqdm import tqdm

load_dotenv()

# Set Variables
GREGORY_DIR = os.getenv('GREGORY_DIR')
WEBSITE_PATH = os.getenv('WEBSITE_PATH')
now = datetime.now()
datetime_string = now.strftime("%d-%m-%Y_%Hh%Mm%Ss")

# Variables to sign metabase embeds
METABASE_SITE_URL = os.getenv('METABASE_SITE_URL')
METABASE_SECRET_KEY = os.getenv('METABASE_SECRET_KEY')

# press kit variables
directory_name = 'gregory-ai-press-kit'
folder_id = '1KuEj8mERv5FcLfmJ1hP840GMrREoJpRc'

def clean_text(text):
	# avoid null values
	if pd.isnull(text):
		return ''
	# remove html
	soup = BeautifulSoup(text, "html.parser")
	text = soup.get_text()

	# remove \n \r 
	text = text.replace('\n', ' ')
	text = text.replace('\r', ' ')

	# Remove extra whitespace
	text = re.sub(r'\s+', ' ', text)

	return text

def pull_from_github():
	print('''
####
## PULL FROM GITHUB
####
	''')
	os.chdir(GREGORY_DIR)
	g = git.cmd.Git(GREGORY_DIR)
	output = g.pull()
	print(output)

def fetch_page(api_url):
	response = requests.get(api_url)
	response.raise_for_status()
	return response.json()

def fetch_all_data(api_url):
	initial_data = fetch_page(api_url)
	count = initial_data['count']
	results = initial_data['results']
	num_pages = ceil(count / len(results))

	with ThreadPoolExecutor() as executor:
		futures = {executor.submit(fetch_page, f"{api_url}&page={page}"): page for page in range(2, num_pages + 1)}
		for future in tqdm(as_completed(futures), total=num_pages - 1, desc=f"Fetching {api_url.split('/')[-2]}"):
			try:
				data = future.result()
				results.extend(data['results'])
			except Exception as exc:
				print(f'Page {futures[future]} generated an exception: {exc}')
	
	return results

def get_data():
	print('''
####
## GET DATA
####
	''')

	api_urls = {
		'articles': 'http://localhost:8000/teams/1/articles/?format=json',
		'trials': 'http://localhost:8000/teams/1/trials/?format=json',
		'categories': 'http://localhost:8000/teams/1/categories/?format=json'
	}

	results = {}

	with ThreadPoolExecutor() as executor:
		futures = {executor.submit(fetch_all_data, url): name for name, url in api_urls.items()}
		for future in tqdm(as_completed(futures), total=len(api_urls), desc="Fetching all data"):
			name = futures[future]
			try:
				data = future.result()
				results[name] = data
			except Exception as exc:
				print(f'{name} generated an exception: {exc}')

	articles = pd.json_normalize(results['articles'])
	trials = pd.json_normalize(results['trials'])
	categories = pd.json_normalize(results['categories'])

	return articles, categories, trials

def save_excel_and_json(articles, trials):
	print('''
####
## SAVE EXCEL AND JSON VERSIONS
####
	''')

	# Process and save trials
	process_and_save_dataframe(trials, 'trials')

def process_and_save_dataframe(df, name):
	df['published_date'] = pd.to_datetime(df['published_date']).dt.tz_localize(None)
	df['discovery_date'] = pd.to_datetime(df['discovery_date']).dt.tz_localize(None)

	df['link'] = df['link'].apply(html.unescape)
	df['summary'] = df['summary'].replace(np.nan, '', regex=True)
	df['summary'] = df['summary'].apply(html.unescape)
	df.to_excel(f'content/developers/{name}_{datetime_string}.xlsx')
	df.to_json(f'content/developers/{name}_{datetime_string}.json')
	df.to_csv(f'content/developers/{name}_{datetime_string}.csv')

def save_articles_to_json(articles):
	print('''
####
## CREATE data/articles.json
####
	''')

	# Convert the Unix timestamp (in ms) to a human-readable date format
	articles['published_date'] = pd.to_datetime(articles['published_date'], errors='coerce').dt.tz_localize(None)
	articles['discovery_date'] = pd.to_datetime(articles['discovery_date'], errors='coerce').dt.tz_localize(None)

	# Format the 'published_date' column as "yyyy-mm-dd"
	articles['published_date'] = articles['published_date'].dt.strftime('%Y-%m-%d')
	articles['discovery_date'] = articles['discovery_date'].dt.strftime('%Y-%m-%d')

	# Clean the summary before saving files
	articles['summary'] = articles['summary'].apply(clean_text)

	# Save the processed DataFrame to a JSON file
	articles.to_json(f'content/developers/articles_{datetime_string}.json', orient='records')
	articles.to_excel(f'content/developers/articles_{datetime_string}.xlsx')
	articles.to_csv(f'content/developers/articles_{datetime_string}.csv')

def create_categories(categories):
	print('''
####
## CREATE CATEGORIES
####
	''')
	categories_dir = Path(GREGORY_DIR) / "content" / "categories"

	for _, row in categories.iterrows():       
		category_slug = slugify(row['category_name'])
		category_path = categories_dir / category_slug
		category_index_file = category_path / "_index.md"
		os.makedirs(category_path, exist_ok=True)

		if not category_index_file.exists():
			with open(category_index_file, "w") as f:
				f.write("+++\n")
				f.write(f"title = \"{row['category_name']}\"\n")
				f.write(f"slug = \"{category_slug}\"\n")
				f.write("+++\n")
			print(f"Created category '{row['category_name']}'")
		else:
			print(f"Category '{row['category_name']}' already exists. File not modified.")

def create_zip_files():
	print('''
####
## CREATE ZIP FILES
####

### Articles''')

	zip_articles = ZipFile('content/developers/articles.zip', 'w')
	print(f'- content/developers/articles_{datetime_string}.xlsx')
	print(f'- content/developers/articles_{datetime_string}.json')
	print(f'- content/developers/articles_{datetime_string}.csv')
	print('- content/developers/README.md\n')

	zip_articles.write(f'content/developers/articles_{datetime_string}.xlsx')
	zip_articles.write(f'content/developers/articles_{datetime_string}.json')
	zip_articles.write(f'content/developers/articles_{datetime_string}.csv')
	zip_articles.write('content/developers/README.md')
	zip_articles.close()

	print('### Clinical Trials')

	zip_trials = ZipFile('content/developers/trials.zip', 'w')
	print(f'- content/developers/trials_{datetime_string}.xlsx')
	print(f'- content/developers/trials_{datetime_string}.json')
	print(f'- content/developers/trials_{datetime_string}.csv')
	print('- content/developers/README.md\n')

	zip_trials.write(f'content/developers/trials_{datetime_string}.xlsx')
	zip_trials.write(f'content/developers/trials_{datetime_string}.json')
	zip_trials.write(f'content/developers/trials_{datetime_string}.csv')
	zip_trials.write('content/developers/README.md')
	zip_trials.close()

def generate_sitemap(articles, trials):
	print('''
####
## CREATE content/articles_trials.xml
####
''')
	urlset = etree.Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")

	# Process articles
	for _, row in articles.iterrows():
		if pd.notnull(row['discovery_date']):
			url = etree.SubElement(urlset, "url")
			etree.SubElement(url, "loc").text = f"https://gregory-ms.com/articles/{row['article_id']}/"
			etree.SubElement(url, "changefreq").text = "monthly"  # adjust as needed
			# assuming that the 'discovery_date' column is a datetime object
			discovery_date = pd.to_datetime(row['discovery_date'], errors='coerce')
			etree.SubElement(url, "lastmod").text = discovery_date.strftime("%Y-%m-%d")

	# Process trials
	for _, row in trials.iterrows():
			if pd.notnull(row['discovery_date']):
				url = etree.SubElement(urlset, "url")
				etree.SubElement(url, "loc").text = f"https://gregory-ms.com/trials/{row['trial_id']}/"
				etree.SubElement(url, "changefreq").text = "monthly"  # adjust as needed
				# assuming that the 'discovery_date' column is a datetime object
				discovery_date = pd.to_datetime(row['discovery_date'], errors='coerce')
				etree.SubElement(url, "lastmod").text = discovery_date.strftime("%Y-%m-%d")

	# Write the XML to a file
	with open("content/articles_trials.xml", "wb") as file:
			file.write(etree.tostring(urlset, pretty_print=True, xml_declaration=True, encoding="UTF-8"))

def delete_temporary_files():
	print('\n# delete temporary files')
	for name in ['articles', 'trials']:
			for ext in ['.xlsx', '.json', '.csv']:
					file = Path(f'content/developers/{name}_{datetime_string}{ext}')
					if file.exists():
							file.unlink()

def generate_metabase_embeds():
	print('''
####
## GENERATE EMBED KEYS FOR METABASE
####
	''')

	# Opening JSON file
	with open('data/dashboards.json') as f:
		dashboards = json.load(f)
	
	metabase_json = {}
	for i in dashboards:
		print(f"Generating key for dashboard: {i}")
		payload = {"resource": {"dashboard": i}, "params": {}, "exp": round(time.time()) + (60 * 60 * 24 * 30)}
		token = jwt.encode(payload, METABASE_SECRET_KEY, algorithm='HS256')
		iframeUrl = METABASE_SITE_URL + 'embed/dashboard/' + token + '#bordered=true&titled=true'
		entry = "dashboard_" + str(i)
		metabase_json[str(entry)] = iframeUrl

	embeds_json = GREGORY_DIR + 'data/embeds.json'

	with open(embeds_json, "w") as f:
		json.dump(metabase_json, f)

def build_website():
	print('''
####
## RUN HUGO BUILD
####
''')
	hugo_command = which("hugo")
	website_path = os.environ.get("WEBSITE_PATH", "public")
	subprocess.run([hugo_command, "-d", website_path])

if __name__ == '__main__':
	if '--fast' in sys.argv:
		# If --fast is passed as a command-line argument, only run build_website
		pull_from_github()
		build_website()
	else:
		pull_from_github()
		presskit.setup_dir(directory_name)
		presskit.process_folder(folder_id, directory_name)
		presskit.create_zip_from_folder(directory_name, 'content/gregoryai_press.zip')
		articles, categories, trials = get_data()
		generate_sitemap(articles, trials)
		# save_excel_and_json(articles, trials)
		# save_articles_to_json(articles)
		create_categories(categories)
		# create_zip_files()
		# generate_sitemap(articles, trials)
		delete_temporary_files()
		generate_metabase_embeds()
		build_website()
