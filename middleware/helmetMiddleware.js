module.exports = (app, helmet) => {
    app.use(helmet({
        hidePoweredBy: true,
        frameguard: { action: 'deny' },
        xssFilter: true,
        noSniff: true,
        ieNoOpen: true,
        hsts: { maxAge: 90*24*60*60 },
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"]
            }
        }
    }))
}