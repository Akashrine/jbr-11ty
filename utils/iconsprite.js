import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import glob from 'glob';
import File from 'vinyl';
import SVGSpriter from 'svg-sprite';

const cwd = path.resolve('src/assets/icons');
const spriteConfig = {
    mode: {
        inline: true,
        symbol: {
            sprite: 'sprite.svg',
            example: false,
        },
    },
    shape: {
        transform: ['svgo'],
        id: {
            generator: 'icon-%s',
        },
    },
    svg: {
        xmlDeclaration: false,
        doctypeDeclaration: false,
    },
};

export default async function generateSprite() {
    // Make a new SVGSpriter instance with configuration
    const spriter = new SVGSpriter(spriteConfig);

    // Wrap spriter compile function in a Promise
    const compileSprite = async (args) => {
        return new Promise((resolve, reject) => {
            spriter.compile(args, (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result.symbol.sprite);
            });
        });
    };

    // Get all SVG icon files in working directory
    const getFiles = promisify(glob);
    const files = await getFiles('**/*.svg', { cwd: cwd });

    // Add them all to the spriter
    files.forEach(function (file) {
        spriter.add(
            new File({
                path: path.join(cwd, file),
                base: cwd,
                contents: fs.readFileSync(path.join(cwd, file)),
            })
        );
    });

    // Compile the sprite file and return it as a string
    const sprite = await compileSprite(spriteConfig.mode);
    const spriteContent = sprite.contents.toString('utf8');
    return spriteContent;
}
