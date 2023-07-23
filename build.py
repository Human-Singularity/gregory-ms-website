#!/usr/bin/python3
from datetime import datetime
from dotenv import load_dotenv
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
import sqlalchemy
import subprocess
import time


load_dotenv()

# Set Variables
GREGORY_DIR = os.getenv('GREGORY_DIR')
WEBSITE_PATH = os.getenv('WEBSITE_PATH')
now = datetime.now()
datetime_string = now.strftime("%d-%m-%Y_%Hh%Mm%Ss")

# Variables to sign metabase embeds
METABASE_SITE_URL = os.getenv('METABASE_SITE_URL')
METABASE_SECRET_KEY = os.getenv('METABASE_SECRET_KEY')


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

def get_data():
	print('''
####
## GET DATA
####
	''')

	# It's localhost because we are running outside the container
	db_host = 'localhost'
	postgres_user = os.getenv('POSTGRES_USER')
	postgres_password = os.getenv('POSTGRES_PASSWORD')
	postgres_db = os.getenv('POSTGRES_DB')

	postgres_connection_url = 'postgresql://' + postgres_user + ':' + postgres_password + '@' + db_host + ':5432/' + postgres_db
	engine = sqlalchemy.create_engine(postgres_connection_url)

	query_articles = '''
	SELECT articles.article_id, articles.title, articles.summary, articles.link,
				articles.published_date, articles.discovery_date, articles.source,
				articles.publisher, articles.container_title, articles.relevant, 
				articles.ml_prediction_gnb, articles.ml_prediction_lr, articles.doi, 
				articles.access, articles.takeaways,
				sources.source_id AS Sources__source_id, sources.name AS Sources__name,
				sources.link AS Sources__link, sources.language AS Sources__language, 
				sources.source_for AS Sources__source_for, sources.subject_id AS Sources__subject_id,
				STRING_AGG(DISTINCT authors.given_name || ' ' || authors.family_name, ', ') AS authors,
				STRING_AGG(DISTINCT categories.category_name, ', ') AS categories
	FROM articles
	LEFT JOIN sources ON articles.source = sources.source_id
	LEFT JOIN articles_authors ON articles.article_id = articles_authors.articles_id
	LEFT JOIN authors ON articles_authors.authors_id = authors.author_id
	LEFT JOIN articles_categories ON articles.article_id = articles_categories.articles_id
	LEFT JOIN categories ON articles_categories.categories_id = categories.category_id
	GROUP BY articles.article_id, sources.source_id
	ORDER BY articles.article_id ASC;
	'''
	
	query_trials = 'SELECT "public"."trials"."trial_id" AS "trial_id", "public"."trials"."discovery_date" AS "discovery_date", "public"."trials"."title" AS "title", "public"."trials"."summary" AS "summary", "public"."trials"."link" AS "link", "public"."trials"."published_date" AS "published_date", "public"."trials"."source" AS "source", "public"."trials"."relevant" AS "relevant", "Sources"."source_id" AS "Sources__source_id", "Sources"."name" AS "Sources__name", "Sources"."link" AS "Sources__link" FROM "public"."trials" LEFT JOIN "public"."sources" "Sources" ON "public"."trials"."source" = "Sources"."source_id" ORDER BY trial_id DESC;'
	query_categories = 'SELECT "public"."categories"."category_id" AS "category_id", "public"."categories"."category_name" AS "category_name", "public"."categories"."category_description" AS "category_description", "public"."categories"."category_terms" AS "category_terms" FROM "public"."categories";'


	articles = pd.read_sql_query(sql=sqlalchemy.text(query_articles), con=engine.connect())
	categories = pd.read_sql_query(sql=sqlalchemy.text(query_categories), con=engine.connect())
	trials = pd.read_sql_query(sql=sqlalchemy.text(query_trials), con=engine.connect())

	return articles, categories, trials


def save_excel_and_json(articles, trials):
	print('''
####
## SAVE EXCEL AND JSON VERSIONS
####
	''')

	# Process and save articles
	# process_and_save_dataframe(articles, 'articles')

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
		json_articles = articles[['article_id', 'title','summary','link','published_date','discovery_date','source','publisher','container_title','authors','relevant','ml_prediction_gnb','ml_prediction_lr','doi','access','takeaways','categories']]

		# Convert the Unix timestamp (in ms) to a human-readable date format
		json_articles['published_date'] = pd.to_datetime(json_articles['published_date'], unit='ms')
		json_articles['discovery_date'] = pd.to_datetime(json_articles['discovery_date'],unit='ms')

		# Format the 'published_date' column as "yyyy-mm-dd"
		json_articles['published_date'] = json_articles['published_date'].dt.strftime('%Y-%m-%d')
		json_articles['discovery_date'] = json_articles['discovery_date'].dt.strftime('%Y-%m-%d')

		# Save the processed DataFrame to a JSON file
		json_articles.to_json('content/developers/articles_' +  datetime_string + '.json', orient='records')
		json_articles.to_csv('content/developers/articles_' +  datetime_string + '.csv')
		json_articles.to_excel('content/developers/articles_' +  datetime_string + '.xlsx')
	
import os

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
		payload = { "resource": {"dashboard": i}, "params": { }, "exp": round(time.time()) + (60 * 1440)}
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
	pull_from_github()
	articles, categories, trials = get_data()
	save_excel_and_json(articles, trials)
	save_articles_to_json(articles)
	create_categories(categories)
	create_zip_files()
	delete_temporary_files()
	generate_metabase_embeds()
	build_website()
