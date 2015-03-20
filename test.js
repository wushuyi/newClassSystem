dust.render('classSessionView', data, function (err, out) {
    if (err) {
        deferred.reject(err);
    } else {
        deferred.resolve(out);
    }
});