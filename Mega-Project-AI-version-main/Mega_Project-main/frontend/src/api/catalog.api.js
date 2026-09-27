import client from './client.js';

export const getCategories = (lang) => client.get('/catalog/categories', { params: lang ? { lang } : {} });
export const getSkills = (categoryId) => client.get('/catalog/skills', { params: categoryId ? { categoryId } : {} });
