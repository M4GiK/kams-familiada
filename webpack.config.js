const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const devMode = process.env.NODE_ENV !== 'production';

module.exports = {
    mode: devMode ? 'development' : 'production',
    entry: ['./src/scripts/main.ts', './src/styles/main.scss'],
    output: {
        path: path.resolve(__dirname, 'public'),
        publicPath: './',
        filename: 'assets/scripts/bundle.js',
        clean: false
    },
    resolve: {
        extensions: ['.ts', '.js', '.json']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: 'ts-loader'
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 2,
                            url: false
                        }
                    },
                    'postcss-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                            api: 'modern',
                            sassOptions: {
                                silenceDeprecations: ['import', 'legacy-js-api']
                            }
                        }
                    }
                ]
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/images/[name][ext]',
                    emit: false
                }
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'assets/fonts/[name][ext]',
                    emit: false
                }
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'assets/styles/main.css'
        })
    ],
    watchOptions: {
        ignored: /node_modules/,
        poll: 1000
    }
};