
exports.catchErrors = (fn) => {
    return function (req, res, next) {
        return fn(req, res, next).catch(next);
    };
};

exports.developmentErrors = (err, req, res, next) => {
    err.stack = err.stack || '';
    const errorDetails = {
        message: err.message,
        status: err.status,
        stackHighlighted: err.stack.replace(/[a-z_-\d]+.js:\d+:\d+/gi, '<mark>$&</mark>')
    };

    res.status(err.status || 500);
    res.format({
        'text, html': () => {
            res.render('error', errorDetails);
        },
        'application/json': () => res.json(errorDetails)
    });
    next();
};
