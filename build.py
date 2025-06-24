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
		delete_temporary_files()
		generate_metabase_embeds()
		build_website()