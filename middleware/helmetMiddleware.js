module.exports = (app, helmet) => {
    app.use(helmet({
        hidePoweredBy: true,
        frameguard: { action: 'deny' },
        xssFilter: true,
        noSniff: true,
        ieNoOpen: true,
         contentSecurityPolicy: {
           directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                styleSrc: ["'self'"]
            }
        },
        crossOriginOpenerPolicy: { policy: "unsafe-none" }, // Remove in production
        hsts: false,
        expectCt: false,
        crossOriginEmbedderPolicy: false
    }))
}