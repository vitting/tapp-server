// Hack for livereload. Don't have at definition file
declare module "livereload" {
    export function createServer(): any;
    export function createServer(options: any): any;
}