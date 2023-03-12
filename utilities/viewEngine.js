module.exports = (app, fs) => {
    function replaceVars(html, varToReplace, replacement) {
        return html.replace(new RegExp(`{${varToReplace}}`), replacement);
    }
    function replaceUnmentioned(html) {
        return html.replace(/{.+}/g,'');
    }

    app.engine('sup', (filePath, options, cb) => {
        fs.readFile(filePath, (err, data) => {
            if (err) return console.log(err);
            var html = data.toString();
            var opts = Object.keys(options);
            opts.splice(opts.indexOf('settings'), 1);
            opts.splice(opts.indexOf('_locals'), 1);
            opts.splice(opts.indexOf('cache'), 1);
            for (let i in opts) {
                html = replaceVars(html, opts[i], options[opts[i]]);
            }
            html = replaceUnmentioned(html);
            return cb(null, html);
        });
    })
}