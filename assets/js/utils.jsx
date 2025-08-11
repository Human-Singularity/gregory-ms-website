import React from 'react';

export function generateArticleURL(article) {
	const article_id = article.article_id;
	const article_slug = article.title.replace(/ /g, '-').toLowerCase();
	return `/articles/${article_id}/${article_slug}`;
}

export function formatDate(date) {
	// Handle null, undefined, or empty string
	if (!date) {
		return 'Date not available';
	}
	
	// Check if the date is valid before parsing
	if (isNaN(Date.parse(date))) {
		console.warn('Invalid date value:', date);
		return 'Invalid date';
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
	const canonicalURL = `https://gregory-ms.com/articles/${article.article_id}/`
	let canonicalLinkElement = document.querySelector('link[rel="canonical"]');
	if (canonicalLinkElement) {
		// If a canonical link element already exists, update the href
		canonicalLinkElement.setAttribute('href', canonicalURL);
	} else {
		// If no canonical link element exists, create a new one
		canonicalLinkElement = document.createElement('link');
		canonicalLinkElement.setAttribute('rel', 'canonical');
		canonicalLinkElement.setAttribute('href', canonicalURL);

		// Append the new canonical link element to the head
		document.head.appendChild(canonicalLinkElement);
	}
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
	
}

export function removeSpecifiedNodes() {
	// Remove h2 element
	const h2ElementToRemove = document.querySelector('#home > div.wrapper > div.page-header.page-header-mini > div.content-center > div > div > h2');
	if (h2ElementToRemove) {
			h2ElementToRemove.parentNode.removeChild(h2ElementToRemove);
	} else {
			// console.log('h2 Element not found');
	}

	// Remove a element
	const aElementToRemove = document.querySelector('#home > div.wrapper > div.page-header.page-header-mini > div.content-center > div > div > a');
	if (aElementToRemove) {
			aElementToRemove.parentNode.removeChild(aElementToRemove);
	} else {
			// console.log('a Element not found');
	}

	// Remove div#sourceinfo element
	const divElementToRemove = document.querySelector('div#sourceinfo');
	if (divElementToRemove) {
			divElementToRemove.parentNode.removeChild(divElementToRemove);
	} else {
			// console.log('div#sourceinfo Element not found');
	}
	const buttonElementToRemove = document.querySelector('a#metabaseDashboard')
	if (buttonElementToRemove){
		buttonElementToRemove.parentNode.removeChild(buttonElementToRemove)
	}else{
		// console.log('a#metabaseDashboard not found')
	}
}

export function formatNumber(num) {
  if (typeof num !== 'number') {
    return '0';
  }
  return num.toLocaleString();
}

export function generateAuthorURL(author) {
	if (!author) return '#';
	// Prefer ORCID when available; fall back to author_id
	const orcid = author.ORCID || author.orcid;
	if (orcid) {
		const id = String(orcid).replace(/^https?:\/\/orcid\.org\//, '');
		return `/authors/${id}/`;
	}
	if (author.author_id) {
		return `/authors/${author.author_id}/`;
	}
	return '#';
}
