declare module '@nuxt/friendly-errors-webpack-plugin' {
    import { Plugin, Compiler } from 'webpack';

    declare class FriendlyErrorsWebpackPlugin extends Plugin {
        constructor(options?: FriendlyErrorsWebpackPlugin.Options);

        apply(compiler: Compiler): void;
    }

    declare namespace FriendlyErrorsWebpackPlugin {
        enum Severity {
            Error = 'error',
            Warning = 'warning',
        }

        interface Options {
            compilationSuccessInfo?: {
                messages: string[];
                notes: string[];
            };
            onErrors?(severity: Severity, errors: string): void;
            clearConsole?: boolean;
            additionalFormatters?: Array<(errors: WebpackError[], type: Severity) => string[]>;
            additionalTransformers?: Array<(error: any) => any>;
        }

        interface WebpackError {
            message: string;
            file: string;
            origin: string;
            name: string;
            severity: Severity;
            webpackError: any;
        }
    }

    export = FriendlyErrorsWebpackPlugin;
}

declare module 'jsxbin' {
    async function jsxbin(inputPath: string | string[], outputPath: string);
    export = jsxbin;
}
