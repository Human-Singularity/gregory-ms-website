import React from 'react';

export function generateArticleURL(article) {
	const article_id = article.article_id;
	const article_slug = article.title.replace(/ /g, '-').toLowerCase();
	return `/articles/${article_id}/${article_slug}`;
}

export function formatDate(date) {
	if (isNaN(Date.parse(date))) {
		throw new Error('Invalid date value');
	}
	const options = {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	};

	const dateObj = new Date(date);
	return new Intl.DateTimeFormat('en-UK', options).format(dateObj);
}

export function updateTitleAndMeta(article) {
	// Update the <title> tag
	document.title = article.title;

	// Update the title
	const titleElement = document.querySelector('h1.title');
	if (titleElement) {
		titleElement.textContent = article.title;
	}
	// Truncate the article.takeaways to 155 characters if it exists
	const truncatedTakeaways = article.takeaways ? article.takeaways.slice(0, 155) : '';

	// Update the meta description
	const metaDescription = document.querySelector('meta[name="description"]');
	if (metaDescription) {
		metaDescription.setAttribute('content', truncatedTakeaways);
	}

	// Remove the first specified element (h2)
	const h2ElementToRemove = document.querySelector('#home > div.wrapper > div.page-header.page-header-mini > div.content-center > div > div > h2');
	if (h2ElementToRemove) {
		h2ElementToRemove.parentNode.removeChild(h2ElementToRemove);
	} else {
		console.log('h2 Element not found');
	}

	// Remove the second specified element (a)
	const aElementToRemove = document.querySelector('#home > div.wrapper > div.page-header.page-header-mini > div.content-center > div > div > a');
	if (aElementToRemove) {
		aElementToRemove.parentNode.removeChild(aElementToRemove);
	} else {
		console.log('a Element not found');
	}
}

