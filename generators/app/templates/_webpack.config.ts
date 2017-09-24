import * as webpack from 'webpack';
import * as path from 'path';
import * as HtmlWebpackPlugin  from "html-webpack-plugin";
import * as ExtractTextPlugin  from "extract-text-webpack-plugin";

const CleanWebpackPlugin: any = require("clean-webpack-plugin");

const extractSass = new ExtractTextPlugin({
    filename: "[name].[contenthash].css",
    disable: process.env.NODE_ENV === "development"
});
declare var __dirname: any;

const config: webpack.Configuration = {
    entry: {
        index: path.resolve(__dirname, "src", "index.ts")
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: extractSass.extract({
                    use: [
                        {
                            loader: "css-loader",
                            options: {
                                sourceMap: true,
                                importLoaders: 1
                            }
                        },
                        {
                            loader: "sass-loader",
                            options: {
                                sourceMap: true,
                                includePaths: [
                                    path.resolve("./node_modules/<%= styles %>")
                                ]
                            }
                        }
                    ],
                    fallback: "style-loader"
                }),
                exclude: /node_modules/
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        extractSass,
        new CleanWebpackPlugin( ['dist'], { verbose: true }),
        new HtmlWebpackPlugin({
            title: "<%= project %>",
            template: "./src/index.html",
            favicon: "",
            cache: true,
            mobile: true
        })
    ],
    devtool: "inline-source-map",
    devServer: {
        contentBase: "./dist"
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        library: "<%= libvar %>",
        libraryTarget: "umd",
        umdNamedDefine: true
    }
};

export default config;