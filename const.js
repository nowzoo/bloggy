var path = require('path');
var paths =  {
    site: 'site',
    _site: '_site'
};
paths.site_themes = path.join(paths.site, 'themes');

module.exports = {
    paths: paths
};
