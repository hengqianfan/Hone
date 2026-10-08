import { honeConfig } from '../config/main';
export const setDocumentTitle = (title: string) => {
    document.title = title ? `${honeConfig.siteTitle} | ${title} ` : honeConfig.siteTitle;
};