import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import { StaysApp } from './app';
import { catalogueReady } from './data';
import { dismissSplash } from './splash';
import { APP_NAME } from './theme';

document.title = `Stays - ${APP_NAME}`;

const root = document.getElementById('stays-root');

if (root) {
    createRoot(root).render(
        <StrictMode>
            <StaysApp />
            <Toaster
                position="bottom-center"
                theme="light"
                mobileOffset={{ bottom: 96 }}
                offset={{ bottom: 96 }}
            />
        </StrictMode>,
    );

    void dismissSplash(catalogueReady);
}
