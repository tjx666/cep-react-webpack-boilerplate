import { defineConfig } from 'vitepress';

export default defineConfig({
    lang: 'en-US',
    title: 'cep-react-webpack-boilerplate',
    description: 'An awesome cep extension boilerplate with excellent development experience',

    lastUpdated: true,

    themeConfig: {
        sidebar: {
            '/': sidebar(),
        },

        editLink: {
            pattern: 'https://github.com/tjx666/cep-react-webpack-boilerplate/edit/main/docs/:path',
            text: 'Edit this page on GitHub',
        },

        socialLinks: [
            { icon: 'github', link: 'https://github.com/tjx666/cep-react-webpack-boilerplate' },
        ],

        footer: {
            message: 'Released under the MIT License.',
            copyright: 'Copyright YuTengjing',
        },
    },
});

function sidebar() {
    return [
        {
            text: 'Introduction',
            collapsible: true,
            items: [
                { text: 'Introduction', link: '/introduction/introduction' },
                { text: 'Getting Started', link: '/introduction/getting-started' },
            ],
        },
        {
            text: 'Configuration',
            collapsible: true,
            items: [
                { text: 'Webpack ', link: '/configuration/webpack' },
                { text: 'VSCode ', link: '/configuration/vscode' },
            ],
        },
    ];
}
