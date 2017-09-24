const path = require('path');
const Generator = require('yeoman-generator');
const extend = require('deep-extend');
const mkdirp = require('mkdirp');

module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);
        this.option('noinstall', {
            desc: 'do not run npm install during setup',
            type: Boolean
        });
        this.option('webpack', {
            desc: 'install webpack for development',
            type: Boolean
        }); // add --webpack flag
        this.option('styles', {
            desc: 'the styling library to install',
            type: String,
            defaults: 'tachyons-sass'
        }) // add --styles flag
        this.option('testing', {
            desc: 'confirm whether to install testing libs or not',
            type: Boolean
        }) // add --testing flag
    }

    initializing() {
        this.input = {};
    }
    prompting() {
        const prompts = [
            {
                type: 'input',
                name: 'username',
                message: 'What\'s your github username',
                store: true
            },
            {
                type: 'input',
                name: 'projectname',
                message: 'Project Name: ',
                default: this.appname
            },
            {
                type: 'input',
                name: 'projectdesc',
                message: 'Project Description: ',
                default: ""
            },
            {
                type: 'input',
                name: 'url',
                message: 'Project URL: ',
                default: ""
            },
            {
                type: 'input',
                name: 'compiletarget',
                message: 'Typescript Compiler Target: ',
                default: 'es5'
            }
        ]
        return this.prompt(prompts).then((answers) => {
            this.input.username = answers.username;
            this.input.compiletarget = answers.compiletarget;
            this.input.projectname = answers.projectname;
            this.input.projectdesc = answers.projectdesc;
            this.input.libvar = answers.projectname.replace(/[^a-zA-Z]/,'');
        })
    }

    default() {
        if (path.basename(this.destinationPath()) !== this.input.projectname) {
            this.log("Creating folder for the new project!");
            mkdirp(this.input.projectname);
            this.destinationRoot(this.destinationPath(this.input.projectname));
        }
    }

    writing() {
        this._writeGitIgnore();
        this._writePackageJson();
        this._writeWebpackConfig();
        this._writeTsConfig();
        this._writeSrcDir();
        this._writeSrcFiles();
    }
    _writeGitIgnore() {
        this.log("Writing .gitignore")
        this.fs.copy(
            this.templatePath('gitignore'),
            this.destinationPath('.gitignore')
        );
    }
    _writePackageJson() {
        this.log("Writing package.json");
        this.fs.copyTpl(
            this.templatePath("_package.json"),
            this.destinationPath("package.json"),
            {
                projname: this.input.projectname,
                projdesc: this.input.projectdesc,
                username: this.input.username,
                stylelib: this.options['styles'],
                includeTesting: this.options['testing']
            }
        )
    }
    _writeWebpackConfig() {
        this.log('Writing webpack.config.ts');
        this.fs.copyTpl(
            this.templatePath('_webpack.config.ts'),
            this.destinationPath('webpack.config.ts'),
            {
                project: this.input.projectname,
                styles: this.options['styles'],
                libvar: this.input.libvar
            }
        );
    }
    _writeTsConfig() {
        this.log("Writing tsconfig.json")
        this.fs.copyTpl(
            this.templatePath('_tsconfig.json'),
            this.destinationPath('tsconfig.json'),
            { target: this.input.compiletarget }
        );
    }
    _writeSrcDir() {
        this.log('Creating src directory');
        mkdirp(this.destinationPath('src'));
    }
    _writeSrcFiles() {
        this.log("Writing src/index.ts")
        this.fs.copy(
            this.templatePath('_index.ts'),
            this.destinationPath('src/index.ts')
        );

        this.log("Writing src/index.html");
        this.fs.copyTpl(
            this.templatePath("_index.html"),
            this.destinationPath("src/index.html"),
            { title: this.input.projectname }
        );
    }

    install() {
        this.log("Installing style library");
        this.npmInstall([this.options['styles']],
            { 'save': true}
        )
        this.installDependencies({
            npm: true,
            bower: false,
            yarn: false,
            skipInstall: this.options['noinstall']
        });

    }
}