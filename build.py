"""Build a single-file preview (dist/invite.html) with CSS, JS and image inlined.
Usage: python3 build.py
Deploy the folder as-is to GitHub Pages (index.html + css/ js/ assets/)."""
import base64, pathlib
r = pathlib.Path(__file__).parent
html = (r / 'index.html').read_text()
css = (r / 'css/style.css').read_text()
js = (r / 'js/app.js').read_text()
img = 'data:image/jpeg;base64,' + base64.b64encode((r / 'assets/art.jpg').read_bytes()).decode()
css = css.replace('../assets/art.jpg', img)
html = html.replace('<link rel="stylesheet" href="css/style.css">', '<style>' + css + '</style>')
html = html.replace('<script src="js/app.js"></script>', '<script>' + js + '</script>')
(r / 'dist').mkdir(exist_ok=True)
(r / 'dist/invite.html').write_text(html)
print('built dist/invite.html', len(html) // 1024, 'KB')
