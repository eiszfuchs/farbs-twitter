{
    const fs = require('fs');
    const stylus = require('stylus');

    let linkTags = document.querySelectorAll('head link[type="text/stylus"]');

    for (let linkTag of linkTags) {
        let href = linkTag.getAttribute('href');
        let stylusSheet = fs.readFileSync(href, 'utf-8');

        stylus(stylusSheet).render(function (error, cssSheet) {
            if (error) {
                console.error(error);

                return;
            }

            let styleTag = document.createElement('style');
            styleTag.innerText = cssSheet;

            document.head.appendChild(styleTag);
        });
    }
}
