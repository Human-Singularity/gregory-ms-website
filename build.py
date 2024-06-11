#!/usr/bin/python3
from bs4 import BeautifulSoup
from datetime import datetime
from dotenv import load_dotenv
from lxml import etree
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
import sqlalchemy
import subprocess
import time
import sys
import requests

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

	# Remove non-alphanumeric characters
	# text = re.sub(r'\W', ' ', text)
	
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

def fetch_all_data(api_url):
	data_list = []
	while api_url:
		response = requests.get(api_url)
		data = response.json()
		data_list.extend(data['results'])
		api_url = data['next']
	return data_list

def get_data():
	print('''
####
## GET DATA
####
	''')

	# Fetch articles from API
	api_url_articles = 'http://localhost:8000/teams/1/articles/?format=json'
	articles_data = fetch_all_data(api_url_articles)
	articles = pd.json_normalize(articles_data)
	
	# Fetch trials from API
	api_url_trials = 'http://localhost:8000/teams/1/trials/?format=json'
	trials_data = fetch_all_data(api_url_trials)
	trials = pd.json_normalize(trials_data)

	# Fetch categories from API
	api_url_categories = 'http://localhost:8000/teams/1/categories/?format=json'
	categories_data = fetch_all_data(api_url_categories)
	categories = pd.json_normalize(categories_data)

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
	df['published_date'] = df['published_date'].dt.tz_localize(None)
	df['discovery_date'] = df['discovery_date'].dt.tz_localize(None)

	df.link = df.link.apply(html.unescape)
	df.summary = df.summary.replace(np.nan, '', regex=True)
	df.summary = df.summary.apply(html.unescape)
	df.to_excel('content/developers/' + name + '_' + datetime_string + '.xlsx')
	df.to_json('content/developers/' + name + '_' + datetime_string + '.json')
	df.to_csv('content/developers/' + name + '_' + datetime_string + '.csv')

def save_articles_to_json(articles):
	print('''
####
## CREATE data/articles.json
####
	''')
	# Keep only 'article_id', 'title' and 'published_date' columns
	json_articles = articles[['article_id', 'title','summary','link','published_date','discovery_date','source','publisher','container_title','authors','relevant','doi','access','takeaways','categories']]

	# Convert the Unix timestamp (in ms) to a human-readable date format
	json_articles['published_date'] = pd.to_datetime(json_articles['published_date'], unit='ms')
	json_articles['discovery_date'] = pd.to_datetime(json_articles['discovery_date'],unit='ms')

	# Format the 'published_date' column as "yyyy-mm-dd"
	json_articles['published_date'] = json_articles['published_date'].dt.strftime('%Y-%m-%d')
	json_articles['discovery_date'] = json_articles['discovery_date'].dt.strftime('%Y-%m-%d')

	# Clean the summary before saving files
	json_articles['summary'] = json_articles['summary'].apply(clean_text)

	# Save the processed DataFrame to a JSON file
	json_articles.to_json('content/developers/articles_' +  datetime_string + '.json', orient='records')
	json_articles.to_excel('content/developers/articles_' +  datetime_string + '.xlsx')
	json_articles.to_csv('content/developers/articles_' +  datetime_string + '.csv')

