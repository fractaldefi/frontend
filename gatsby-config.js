module.exports = {
    siteMetadata: {
        title: 'FractalDefi'
    },
    plugins: [
        {
            resolve: 'gatsby-plugin-page-creator',
            options: {
                path: `${__dirname}/src/pages`
            }
        },
        'gatsby-plugin-typescript',
        'gatsby-plugin-styled-components'
    ]
};
