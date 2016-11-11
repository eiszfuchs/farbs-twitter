{
    const fs = require('fs');
    const stylus = require('stylus');

    let renderTimeout = null;

    const render = function (filename, styleTag) {
        window.clearTimeout(renderTimeout);

        renderTimeout = window.setTimeout(function () {
            let stylusSheet = fs.readFileSync(filename, 'utf-8');

            stylus(stylusSheet).render(function (error, cssSheet) {
                if (error) {
                    console.error(error);

                    return;
                }

                styleTag.textContent = cssSheet;
            });
        }, 100);
    };

    let linkTags = document.querySelectorAll('head link[type="text/stylus"]');

    for (let linkTag of linkTags) {
        let href = linkTag.getAttribute('href');
        let styleTag = document.createElement('style');

        document.head.appendChild(styleTag);

        fs.watch(href, function (eventType, filename) {
            if (eventType === 'change') {
                render(href, styleTag);
            }
        });

        render(href, styleTag);
    }
}