def create_categories(categories):
	print('''
####
## CREATE CATEGORIES
####
	''')
	categoriesDir = GREGORY_DIR + "/content/categories/"

	for index, row in categories.iterrows():       
		category_slug = slugify(row['category_name'])
		category_path = categoriesDir + category_slug
		category_index_file = category_path + "/_index.md"
		os.makedirs(category_path, exist_ok=True)

		if not os.path.exists(category_index_file):
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

	zipArticles = ZipFile('content/developers/articles.zip', 'w')
	print('- content/developers/articles_' + datetime_string + '.xlsx')
	print('- content/developers/articles_' + datetime_string + '.json')
	print('- content/developers/articles_' + datetime_string + '.csv')
	print('- content/developers/README.md\n')

	zipArticles.write('content/developers/articles_' + datetime_string + '.xlsx')
	zipArticles.write('content/developers/articles_' + datetime_string + '.json')
	zipArticles.write('content/developers/articles_' + datetime_string + '.csv')
	zipArticles.write('content/developers/README.md')
	zipArticles.close()

	print('### Clinical Trials')

	zipTrials = ZipFile('content/developers/trials.zip', 'w')
	print('- content/developers/trials_' + datetime_string + '.xlsx')
	print('- content/developers/trials_' + datetime_string + '.json')
	print('- content/developers/trials_' + datetime_string + '.csv')
	print('- content/developers/README.md\n')

	zipTrials.write('content/developers/trials_' + datetime_string + '.xlsx')
	zipTrials.write('content/developers/trials_' + datetime_string + '.json')
	zipTrials.write('content/developers/trials_' + datetime_string + '.csv')
	zipTrials.write('content/developers/README.md')
	zipTrials.close()

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
			etree.SubElement(url, "lastmod").text = row['discovery_date'].strftime("%Y-%m-%d")

	# Process trials
	for _, row in trials.iterrows():
		if pd.notnull(row['discovery_date']):
			url = etree.SubElement(urlset, "url")
			etree.SubElement(url, "loc").text = f"https://gregory-ms.com/trials/{row['trial_id']}/"
			etree.SubElement(url, "changefreq").text = "monthly"  # adjust as needed
			# assuming that the 'discovery_date' column is a datetime object
			etree.SubElement(url, "lastmod").text = row['discovery_date'].strftime("%Y-%m-%d")

	# Write the XML to a file
	with open("content/articles_trials.xml", "wb") as file:
		file.write(etree.tostring(urlset, pretty_print=True, xml_declaration=True, encoding="UTF-8"))

def delete_temporary_files():
	print('\n# delete temporary files')
	excel_file = Path('content/developers/articles_' + datetime_string + '.xlsx')
	json_file = Path('content/developers/articles_' + datetime_string + '.json')
	csv_file = Path('content/developers/articles_' + datetime_string + '.csv')
	Path.unlink(excel_file)
	Path.unlink(json_file)
	Path.unlink(csv_file)
	excel_file = Path('content/developers/trials_' + datetime_string + '.xlsx')
	json_file = Path('content/developers/trials_' + datetime_string + '.json')
	csv_file = Path('content/developers/trials_' + datetime_string + '.csv')
	Path.unlink(excel_file)
	Path.unlink(json_file)
	Path.unlink(csv_file)

def generate_metabase_embeds():
	print('''
####
## GENERATE EMBED KEYS FOR METABASE
####
	''')

	# Opening JSON file
	f = open('data/dashboards.json')
	
	# returns JSON object as
	# a dictionary
	dashboards = json.load(f)
	
	# Iterating through the json list
	metabase_json = {}
	for i in dashboards:
		print("Generating key for dashboard: "+ str(i))
		payload = { "resource": {"dashboard": i}, "params": { }, "exp": round(time.time()) + (60 * 60 * 24 * 30)}
		token = jwt.encode(payload, METABASE_SECRET_KEY, algorithm='HS256')
		iframeUrl = METABASE_SITE_URL + 'embed/dashboard/' + token + '#bordered=true&titled=true'
		entry = "dashboard_" + str(i) 
		metabase_json[str(entry)] = iframeUrl

	f.close()

	embedsJson = GREGORY_DIR + 'data/embeds.json';

	with open(embedsJson, "w") as f:
		f.write(json.dumps(metabase_json))
		f.close()

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
		save_excel_and_json(articles, trials)
		save_articles_to_json(articles)
		create_categories(categories)
		create_zip_files()
		generate_sitemap(articles, trials)
		delete_temporary_files()
		generate_metabase_embeds()
		build_website()
