// PostCSS with PurgeCSS disabled for debugging
module.exports = {
    plugins: {
        // PurgeCSS completely disabled for debugging
        /*
        // '@fullhuman/postcss-purgecss': {
//             content: ['./layouts/ /*.html', './themes/NowUI-Pro/layouts/ /*.html', './content/ /*.html', './content/ /*.md', './assets/js/ /*.jsx'],
//             safelist: {
//               standard: [
//                 /nav-open/,
//                 /badge/,
//                 /badge-/,
//                 /relevance-/,
//                 /algorithm-/,
//                 /ml-prediction/,
//                 /badge-high-relevance/,
//                 /badge-medium-relevance/, 
//                 /badge-low-relevance/,
//                 /algorithm-pubmed-bert/,
//                 /algorithm-lgbm-tfidf/,
//                 /algorithm-lstm/
//               ],
//               greedy: [
//                 /.animate.*/,
//                 /.badge.*/,
//                 /.ml-prediction.*/,
//                 /.relevance.*/,
//                 /.algorithm.*/,
//                 /.ml-.*/,
//               ]
//             },
//             fontFace: false,
//             variables: false
//         },
//         */
//         autoprefixer: {},
//         cssnano: {
//             preset: [
//                 'default',
//                 { 'discardComments': { 'removeAll': true } }
//             ]
//         }
    }
};