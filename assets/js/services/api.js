/**
 * API Service - Centralized API calls for Gregory MS
 */
import axios from 'axios';

// Base API URL
const API_URL = 'https://api.gregory-ms.com';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Article related API calls
 */
export const articleService = {
  // Get all articles with pagination
  getArticles: (page = 1) => 
    apiClient.get(`/teams/1/articles?format=json&page=${page}`),
  
  // Get a single article by ID
  getArticleById: (articleId) => 
    apiClient.get(`/articles/${articleId}/?format=json`),
  
  // Get articles by category
  getArticlesByCategory: (category, page = 1) => 
    apiClient.get(`/teams/1/articles/category/${category}/?format=json&page=${page}`),
  
  // Get articles by author
  getArticlesByAuthor: (authorId, page = 1) => 
    apiClient.get(`/articles/author/${authorId}/?format=json&page=${page}`),
    
  // Get relevant articles
  getRelevantArticles: (page = 1) => 
    apiClient.get(`/articles/relevant?format=json&page=${page}`),
};

/**
 * Trial related API calls
 */
export const trialService = {
  // Get all trials with pagination
  getTrials: (page = 1) => 
    apiClient.get(`/teams/1/trials/?format=json&page=${page}`),
  
  // Get trials by category
  getTrialsByCategory: (category, page = 1) => 
    apiClient.get(`/teams/1/trials/category/${category}/?format=json&page=${page}`),
};

/**
 * Category related API calls
 */
export const categoryService = {
  // Get monthly counts for a category
  getMonthlyCounts: (category) => 
    apiClient.get(`/teams/1/categories/${category}/monthly-counts/`),
};

/**
 * Author related API calls
 */
export const authorService = {
  // Get author details
  getAuthor: (authorId) => 
    apiClient.get(`/authors/${authorId}/?format=json`),
};

export default {
  articleService,
  trialService,
  categoryService,
  authorService,
};
