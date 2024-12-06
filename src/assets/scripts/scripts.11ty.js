import fs from 'fs';
import path from 'path';
import webpack from 'webpack';
import { fs as mfs } from 'memfs';

const isProd = process.env.ELEVENTY_ENV === 'production';
const ENTRY_FILE_NAME = 'main.js';

export default class {
    // Configure Webpack
    async data() {
        const entryPath = path.resolve(
            path.dirname(new URL(import.meta.url).pathname),
            ENTRY_FILE_NAME
        );
        const outputPath = path.resolve(
            path.dirname(new URL(import.meta.url).pathname),
            '../../memory-fs/js/'
        );

        // Webpack rules for Babel
        const rules = [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: ['@babel/plugin-transform-runtime'],
                    },
                },
            },
        ];

        // Webpack EnvironmentPlugin configuration
        const envPlugin = new webpack.EnvironmentPlugin({
            ELEVENTY_ENV: process.env.ELEVENTY_ENV || 'development', // Default to 'development' if undefined
        });

        // Webpack configuration
        const webpackConfig = {
            mode: isProd ? 'production' : 'development',
            entry: entryPath,
            output: { path: outputPath, filename: ENTRY_FILE_NAME },
            module: { rules },
            plugins: [envPlugin],
            target: 'web', // Explicit target
        };

        return {
            permalink: `/assets/scripts/${ENTRY_FILE_NAME}`,
            eleventyExcludeFromCollections: true,
            webpackConfig,
        };
    }

    // Compile JS with Webpack, write the result to Memory Filesystem
    compile(webpackConfig) {
        const compiler = webpack(webpackConfig);
    
        // Assurez-vous que les systèmes de fichiers sont bien définis
        compiler.outputFileSystem = mfs;
        compiler.inputFileSystem = fs;
        compiler.intermediateFileSystem = mfs;
    
        return new Promise((resolve, reject) => {
            compiler.run((err, stats) => {
                if (err) {
                    console.error('Webpack Error:', err);
                    reject(err);
                    return;
                }
    
                if (stats.hasErrors()) {
                    console.error('Webpack Compilation Errors:', stats.toJson().errors);
                    reject(new Error('Compilation failed'));
                    return;
                }
    
                const outputFile = path.join(webpackConfig.output.path, webpackConfig.output.filename);
    
                // Lecture du fichier généré
                mfs.readFile(outputFile, 'utf8', (readErr, data) => {
                    if (readErr) {
                        console.error('Memory FS Read Error:', readErr);
                        reject(readErr);
                    } else {
                        resolve(data);
                    }
                });
            });
        });
    }
    

    // Render the JS file
    async render({ webpackConfig }) {
        try {
            const result = await this.compile(webpackConfig);
            if (!result) {
                throw new Error('Webpack compile returned empty result.');
            }
            return result;
        } catch (err) {
            console.error('Render Error:', err);
            return ''; // Retourne une chaîne vide pour éviter un crash
        }
    }    
}
