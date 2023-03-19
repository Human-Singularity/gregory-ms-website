#!/usr/bin/python3
import git
import html
import json
import jwt
import numpy as np
import os
import pandas as pd
import pathlib
import sqlalchemy
import subprocess
import time
from datetime import datetime
from dotenv import load_dotenv
from pathlib import Path
from shutil import which
from slugify import slugify
from zipfile import ZipFile

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

	query_articles = 'SELECT "public"."articles"."article_id" AS "article_id", "public"."articles"."title" AS "title", "public"."articles"."summary" AS "summary", "public"."articles"."link" AS "link", "public"."articles"."published_date" AS "published_date", "public"."articles"."source" AS "source", "public"."articles"."relevant" AS "relevant", "public"."articles"."ml_prediction_gnb" AS "ml_prediction_gnb", "public"."articles"."ml_prediction_lr" AS "ml_prediction_lr", "public"."articles"."discovery_date" AS "discovery_date", "public"."articles"."noun_phrases" AS "noun_phrases", "public"."articles"."doi" AS "doi", "public"."articles"."kind" AS "kind", "public"."articles"."takeaways" as "takeaways", "Sources"."source_id" AS "Sources__source_id", "Sources"."name" AS "Sources__name", "Sources"."link" AS "Sources__link", "Sources"."language" AS "Sources__language", "Sources"."source_for" AS "Sources__source_for", "Sources"."subject_id" AS "Sources__subject_id", "Articles Categories"."id" AS "Articles Categories__id", "Articles Categories"."articles_id" AS "Articles Categories__articles_id", "Articles Categories"."categories_id" AS "Articles Categories__categories_id", "Categories"."category_id" AS "Categories__category_id", "Categories"."category_name" AS "Categories__category_name" FROM "public"."articles" LEFT JOIN "public"."sources" "Sources" ON "public"."articles"."source" = "Sources"."source_id" LEFT JOIN "public"."articles_categories" "Articles Categories" ON "public"."articles"."article_id" = "Articles Categories"."articles_id" LEFT JOIN "public"."categories" "Categories" ON "Articles Categories"."categories_id" = "Categories"."category_id" ORDER BY	"public"."articles"."article_id" ASC;'
	query_trials = 'SELECT "public"."trials"."trial_id" AS "trial_id", "public"."trials"."discovery_date" AS "discovery_date", "public"."trials"."title" AS "title", "public"."trials"."summary" AS "summary", "public"."trials"."link" AS "link", "public"."trials"."published_date" AS "published_date", "public"."trials"."source" AS "source", "public"."trials"."relevant" AS "relevant", "Sources"."source_id" AS "Sources__source_id", "Sources"."name" AS "Sources__name", "Sources"."link" AS "Sources__link" FROM "public"."trials" LEFT JOIN "public"."sources" "Sources" ON "public"."trials"."source" = "Sources"."source_id" ORDER BY trial_id DESC;'
	query_categories = 'SELECT "public"."categories"."category_id" AS "category_id", "public"."categories"."category_name" AS "category_name", "public"."categories"."category_description" AS "category_description", "public"."categories"."category_terms" AS "category_terms" FROM "public"."categories";'


	articles = pd.read_sql_query(sql=sqlalchemy.text(query_articles), con=engine.connect())
	categories = pd.read_sql_query(sql=sqlalchemy.text(query_categories), con=engine.connect())
	trials = pd.read_sql_query(sql=sqlalchemy.text(query_trials), con=engine.connect())

	return articles, categories, trials


def save_excel_and_json(articles, categories, trials):
	print('''
	####
	## SAVE EXCEL AND JSON VERSIONS
	####
	''')

	# Process and save articles
	process_and_save_dataframe(articles, 'articles')

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


def create_categories(categories):
	print('''
	####
	## CREATE CATEGORIES
	####
	''')
	categoriesDir = GREGORY_DIR + "/content/categories/"

	for index, row in categories.iterrows():       
		category_slug = slugify(row['name'])
		category_path = categoriesDir + category_slug

		if not os.path.exists(category_path):
			os.makedirs(category_path)
			with open(category_path + "/_index.md", "w") as f:
				f.write("title: {}\n".format(row['name']))
				f.write("slug: {}\n".format(category_slug))
				f.write("id: {}\n".format(row['id']))
				f.close()
def generate_metabase_embeds(trials):
	print('''
####
## GENERATE METABASE EMBEDS
####
''')
	metabase_json = []

	for index, row in trials.iterrows():
		token = jwt.encode({"resource": {"dashboard": row['dashboard_id']},
							"params": {},
							"exp": int(time.time()) + (60 * 60 * 4)},
						METABASE_SECRET_KEY, algorithm="HS256")

		embed_url = METABASE_SITE_URL + "/embed/dashboard/" + token.decode("utf8") + "#bordered=true&titled=true"
		metabase_json.append({"id": row['id'], "embed_url": embed_url})

	with open('data/metabase_embeds.json', 'w') as embed_file:
		json.dump(metabase_json, embed_file, indent=4)
	embed_file.close()

def build_website():
	print('''
####
## RUN HUGO BUILD
####
''')
	os.chdir(WEBSITE_PATH)
	hugo_command = which("hugo")
	subprocess.run([hugo_command, "build"])

if __name__ == "__main__":
	pull_from_github()
	articles, categories, trials = get_data()
	save_excel_and_json(articles, categories, trials)
	create_categories(categories)
	generate_metabase_embeds(trials)
	build_website()
